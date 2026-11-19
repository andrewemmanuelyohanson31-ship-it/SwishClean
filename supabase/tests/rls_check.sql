-- RLS + trigger check. Run with the Supabase MCP execute_sql tool (needs approval).
-- It impersonates 2 customers + 1 mitra, then raises 'QCRESULT [json]' so EVERYTHING rolls back.
-- Expect every item ok=true except 'booking in the past rejected' (calendar is fixed to Oct 2026).
-- RLS QC: impersonates customers A/B and mitra M, records each result, then raises an
-- exception carrying the results so the whole transaction rolls back (nothing is left in the DB).
create temp table qc (name text, ok boolean, info text);

create function pg_temp.t(uid uuid, q text, want text, name text) returns void language plpgsql as $f$
declare n bigint; info text;
begin
  begin
    if uid is null then
      execute 'set local role anon';
      perform set_config('request.jwt.claims', '{"role":"anon"}', true);
    else
      execute 'set local role authenticated';
      perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
    end if;
    if q ~* '^\s*select' then execute q into n; else execute q; get diagnostics n = row_count; end if;
    execute 'reset role';
    info := n || ' rows';
  exception when others then
    n := -1; info := sqlerrm;
  end;
  insert into qc values (name, case want when 'ok' then n >= 1 else n <= 0 end, info);
end $f$;

do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); m uuid := gen_random_uuid();
  o_active uuid; o_done uuid;
