-- SwishClean database: tables, row-level security (RLS), private KYC storage, seed ARTs.
-- Run once: Supabase dashboard → SQL Editor → paste & Run  (or `npx supabase db push`).
-- Every table has RLS on. The app only holds the publishable key, so these policies ARE the access control.

-- ---------- profiles (one per auth user) ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'pelanggan' check (role in ('pelanggan', 'mitra')),
  name text not null default '',
  phone text,
  email text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select using (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- Users may edit name/email only; role and phone are set by the signup trigger.
revoke update on public.profiles from authenticated, anon;
grant update (name, email) on public.profiles to authenticated;

-- Create the profile when someone signs up. Role comes from signInWithOtp({ options: { data: { role } } }).
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, role, phone)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' = 'mitra' then 'mitra' else 'pelanggan' end,
    new.phone
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- arts (housecleaners, public catalog) ----------
create table public.arts (
  id text primary key,                          -- slug, e.g. 'siti'
  user_id uuid unique references auth.users on delete set null, -- the mitra account, once linked
  name text not null,
  initials text not null,
  color text not null default '#BFE3DC',
  rating numeric(2,1) not null default 0,
  reviews int not null default 0,
  years int not null default 0,
  distance_km numeric(4,1) not null default 0,  -- shortcut: fixed sample distance; compute from addresses + PostGIS later
  tags text[] not null default '{}',
  price_per_hour int not null check (price_per_hour > 0),
  jobs int, on_time int, about text, skills text[], languages text, hours text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.arts enable row level security;
create policy "anyone reads active arts" on public.arts for select using (active);
-- No insert/update policy: only the service role (future admin "add ART" screen / dashboard) can write.

-- ---------- mitra settings & signup ----------
create table public.mitra_settings (
  user_id uuid primary key references auth.users on delete cascade,
  online boolean not null default true,
  days text[] not null default '{Sen,Sel,Rab,Kam,Jum,Sab}',
  start_time text not null default '07.00',
  end_time text not null default '16.00',
  max_jobs int not null default 2 check (max_jobs between 1 and 5),
  leaves date[] not null default '{}'
);
alter table public.mitra_settings enable row level security;
create policy "own settings" on public.mitra_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.mitra_applications (
  user_id uuid primary key references auth.users on delete cascade,
  name text not null,
  ktp_path text,   -- object path in the private 'kyc' bucket
  face_path text,
  status text not null default 'review' check (status in ('review', 'disetujui', 'ditolak')),
  created_at timestamptz not null default now()
);
alter table public.mitra_applications enable row level security;
create policy "own application read" on public.mitra_applications for select using (user_id = auth.uid());
create policy "own application create" on public.mitra_applications for insert with check (user_id = auth.uid() and status = 'review');

-- ---------- customer data ----------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  label text not null, detail text not null, area text not null default ''
);
alter table public.addresses enable row level security;
create policy "own addresses" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  art_id text not null references public.arts on delete cascade,
  primary key (user_id, art_id)
);
alter table public.favorites enable row level security;
create policy "own favorites" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- orders ----------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_id uuid not null default auth.uid() references auth.users on delete cascade,
  art_id text not null references public.arts,
  scheduled_on date not null,
  start_time text not null check (start_time ~ '^\d{2}\.\d{2}$'),
  minutes int not null check (minutes between 60 and 720),
  addons text[] not null default '{}',
  service text not null,
  total int not null check (total > 0), -- shortcut: price comes from the app; recompute in an Edge Function before taking real payments
  status text not null default 'aktif' check (status in ('aktif', 'selesai', 'dibatalkan')),
  reviewed boolean not null default false,
  complained boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.orders (customer_id);
create index on public.orders (art_id);
alter table public.orders enable row level security;
create policy "customer reads own orders" on public.orders for select using (customer_id = auth.uid());
create policy "customer creates orders" on public.orders for insert with check (customer_id = auth.uid() and status = 'aktif');
-- A customer can reschedule, cancel and flag review/complaint, but never mark an order 'selesai'.
create policy "customer updates own orders" on public.orders for update
  using (customer_id = auth.uid()) with check (customer_id = auth.uid() and status in ('aktif', 'dibatalkan'));
create policy "mitra reads assigned orders" on public.orders for select
  using (art_id in (select id from public.arts where user_id = auth.uid()));
create policy "mitra updates assigned orders" on public.orders for update
  using (art_id in (select id from public.arts where user_id = auth.uid()))
  with check (art_id in (select id from public.arts where user_id = auth.uid()));
