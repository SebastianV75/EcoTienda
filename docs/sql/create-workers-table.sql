create extension if not exists pgcrypto;

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  role text not null default 'staff',
  auth_user_id uuid references auth.users (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workers_role_check check (role in ('admin', 'technician', 'staff'))
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

drop policy if exists "admins can read workers" on public.workers;
create policy "admins can read workers"
on public.workers
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can insert workers" on public.workers;
create policy "admins can insert workers"
on public.workers
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can update workers" on public.workers;
create policy "admins can update workers"
on public.workers
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
