-- Extend technician RLS so legacy rows assigned only by assignee_name
-- are still visible to the linked technician worker.
-- Run create-workers-table.sql or add-administrative-role-to-workers.sql first.

alter table public.trabajos enable row level security;
alter table public.trabajo_agenda_stage enable row level security;
alter table public.trabajo_visita_stage enable row level security;

drop policy if exists "technician can read assigned trabajos" on public.trabajos;
create policy "technician can read assigned trabajos"
on public.trabajos
for select
to authenticated
using (
  (select app_private.current_worker_role()) = 'technician'
  and
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on (
      w.id = tas.assignee_worker_id
      or (
        tas.assignee_worker_id is null
        and tas.assignee_name is not null
        and btrim(tas.assignee_name) = btrim(w.full_name)
      )
    )
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
to authenticated
using (
  (select app_private.current_worker_role()) = 'technician'
  and
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on (
      w.id = tas.assignee_worker_id
      or (
        tas.assignee_worker_id is null
        and tas.assignee_name is not null
        and btrim(tas.assignee_name) = btrim(w.full_name)
      )
    )
    where tas.trabajo_id = public.trabajos.id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
)
with check (
  (select app_private.current_worker_role()) = 'technician'
  and
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on (
      w.id = tas.assignee_worker_id
      or (
        tas.assignee_worker_id is null
        and tas.assignee_name is not null
        and btrim(tas.assignee_name) = btrim(w.full_name)
      )
    )
    where tas.trabajo_id = public.trabajos.id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);

drop policy if exists "technician can read assigned agenda stage" on public.trabajo_agenda_stage;
create policy "technician can read assigned agenda stage"
on public.trabajo_agenda_stage
for select
to authenticated
using (
  (select app_private.current_worker_role()) = 'technician'
  and
  exists (
    select 1
    from public.workers w
    where (
      w.id = public.trabajo_agenda_stage.assignee_worker_id
      or (
        public.trabajo_agenda_stage.assignee_worker_id is null
        and public.trabajo_agenda_stage.assignee_name is not null
        and btrim(public.trabajo_agenda_stage.assignee_name) = btrim(w.full_name)
      )
    )
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);

drop policy if exists "technician can update assigned agenda stage" on public.trabajo_agenda_stage;
create policy "technician can update assigned agenda stage"
on public.trabajo_agenda_stage
for update
to authenticated
using (
  (select app_private.current_worker_role()) = 'technician'
  and
  exists (
    select 1
    from public.workers w
    where (
      w.id = public.trabajo_agenda_stage.assignee_worker_id
      or (
        public.trabajo_agenda_stage.assignee_worker_id is null
        and public.trabajo_agenda_stage.assignee_name is not null
        and btrim(public.trabajo_agenda_stage.assignee_name) = btrim(w.full_name)
      )
    )
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
)
with check (
  (select app_private.current_worker_role()) = 'technician'
  and
  exists (
    select 1
    from public.workers w
    where (
      w.id = public.trabajo_agenda_stage.assignee_worker_id
      or (
        public.trabajo_agenda_stage.assignee_worker_id is null
        and public.trabajo_agenda_stage.assignee_name is not null
        and btrim(public.trabajo_agenda_stage.assignee_name) = btrim(w.full_name)
      )
    )
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);

drop policy if exists "technician can read assigned visita stage" on public.trabajo_visita_stage;
create policy "technician can read assigned visita stage"
on public.trabajo_visita_stage
for select
to authenticated
using (
  (select app_private.current_worker_role()) = 'technician'
  and
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on (
      w.id = tas.assignee_worker_id
      or (
        tas.assignee_worker_id is null
        and tas.assignee_name is not null
        and btrim(tas.assignee_name) = btrim(w.full_name)
      )
    )
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
to authenticated
with check (
  (select app_private.current_worker_role()) = 'technician'
  and
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on (
      w.id = tas.assignee_worker_id
      or (
        tas.assignee_worker_id is null
        and tas.assignee_name is not null
        and btrim(tas.assignee_name) = btrim(w.full_name)
      )
    )
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
to authenticated
using (
  (select app_private.current_worker_role()) = 'technician'
  and
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on (
      w.id = tas.assignee_worker_id
      or (
        tas.assignee_worker_id is null
        and tas.assignee_name is not null
        and btrim(tas.assignee_name) = btrim(w.full_name)
      )
    )
    where tas.trabajo_id = public.trabajo_visita_stage.trabajo_id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
)
with check (
  (select app_private.current_worker_role()) = 'technician'
  and
  exists (
    select 1
    from public.trabajo_agenda_stage tas
    join public.workers w on (
      w.id = tas.assignee_worker_id
      or (
        tas.assignee_worker_id is null
        and tas.assignee_name is not null
        and btrim(tas.assignee_name) = btrim(w.full_name)
      )
    )
    where tas.trabajo_id = public.trabajo_visita_stage.trabajo_id
      and w.auth_user_id = auth.uid()
      and w.active = true
      and w.role = 'technician'
  )
);
