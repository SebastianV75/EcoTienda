-- Safe incremental update for projects that already ran create-workers-table.sql.
-- Legacy staff rows remain readable and are normalized to administrative when edited.
alter table public.workers
  add column if not exists email text;

alter table public.workers
  drop constraint if exists workers_role_check;

alter table public.workers
  add constraint workers_role_check
  check (role in ('admin', 'administrative', 'technician', 'staff'));

alter table public.workers
  alter column role set default 'administrative';

create index if not exists workers_email_idx on public.workers (email);

do $$
begin
  if exists (
    select 1
    from public.workers
    where auth_user_id is not null
    group by auth_user_id
    having count(*) > 1
  ) then
    raise exception
      'Cannot create workers_auth_user_id_idx: duplicate auth_user_id links require manual cleanup';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_class index_class
    join pg_namespace index_namespace
      on index_namespace.oid = index_class.relnamespace
    join pg_index index_definition
      on index_definition.indexrelid = index_class.oid
    where index_namespace.nspname = 'public'
      and index_class.relname = 'workers_auth_user_id_idx'
      and not index_definition.indisunique
  ) then
    drop index public.workers_auth_user_id_idx;
  end if;
end $$;

create unique index if not exists workers_auth_user_id_idx
  on public.workers (auth_user_id)
  where auth_user_id is not null;

comment on column public.workers.auth_user_id is
  'Server-managed link to auth.users. Never accept this value from the browser.';

comment on column public.workers.role is
  'Current roles are admin, administrative and technician. staff is legacy and is migrated on edit.';

create schema if not exists app_private;

revoke all on schema app_private from public, anon, authenticated;
grant usage on schema app_private to authenticated;

-- SECURITY DEFINER avoids recursive workers RLS while this helper validates the
-- calling identity against the authoritative active Worker row.
create or replace function app_private.current_worker_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select normalized.role
  from (
    select case worker.role
      when 'staff' then 'administrative'
      when 'admin' then 'admin'
      when 'administrative' then 'administrative'
      when 'technician' then 'technician'
      else null
    end as role
    from public.workers as worker
    where (select auth.uid()) is not null
      and worker.auth_user_id = (select auth.uid())
      and worker.active = true
    limit 1
  ) as normalized
  where normalized.role = (select auth.jwt() -> 'app_metadata' ->> 'role');
$$;

revoke all on function app_private.current_worker_role() from public, anon, authenticated;
grant execute on function app_private.current_worker_role() to authenticated;

drop policy if exists "admins can read workers" on public.workers;
drop policy if exists "administratives can read workers" on public.workers;
create policy "administratives can read workers"
on public.workers
for select
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'));

drop policy if exists "admins can insert workers" on public.workers;
create policy "admins can insert workers"
on public.workers
for insert
to authenticated
with check ((select app_private.current_worker_role()) = 'admin');

drop policy if exists "admins can update workers" on public.workers;
create policy "admins can update workers"
on public.workers
for update
to authenticated
using ((select app_private.current_worker_role()) = 'admin')
with check ((select app_private.current_worker_role()) = 'admin');
