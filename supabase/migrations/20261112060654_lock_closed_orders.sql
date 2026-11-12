-- QC found: a customer could move a 'selesai' order back to 'aktif'. RLS can't compare old vs new row,
-- so once an order is closed the customer may only set the review/complaint flags.
create function public.guard_closed_order() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.status <> 'aktif' and auth.uid() = old.customer_id
     and (new.status, new.scheduled_on, new.start_time) is distinct from (old.status, old.scheduled_on, old.start_time) then
    raise exception 'order % is closed', old.code using errcode = '42501';
  end if;
  return new;
end $$;
revoke execute on function public.guard_closed_order() from public, anon, authenticated;
create trigger guard_closed_order before update on public.orders
  for each row execute function public.guard_closed_order();
