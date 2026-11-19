-- Pricing QC 2026-11-19 (all 920 UI-reachable price combos matched the app; these fix the remaining gaps):
-- 1. Jobs over 12 jam or past 24.00 got a raw check-constraint error -> clear message, same rule as order.ts jobTooLong.
-- 2. no_double_booking used `time + interval`, which wraps at midnight (15.00 + 10 jam = 01.00) and made
--    OVERLAPS swap the ends. Compare plain minutes-since-midnight instead.

create or replace function public.price_order() returns trigger
language plpgsql set search_path = '' as $$
declare rate int; add_min int := 0; add_price int := 0; base_min int; a text;
  start_min int := split_part(new.start_time, '.', 1)::int * 60 + split_part(new.start_time, '.', 2)::int;
begin
  if new.minutes > 720 or start_min + new.minutes > 1440 then
    raise exception 'pekerjaan maks. 12 jam dan selesai sebelum 24.00' using errcode = '22023';
  end if;
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

create or replace function public.no_double_booking() returns trigger
language plpgsql security definer set search_path = '' as $$
declare s int := split_part(new.start_time, '.', 1)::int * 60 + split_part(new.start_time, '.', 2)::int;
begin
  if new.status <> 'aktif' then return new; end if;
  perform pg_advisory_xact_lock(hashtext(new.art_id || new.scheduled_on::text)); -- serialize same ART + day
  if exists (
    select 1 from public.orders o,
      lateral (select split_part(o.start_time, '.', 1)::int * 60 + split_part(o.start_time, '.', 2)::int as os) t
    where o.art_id = new.art_id and o.status = 'aktif' and o.id <> new.id and o.scheduled_on = new.scheduled_on
      and t.os < s + new.minutes and s < t.os + o.minutes
  ) then
    raise exception 'jadwal ART sudah terisi pada jam itu' using errcode = '23P01';
  end if;
  return new;
end $$;
