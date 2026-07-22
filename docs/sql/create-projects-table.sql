create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  stage text not null default 'agenda'
    check (stage in ('agenda', 'visita', 'cotizacion', 'venta', 'descargables', 'post_venta')),
  post_sale_step text
    check (post_sale_step in ('sistema_220v', 'solicitud_contratos', 'contratos', 'activacion')),
  quotation_id uuid references public.quotations (id) on delete set null,
  sold_at timestamptz,
  activated_at timestamptz,
  stage_entered_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists projects_client_id_idx
  on public.projects (client_id);

create index if not exists projects_stage_idx
  on public.projects (stage);

create index if not exists projects_activated_at_idx
  on public.projects (activated_at);

create index if not exists projects_stage_entered_at_idx
  on public.projects (stage_entered_at);

create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row
execute function public.set_projects_updated_at();

alter table public.projects enable row level security;

drop policy if exists "admins can read projects" on public.projects;
create policy "admins can read projects"
on public.projects
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can insert projects" on public.projects;
create policy "admins can insert projects"
on public.projects
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can update projects" on public.projects;
create policy "admins can update projects"
on public.projects
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can delete projects" on public.projects;
create policy "admins can delete projects"
on public.projects
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
