alter table public.trabajos
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users (id) on delete set null,
  add column if not exists archive_reason text,
  add column if not exists archived_previous_status text;

alter table public.trabajos
  drop constraint if exists trabajos_archived_previous_status_check;

alter table public.trabajos
  add constraint trabajos_archived_previous_status_check
  check (archived_previous_status is null or archived_previous_status in ('open', 'won', 'lost'));

create index if not exists trabajos_archived_at_idx
  on public.trabajos (archived_at desc)
  where status = 'archived';

create table if not exists public.trabajo_archive_events (
  id uuid primary key default gen_random_uuid(),
  trabajo_id uuid not null references public.trabajos (id) on delete cascade,
  action text not null check (action in ('archived', 'restored')),
  actor_user_id uuid references auth.users (id) on delete set null,
  reason text,
  previous_status text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists trabajo_archive_events_trabajo_idx
  on public.trabajo_archive_events (trabajo_id, created_at desc);

alter table public.trabajo_archive_events enable row level security;

drop policy if exists "staff can read trabajo archive events" on public.trabajo_archive_events;
create policy "staff can read trabajo archive events"
on public.trabajo_archive_events
for select
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'));

drop policy if exists "office can insert trabajo archive events" on public.trabajo_archive_events;
create policy "office can insert trabajo archive events"
on public.trabajo_archive_events
for insert
to authenticated
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));

drop policy if exists "staff can update trabajos" on public.trabajos;
drop policy if exists "staff can update active trabajos" on public.trabajos;
create policy "staff can update active trabajos"
on public.trabajos
for update
to authenticated
using (
  status <> 'archived'
  and (select app_private.current_worker_role()) in ('admin', 'administrative', 'technician')
)
with check (
  status <> 'archived'
  and (select app_private.current_worker_role()) in ('admin', 'administrative', 'technician')
);

drop policy if exists "office can archive or restore trabajos" on public.trabajos;
create policy "office can archive or restore trabajos"
on public.trabajos
for update
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'))
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));
