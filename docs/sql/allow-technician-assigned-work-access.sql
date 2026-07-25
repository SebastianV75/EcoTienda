-- Let technicians read and update only the work assigned to them.
-- This complements worker-linked role resolution from `workers.auth_user_id`.

alter table public.trabajos enable row level security;
alter table public.trabajo_agenda_stage enable row level security;
alter table public.trabajo_visita_stage enable row level security;

-- Trabajos: technician can read/update only trabajos whose agenda stage is assigned to their worker row.
drop policy if exists "technician can read assigned trabajos" on public.trabajos;
create policy "technician can read assigned trabajos"
on public.trabajos
for select
using (
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on w.id = tas.assignee_worker_id
    where tas.trabajo_id = public.trabajos.id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);

drop policy if exists "technician can update assigned trabajos" on public.trabajos;
create policy "technician can update assigned trabajos"
on public.trabajos
for update
using (
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on w.id = tas.assignee_worker_id
    where tas.trabajo_id = public.trabajos.id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
)
with check (
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on w.id = tas.assignee_worker_id
    where tas.trabajo_id = public.trabajos.id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);

-- Agenda stage: technician can read/update only their assigned agenda stage row.
drop policy if exists "technician can read assigned agenda stage" on public.trabajo_agenda_stage;
create policy "technician can read assigned agenda stage"
on public.trabajo_agenda_stage
for select
using (
  exists (
    select 1
    from public.workers w
    where w.id = public.trabajo_agenda_stage.assignee_worker_id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);

drop policy if exists "technician can update assigned agenda stage" on public.trabajo_agenda_stage;
create policy "technician can update assigned agenda stage"
on public.trabajo_agenda_stage
for update
using (
  exists (
    select 1
    from public.workers w
    where w.id = public.trabajo_agenda_stage.assignee_worker_id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
)
with check (
  exists (
    select 1
    from public.workers w
    where w.id = public.trabajo_agenda_stage.assignee_worker_id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);

-- Visit stage: technician can read/insert/update only visit rows belonging to their assigned trabajo.
drop policy if exists "technician can read assigned visita stage" on public.trabajo_visita_stage;
create policy "technician can read assigned visita stage"
on public.trabajo_visita_stage
for select
using (
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on w.id = tas.assignee_worker_id
    where tas.trabajo_id = public.trabajo_visita_stage.trabajo_id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);

drop policy if exists "technician can insert assigned visita stage" on public.trabajo_visita_stage;
create policy "technician can insert assigned visita stage"
on public.trabajo_visita_stage
for insert
with check (
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on w.id = tas.assignee_worker_id
    where tas.trabajo_id = public.trabajo_visita_stage.trabajo_id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);

drop policy if exists "technician can update assigned visita stage" on public.trabajo_visita_stage;
create policy "technician can update assigned visita stage"
on public.trabajo_visita_stage
for update
using (
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on w.id = tas.assignee_worker_id
    where tas.trabajo_id = public.trabajo_visita_stage.trabajo_id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
)
with check (
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on w.id = tas.assignee_worker_id
    where tas.trabajo_id = public.trabajo_visita_stage.trabajo_id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);
