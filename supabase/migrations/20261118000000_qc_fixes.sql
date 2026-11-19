-- QC fixes 2026-11-18: server-side price check, no double booking, payout balance check,
-- mitra status rules, mitra-only tables, private reviewer ids, address/customer snapshot on orders.

-- ---------- orders: what the mitra needs to do the job ----------
alter table public.orders
  add column address text not null default '',
  add column customer_name text not null default '',
  add column home_desc text not null default '',
  add column art_pay int not null default 0;  -- ART wage (set by price_order, never by the client)

-- ---------- price is computed on the server ----------
-- Mirrors src/data/order.ts quote(): base hours × ART rate + add-ons + service fee − promo.
-- shortcut: promo PERTAMA is applied to every order like the app does; check "first order only" when promos go live.
create function public.price_order() returns trigger
language plpgsql set search_path = '' as $$
declare rate int; add_min int := 0; add_price int := 0; base_min int; a text;
begin
  select price_per_hour into rate from public.arts where id = new.art_id and active;
  if rate is null then raise exception 'ART % tidak tersedia', new.art_id using errcode = '23503'; end if;
  foreach a in array new.addons loop
    case a
      when 'setrika' then add_min := add_min + 60; add_price := add_price + 30000;
      when 'kulkas'  then add_min := add_min + 30; add_price := add_price + 25000;
      when 'jendela' then add_min := add_min + 30; add_price := add_price + 20000;
      else raise exception 'add-on % tidak dikenal', a using errcode = '22023';
    end case;
  end loop;
  base_min := new.minutes - add_min;
  if base_min < 120 or base_min % 30 <> 0 then
    raise exception 'durasi tidak valid (%)', new.minutes using errcode = '22023';
  end if;
  new.art_pay := base_min * rate / 60 + add_price;
  if new.total <> new.art_pay + 12000 - 15000 then
    raise exception 'harga tidak sesuai: seharusnya %', new.art_pay + 12000 - 15000 using errcode = '22023';
  end if;
  return new;
end $$;
revoke execute on function public.price_order() from public, anon, authenticated;
create trigger price_order before insert on public.orders for each row execute function public.price_order();

-- ---------- one ART cannot be booked twice for overlapping times ----------
-- security definer: a customer can't see other customers' orders through RLS, but the check must.
create function public.no_double_booking() returns trigger
language plpgsql security definer set search_path = '' as $$
declare s time := replace(new.start_time, '.', ':')::time;
begin
  if new.status <> 'aktif' then return new; end if;
  perform pg_advisory_xact_lock(hashtext(new.art_id || new.scheduled_on::text)); -- serialize same ART + day
  if exists (
    select 1 from public.orders o
    where o.art_id = new.art_id and o.status = 'aktif' and o.id <> new.id and o.scheduled_on = new.scheduled_on
      and (replace(o.start_time, '.', ':')::time, replace(o.start_time, '.', ':')::time + o.minutes * interval '1 minute')
          overlaps (s, s + new.minutes * interval '1 minute')
  ) then
    raise exception 'jadwal ART sudah terisi pada jam itu' using errcode = '23P01';
  end if;
  return new;
end $$;
revoke execute on function public.no_double_booking() from public, anon, authenticated;
create trigger no_double_booking before insert or update of scheduled_on, start_time, status on public.orders
  for each row execute function public.no_double_booking();

-- ---------- status rules for customer AND mitra (trigger sees old + new) ----------
create or replace function public.guard_closed_order() returns trigger
language plpgsql set search_path = '' as $$
declare
  sched_changed boolean := (new.scheduled_on, new.start_time) is distinct from (old.scheduled_on, old.start_time);
  status_changed boolean := new.status is distinct from old.status;
begin
  if auth.uid() = old.customer_id then
    -- customer: may only cancel an active order; closed orders only get review/complaint flags
    if (status_changed and not (old.status = 'aktif' and new.status = 'dibatalkan')) or (old.status <> 'aktif' and sched_changed) then
      raise exception 'order %: not allowed for customer', old.code using errcode = '42501';
    end if;
  elsif exists (select 1 from public.arts a where a.id = old.art_id and a.user_id = auth.uid()) then
    -- mitra: may finish or cancel an active order, never reschedule or reopen
    if sched_changed or (status_changed and not (old.status = 'aktif' and new.status in ('selesai', 'dibatalkan')))
       or new.reviewed is distinct from old.reviewed or new.complained is distinct from old.complained then
      raise exception 'order %: not allowed for mitra', old.code using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

-- ---------- payouts can't exceed earnings ----------
create function public.check_payout() returns trigger
language plpgsql security definer set search_path = '' as $$
declare earned bigint; paid bigint;
begin
  perform pg_advisory_xact_lock(hashtext('payout' || new.user_id::text)); -- two requests at once can't both pass
  select coalesce(sum(o.art_pay), 0) into earned
    from public.orders o join public.arts a on a.id = o.art_id
    where a.user_id = new.user_id and o.status = 'selesai';
  select coalesce(sum(amount), 0) into paid from public.payouts where user_id = new.user_id and status <> 'gagal';
  if new.amount > earned - paid then
    raise exception 'saldo tidak cukup (tersedia %)', earned - paid using errcode = '23514';
  end if;
  return new;
end $$;
revoke execute on function public.check_payout() from public, anon, authenticated;
create trigger check_payout before insert on public.payouts for each row execute function public.check_payout();

-- ---------- mitra-only tables need a mitra profile ----------
create function public.is_mitra() returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'mitra')
$$;
revoke execute on function public.is_mitra() from public, anon;

drop policy "own settings" on public.mitra_settings;
create policy "own settings" on public.mitra_settings for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_mitra());
drop policy "own application create" on public.mitra_applications;
create policy "own application create" on public.mitra_applications for insert
  with check (user_id = auth.uid() and status = 'review' and public.is_mitra());

-- ---------- public reviews don't reveal who wrote them ----------
revoke select on public.reviews from anon, authenticated;
grant select (id, art_id, rating, comment, created_at) on public.reviews to anon, authenticated;
