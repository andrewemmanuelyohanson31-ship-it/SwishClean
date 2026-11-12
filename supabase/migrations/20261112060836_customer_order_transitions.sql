-- QC found: the customer policy rejected flagging reviewed/complained on a 'selesai' order.
-- Status rules move to the trigger (it sees old + new): a customer may only cancel an active order,
-- and once closed may only set the review/complaint flags.
create or replace function public.guard_closed_order() returns trigger
language plpgsql set search_path = '' as $$
begin
  if auth.uid() = old.customer_id and (
       (new.status is distinct from old.status and not (old.status = 'aktif' and new.status = 'dibatalkan'))
    or (old.status <> 'aktif' and (new.scheduled_on, new.start_time) is distinct from (old.scheduled_on, old.start_time))
  ) then
    raise exception 'order %: not allowed for customer', old.code using errcode = '42501';
  end if;
  return new;
end $$;
drop policy "customer updates own orders" on public.orders;
create policy "customer updates own orders" on public.orders for update
  using (customer_id = auth.uid()) with check (customer_id = auth.uid());
