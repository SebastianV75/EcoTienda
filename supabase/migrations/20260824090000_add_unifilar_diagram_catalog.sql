-- Catálogo versionado de diagramas unifilares y overrides por trabajo.
-- Los objetos de Storage se conservan al reemplazar una versión para mantener respaldo.

create table if not exists public.unifilar_diagram_assets (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('global', 'manual')),
  rule_key text,
  trabajo_id uuid references public.trabajos (id) on delete cascade,
  original_filename text not null,
  storage_path text not null unique,
  mime_type text not null check (mime_type = 'image/png'),
  size_bytes bigint not null check (size_bytes > 0),
  sha256 text,
  version integer not null default 1 check (version > 0),
  is_current boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint unifilar_diagram_assets_scope_target_check check (
    (scope = 'global' and rule_key is not null and trabajo_id is null)
    or
    (scope = 'manual' and rule_key is null and trabajo_id is not null)
  )
);

create index if not exists unifilar_diagram_assets_rule_idx
  on public.unifilar_diagram_assets (rule_key, is_current)
  where scope = 'global';

create index if not exists unifilar_diagram_assets_trabajo_idx
  on public.unifilar_diagram_assets (trabajo_id, is_current)
  where scope = 'manual';

create unique index if not exists unifilar_diagram_assets_current_rule_key
  on public.unifilar_diagram_assets (rule_key)
  where scope = 'global' and is_current = true;

create or replace function public.set_unifilar_diagram_assets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_unifilar_diagram_assets_updated_at on public.unifilar_diagram_assets;
create trigger trg_unifilar_diagram_assets_updated_at
before update on public.unifilar_diagram_assets
for each row
execute function public.set_unifilar_diagram_assets_updated_at();

create table if not exists public.trabajo_unifilar_diagram_assignments (
  trabajo_id uuid primary key references public.trabajos (id) on delete cascade,
  asset_id uuid not null references public.unifilar_diagram_assets (id) on delete restrict,
  assigned_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists trabajo_unifilar_diagram_assignments_asset_idx
  on public.trabajo_unifilar_diagram_assignments (asset_id);

create or replace function public.set_trabajo_unifilar_diagram_assignments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_trabajo_unifilar_diagram_assignments_updated_at on public.trabajo_unifilar_diagram_assignments;
create trigger trg_trabajo_unifilar_diagram_assignments_updated_at
before update on public.trabajo_unifilar_diagram_assignments
for each row
execute function public.set_trabajo_unifilar_diagram_assignments_updated_at();

alter table public.unifilar_diagram_assets enable row level security;
alter table public.trabajo_unifilar_diagram_assignments enable row level security;

grant select, insert, update, delete on public.unifilar_diagram_assets to authenticated;
grant select, insert, update, delete on public.trabajo_unifilar_diagram_assignments to authenticated;

drop policy if exists "staff can read unifilar diagram assets" on public.unifilar_diagram_assets;
create policy "staff can read unifilar diagram assets"
on public.unifilar_diagram_assets
for select
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'));

drop policy if exists "admin can insert unifilar diagram assets" on public.unifilar_diagram_assets;
create policy "admin can insert unifilar diagram assets"
on public.unifilar_diagram_assets
for insert
to authenticated
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));

drop policy if exists "admin can update unifilar diagram assets" on public.unifilar_diagram_assets;
create policy "admin can update unifilar diagram assets"
on public.unifilar_diagram_assets
for update
to authenticated
using ((select app_private.current_worker_role()) = 'admin')
with check ((select app_private.current_worker_role()) = 'admin');

drop policy if exists "admin can delete unifilar diagram assets" on public.unifilar_diagram_assets;
create policy "admin can delete unifilar diagram assets"
on public.unifilar_diagram_assets
for delete
to authenticated
using ((select app_private.current_worker_role()) = 'admin');

drop policy if exists "staff can read unifilar diagram assignments" on public.trabajo_unifilar_diagram_assignments;
create policy "staff can read unifilar diagram assignments"
on public.trabajo_unifilar_diagram_assignments
for select
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'));

drop policy if exists "staff can insert unifilar diagram assignments" on public.trabajo_unifilar_diagram_assignments;
create policy "staff can insert unifilar diagram assignments"
on public.trabajo_unifilar_diagram_assignments
for insert
to authenticated
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));

drop policy if exists "staff can update unifilar diagram assignments" on public.trabajo_unifilar_diagram_assignments;
create policy "staff can update unifilar diagram assignments"
on public.trabajo_unifilar_diagram_assignments
for update
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'))
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));

drop policy if exists "staff can delete unifilar diagram assignments" on public.trabajo_unifilar_diagram_assignments;
create policy "staff can delete unifilar diagram assignments"
on public.trabajo_unifilar_diagram_assignments
for delete
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('unifilar-diagrams', 'unifilar-diagrams', false, 10485760, array['image/png']::text[])
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/png']::text[];

drop policy if exists "staff can read unifilar diagrams" on storage.objects;
create policy "staff can read unifilar diagrams"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'unifilar-diagrams'
  and (select app_private.current_worker_role()) in ('admin', 'administrative')
);

drop policy if exists "staff can insert unifilar diagrams" on storage.objects;
create policy "staff can insert unifilar diagrams"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'unifilar-diagrams'
  and (select app_private.current_worker_role()) in ('admin', 'administrative')
);

drop policy if exists "admin can update unifilar diagrams" on storage.objects;
create policy "admin can update unifilar diagrams"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'unifilar-diagrams'
  and (select app_private.current_worker_role()) = 'admin'
)
with check (
  bucket_id = 'unifilar-diagrams'
  and (select app_private.current_worker_role()) = 'admin'
);

drop policy if exists "admin can delete unifilar diagrams" on storage.objects;
create policy "admin can delete unifilar diagrams"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'unifilar-diagrams'
  and (select app_private.current_worker_role()) = 'admin'
);