revoke update on public.orders from authenticated, anon;
grant update (scheduled_on, start_time, status, reviewed, complained) on public.orders to authenticated;

-- ---------- reviews, complaints, chat, notifications, payouts ----------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders on delete cascade,
  customer_id uuid not null default auth.uid() references auth.users on delete cascade,
  art_id text not null references public.arts,
  rating int not null check (rating between 1 and 5),
  comment text not null default '' check (length(comment) <= 1000),
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "anyone reads reviews" on public.reviews for select using (true);
create policy "review own finished order" on public.reviews for insert with check (
  customer_id = auth.uid()
  and exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid() and o.art_id = reviews.art_id and o.status = 'selesai')
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  customer_id uuid not null default auth.uid() references auth.users on delete cascade,
  reason text not null,
  detail text not null default '' check (length(detail) <= 2000),
  photo_paths text[] not null default '{}',
  status text not null default 'baru' check (status in ('baru', 'diproses', 'selesai')),
  created_at timestamptz not null default now()
);
alter table public.complaints enable row level security;
create policy "own complaints read" on public.complaints for select using (customer_id = auth.uid());
create policy "complain own order" on public.complaints for insert with check (
  customer_id = auth.uid() and status = 'baru'
  and exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
);

-- One chat thread per order; only its customer and its mitra can read/write.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index on public.messages (order_id, created_at);
alter table public.messages enable row level security;
create function public.in_order_thread(oid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.orders o left join public.arts a on a.id = o.art_id
    where o.id = oid and (o.customer_id = auth.uid() or a.user_id = auth.uid())
  )
$$;
create policy "thread members read" on public.messages for select using (public.in_order_thread(order_id));
create policy "thread members send" on public.messages for insert with check (sender_id = auth.uid() and public.in_order_thread(order_id));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  kind text not null check (kind in ('order', 'promo', 'chat', 'reminder')),
  title text not null, body text not null default '', href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "own notifications read" on public.notifications for select using (user_id = auth.uid());
create policy "own notifications mark read" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.notifications from authenticated, anon;
grant update (read) on public.notifications to authenticated;
-- Inserts come from the server (service role / triggers) only.

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  amount int not null check (amount >= 50000),
  status text not null default 'diproses' check (status in ('diproses', 'berhasil', 'gagal')),
  created_at timestamptz not null default now()
);
alter table public.payouts enable row level security;
create policy "own payouts read" on public.payouts for select using (user_id = auth.uid());
-- shortcut: no balance check here; request payouts through an Edge Function that checks earnings before going live.
create policy "mitra requests payout" on public.payouts for insert with check (
  user_id = auth.uid() and status = 'diproses'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'mitra')
);

-- ---------- private storage for KTP / selfie photos ----------
insert into storage.buckets (id, name, public) values ('kyc', 'kyc', false) on conflict (id) do nothing;
-- Files live at kyc/<user id>/<file>; only that user can upload/read them (admins use the service role).
create policy "own kyc upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own kyc read" on storage.objects for select to authenticated
  using (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- seed: the ARTs from the design (src/data/arts.ts) ----------
insert into public.arts (id, name, initials, color, rating, reviews, years, distance_km, tags, price_per_hour, jobs, on_time, about, skills, languages, hours) values
  ('siti', 'Siti Rahmawati', 'SR', '#F6C9A8', 4.9, 128, 6, 1.2, '{Bersih Rutin,Setrika}', 45000, 412, 98,
   'Sudah 6 tahun membantu keluarga di Tangerang. Teliti di dapur dan kamar mandi, terbiasa dengan kucing dan anjing.',
   '{Bersih Rutin,Setrika,Ramah Hewan}', 'Indonesia, Jawa', 'Sen–Sab, 07.00–16.00'),
  ('dewi', 'Dewi Lestari', 'DL', '#BFE3DC', 4.8, 96, 4, 2.0, '{Bersih Mendalam,Dapur}', 42000, null, null, null, null, null, null),
  ('rina', 'Rina Marlina', 'RM', '#F8D98F', 4.9, 74, 3, 2.8, '{Bersih Rutin,Ramah Hewan}', 40000, null, null, null, null, null, null),
  ('sri', 'Sri Wahyuni', 'SW', '#CFD8F6', 4.7, 152, 8, 3.1, '{Pindahan,Bersih Mendalam}', 50000, null, null, null, null, null, null),
  ('nur', 'Nur Aini', 'NA', '#F5C1C9', 4.8, 61, 5, 2.4, '{Bersih Rutin,Setrika}', 38000, null, null, null, null, null, null);
