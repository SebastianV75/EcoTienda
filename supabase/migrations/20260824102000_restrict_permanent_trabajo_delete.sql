drop policy if exists "admin can delete trabajos" on public.trabajos;

create policy "admin can delete trabajos"
on public.trabajos
for delete
to authenticated
using ((select app_private.current_worker_role()) = 'admin');
