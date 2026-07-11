create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  address text not null,
  neighborhood text not null default '',
  rfc text not null default '',
  rpu text not null,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.clients add column if not exists neighborhood text not null default '';
alter table public.clients add column if not exists rfc text not null default '';

create index if not exists clients_full_name_idx on public.clients (full_name);
create index if not exists clients_rpu_idx on public.clients (rpu);
create index if not exists clients_phone_idx on public.clients (phone);

create or replace function public.set_clients_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at
before update on public.clients
for each row
execute function public.set_clients_updated_at();

alter table public.clients enable row level security;

drop policy if exists "admins can read clients" on public.clients;
create policy "admins can read clients"
on public.clients
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can insert clients" on public.clients;
create policy "admins can insert clients"
on public.clients
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can update clients" on public.clients;
create policy "admins can update clients"
on public.clients
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
