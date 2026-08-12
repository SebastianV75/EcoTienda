create extension if not exists pgcrypto;

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  role text not null default 'administrative',
  auth_user_id uuid references auth.users (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workers_role_check check (role in ('admin', 'administrative', 'technician', 'staff'))
);

create index if not exists workers_full_name_idx on public.workers (full_name);
create index if not exists workers_role_idx on public.workers (role);
create unique index if not exists workers_auth_user_id_idx on public.workers (auth_user_id) where auth_user_id is not null;

create or replace function public.set_workers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_workers_updated_at on public.workers;
create trigger trg_workers_updated_at
before update on public.workers
for each row
execute function public.set_workers_updated_at();

alter table public.workers enable row level security;

create schema if not exists app_private;

revoke all on schema app_private from public, anon, authenticated;
grant usage on schema app_private to authenticated;

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
