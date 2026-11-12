-- Security advisor 0028/0029: SECURITY DEFINER functions in public are callable via /rest/v1/rpc.
-- handle_new_user only runs as a trigger, so nobody needs EXECUTE on it.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- in_order_thread is used by messages RLS policies (evaluated as the caller), so signed-in users keep it.
revoke execute on function public.in_order_thread(uuid) from public, anon;
