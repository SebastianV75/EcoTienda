drop policy if exists "staff can update active trabajos" on public.trabajos;
drop policy if exists "office can archive or restore trabajos" on public.trabajos;

create policy "staff can update trabajos with archive control"
on public.trabajos
for update
to authenticated
using (
  (select app_private.current_worker_role()) in ('admin', 'administrative')
  or (
    status <> 'archived'
    and (select app_private.current_worker_role()) = 'technician'
  )
)
with check (
  (select app_private.current_worker_role()) in ('admin', 'administrative')
  or (
    status <> 'archived'
    and (select app_private.current_worker_role()) = 'technician'
  )
);

create index if not exists trabajos_archived_by_idx
  on public.trabajos (archived_by)
  where archived_by is not null;

create index if not exists trabajo_archive_events_actor_idx
  on public.trabajo_archive_events (actor_user_id)
  where actor_user_id is not null;