begin
  insert into auth.users (id, instance_id, aud, role, phone, raw_user_meta_data, created_at, updated_at) values
    (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '6289900000001', '{"role":"pelanggan"}', now(), now()),
    (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '6289900000002', '{"role":"pelanggan"}', now(), now()),
    (m, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '6289900000003', '{"role":"mitra"}', now(), now());
  insert into qc select 'signup trigger creates profiles with roles', count(*) = 3 and bool_and(role = case when id = m then 'mitra' else 'pelanggan' end), string_agg(role, ',')
    from public.profiles where id in (a, b, m);

  insert into public.arts (id, user_id, name, initials, price_per_hour) values ('qc-art', m, 'QC Mitra', 'QM', 40000);
  insert into public.orders (id, code, customer_id, art_id, scheduled_on, start_time, minutes, service, total, status)
    values (gen_random_uuid(), 'QC-DONE', a, 'qc-art', '2026-10-10', '09.00', 180, 'Bersih Rutin', 117000, 'selesai') returning id into o_done;

  -- profile
  perform pg_temp.t(a, format('select count(*) from public.profiles where id = %L', a), 'ok', 'customer reads own profile');
  perform pg_temp.t(a, format('update public.profiles set role = %L where id = %L', 'mitra', a), 'none', 'customer cannot change own role');
  perform pg_temp.t(a, format('update public.profiles set name = %L where id = %L', 'QC', a), 'ok', 'customer edits own name');
  perform pg_temp.t(m, format('select count(*) from public.profiles where id = %L', a), 'none', 'mitra cannot read customer profiles');

  -- orders: create
  perform pg_temp.t(a, $q$insert into public.orders (code, art_id, scheduled_on, start_time, minutes, addons, service, total, art_pay) values ('QC-A1', 'siti', '2026-10-27', '09.00', 240, '{setrika}', 'Bersih Rutin', 162000, 999)$q$, 'ok', 'customer creates order');
  select id into o_active from public.orders where code = 'QC-A1';
  perform pg_temp.t(a, format('select count(*) from public.orders where code = %L and art_pay = 165000', 'QC-A1'), 'ok', 'server sets ART pay (ignores client value 999)');
  perform pg_temp.t(a, $q$insert into public.orders (code, art_id, scheduled_on, start_time, minutes, service, total) values ('QC-A8', 'siti', '2026-10-27', '13.00', 180, 'x', 132000)$q$, 'ok', 'back-to-back booking (13.00 after 09.00–13.00) allowed');
  perform pg_temp.t(a, $q$insert into public.orders (code, art_id, scheduled_on, start_time, minutes, service, total) values ('QC-M1', 'qc-art', '2026-10-28', '09.00', 180, 'x', 117000)$q$, 'ok', 'customer books the mitra''s ART');
  perform pg_temp.t(a, $q$insert into public.orders (code, art_id, scheduled_on, start_time, minutes, service, total, status) values ('QC-A2', 'siti', '2026-10-27', '09.00', 240, 'x', 162000, 'selesai')$q$, 'none', 'cannot create an already-finished order');
  perform pg_temp.t(a, $q$insert into public.orders (code, art_id, scheduled_on, start_time, minutes, service, total) values ('QC-A3', 'siti', '2026-10-30', '09.00', 240, 'x', 1000)$q$, 'none', 'server rejects tampered price (Rp1.000 for 4 jam)');
  perform pg_temp.t(a, $q$insert into public.orders (code, art_id, scheduled_on, start_time, minutes, service, total) values ('QC-A4', 'siti', '2020-01-01', '09.00', 180, 'x', 132000)$q$, 'none', 'booking in the past rejected');
  perform pg_temp.t(a, $q$insert into public.orders (code, art_id, scheduled_on, start_time, minutes, service, total) values ('QC-A5', 'nobody', '2026-10-27', '09.00', 240, 'x', 162000)$q$, 'none', 'order for unknown ART rejected');
  perform pg_temp.t(a, $q$insert into public.orders (code, art_id, scheduled_on, start_time, minutes, service, total) values ('QC-A1', 'siti', '2026-10-27', '09.00', 240, 'x', 162000)$q$, 'none', 'duplicate order code rejected');
  perform pg_temp.t(a, format($q$insert into public.orders (code, customer_id, art_id, scheduled_on, start_time, minutes, service, total) values ('QC-A6', %L, 'siti', '2026-10-27', '09.00', 240, 'x', 162000)$q$, b), 'none', 'cannot create an order in someone else''s name');
  perform pg_temp.t(a, $q$insert into public.orders (code, art_id, scheduled_on, start_time, minutes, service, total) values ('QC-A7', 'siti', '2026-10-27', '11.00', 180, 'x', 132000)$q$, 'none', 'double-booking same ART + slot rejected');

  -- orders: update
  perform pg_temp.t(a, $q$update public.orders set scheduled_on = '2026-10-28', start_time = '10.00' where code = 'QC-A1'$q$, 'ok', 'customer reschedules active order');
  perform pg_temp.t(a, $q$update public.orders set status = 'selesai' where code = 'QC-A1'$q$, 'none', 'customer cannot mark order finished');
  perform pg_temp.t(a, $q$update public.orders set total = 1 where code = 'QC-A1'$q$, 'none', 'customer cannot change price after booking');
  perform pg_temp.t(a, $q$update public.orders set art_id = 'dewi' where code = 'QC-A1'$q$, 'none', 'customer cannot swap ART after booking');
  perform pg_temp.t(b, format('select count(*) from public.orders where customer_id = %L', a), 'none', 'B cannot see A''s orders');
  perform pg_temp.t(b, $q$update public.orders set status = 'dibatalkan' where code = 'QC-A1'$q$, 'none', 'B cannot cancel A''s order');
  perform pg_temp.t(a, $q$delete from public.orders where code = 'QC-A1'$q$, 'none', 'customer cannot delete orders');

  -- chat
  perform pg_temp.t(a, format('insert into public.messages (order_id, body) values (%L, %L)', o_active, 'Halo'), 'ok', 'customer chats on own order');
  perform pg_temp.t(b, format('select count(*) from public.messages where order_id = %L', o_active), 'none', 'B cannot read A''s chat');
  perform pg_temp.t(b, format('insert into public.messages (order_id, body) values (%L, %L)', o_active, 'spam'), 'none', 'B cannot post in A''s chat');
  perform pg_temp.t(a, format('insert into public.messages (order_id, body) values (%L, %L)', o_active, ''), 'none', 'empty chat message rejected');

  -- cancel / reopen
  perform pg_temp.t(a, $q$update public.orders set status = 'dibatalkan' where code = 'QC-A1'$q$, 'ok', 'customer cancels active order');
  perform pg_temp.t(a, $q$update public.orders set status = 'aktif' where code = 'QC-A1'$q$, 'none', 'cancelled order cannot be reopened');
  perform pg_temp.t(a, $q$update public.orders set scheduled_on = '2026-10-29' where code = 'QC-A1'$q$, 'none', 'cancelled order cannot be rescheduled');

  -- reviews / complaints
  perform pg_temp.t(a, format('insert into public.reviews (order_id, art_id, rating) values (%L, %L, 5)', o_active, 'siti'), 'none', 'cannot review an unfinished order');
  perform pg_temp.t(a, format('insert into public.reviews (order_id, art_id, rating) values (%L, %L, 6)', o_done, 'qc-art'), 'none', 'rating above 5 rejected');
  perform pg_temp.t(a, format('insert into public.reviews (order_id, art_id, rating, comment) values (%L, %L, 5, %L)', o_done, 'qc-art', 'Bagus'), 'ok', 'customer reviews finished order');
  perform pg_temp.t(a, format('insert into public.reviews (order_id, art_id, rating) values (%L, %L, 1)', o_done, 'qc-art'), 'none', 'second review of same order rejected');
  perform pg_temp.t(b, format('insert into public.reviews (order_id, art_id, rating) values (%L, %L, 1)', o_done, 'qc-art'), 'none', 'B cannot review A''s order');
  perform pg_temp.t(a, format('update public.orders set reviewed = true where id = %L', o_done), 'ok', 'flag reviewed on finished order');
  perform pg_temp.t(a, format('update public.orders set status = %L where id = %L', 'dibatalkan', o_done), 'none', 'finished order cannot be cancelled');
  perform pg_temp.t(a, format('insert into public.complaints (order_id, reason) values (%L, %L)', o_done, 'Kurang bersih'), 'ok', 'customer complains about own order');
  perform pg_temp.t(b, format('insert into public.complaints (order_id, reason) values (%L, %L)', o_done, 'x'), 'none', 'B cannot complain about A''s order');
  perform pg_temp.t(null, 'select count(id) from public.reviews', 'ok', 'reviews are public');
  perform pg_temp.t(null, 'select count(*) from public.reviews where customer_id is not null', 'none', 'public reviews hide the reviewer id');

  -- addresses, favorites, notifications, payouts
  perform pg_temp.t(a, $q$insert into public.addresses (label, detail) values ('Rumah', 'Jl. QC 1')$q$, 'ok', 'customer saves address');
  perform pg_temp.t(b, format('select count(*) from public.addresses where user_id = %L', a), 'none', 'B cannot see A''s addresses');
  perform pg_temp.t(a, $q$insert into public.favorites (art_id) values ('rina')$q$, 'ok', 'customer favorites an ART');
  perform pg_temp.t(a, format('insert into public.notifications (user_id, kind, title) values (%L, %L, %L)', a, 'promo', 'fake'), 'none', 'customer cannot create notifications');
  perform pg_temp.t(a, 'insert into public.payouts (amount) values (100000)', 'none', 'customer cannot request payout');

  -- mitra
  perform pg_temp.t(m, 'select count(*) from public.orders', 'ok', 'mitra sees orders assigned to them');
  perform pg_temp.t(m, $q$select count(*) from public.orders where art_id = 'siti'$q$, 'none', 'mitra cannot see other ARTs'' orders');
  perform pg_temp.t(m, format('select count(*) from public.messages m join public.orders o on o.id = m.order_id where o.id = %L', o_active), 'none', 'mitra cannot read chats of other ARTs');
  perform pg_temp.t(m, format('update public.orders set total = 999999 where id = %L', o_done), 'none', 'mitra cannot change order price');
  perform pg_temp.t(m, format('update public.orders set status = %L where id = %L', 'aktif', o_done), 'none', 'mitra cannot reopen a finished order');
  perform pg_temp.t(m, $q$update public.arts set rating = 5.0, price_per_hour = 1000000 where id = 'qc-art'$q$, 'none', 'mitra cannot edit own rating/price');
  perform pg_temp.t(m, $q$update public.arts set user_id = auth.uid() where id = 'siti'$q$, 'none', 'mitra cannot claim another ART profile');
  perform pg_temp.t(m, $q$insert into public.mitra_applications (user_id, name) values (auth.uid(), 'QC Mitra')$q$, 'ok', 'mitra submits application');
  perform pg_temp.t(m, $q$update public.mitra_applications set status = 'disetujui'$q$, 'none', 'mitra cannot self-approve');
  perform pg_temp.t(m, $q$update public.orders set status = 'selesai' where code = 'QC-M1'$q$, 'ok', 'mitra marks assigned job finished');
  perform pg_temp.t(m, $q$update public.orders set scheduled_on = '2026-10-29' where code = 'QC-M1'$q$, 'none', 'mitra cannot reschedule');
  perform pg_temp.t(m, 'insert into public.payouts (amount) values (999999999)', 'none', 'payout above earnings rejected');
  perform pg_temp.t(m, 'insert into public.payouts (amount) values (200000)', 'ok', 'payout within earnings (Rp240.000) allowed');
  perform pg_temp.t(m, 'insert into public.payouts (amount) values (50000)', 'none', 'second payout beyond remaining Rp40.000 rejected');
  perform pg_temp.t(a, $q$insert into public.mitra_applications (user_id, name) values (auth.uid(), 'Not a mitra')$q$, 'none', 'customer cannot file a mitra application');
  perform pg_temp.t(a, $q$insert into public.mitra_settings (user_id) values (auth.uid())$q$, 'none', 'customer cannot create mitra settings');

  -- anon
  perform pg_temp.t(null, 'select count(*) from public.orders', 'none', 'logged-out user sees no orders');
  perform pg_temp.t(null, 'select count(*) from public.arts', 'ok', 'logged-out user sees ART catalog');
  perform pg_temp.t(null, $q$insert into public.arts (id, name, initials, price_per_hour) values ('hack', 'x', 'X', 1)$q$, 'none', 'logged-out user cannot add ARTs');

  raise exception 'QCRESULT %', (select json_agg(json_build_object('ok', ok, 'name', name, 'info', info)) from qc);
end $$;
