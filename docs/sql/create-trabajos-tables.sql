create extension if not exists pgcrypto;

create table if not exists public.trabajos (
  id uuid primary key default gen_random_uuid(),
  current_stage text not null default 'agenda' check (current_stage in ('agenda', 'visita', 'cotizacion', 'venta', 'descargables')),
  status text not null default 'open' check (status in ('open', 'won', 'lost', 'archived')),
  intake_name text not null,
  intake_phone text not null,
  intake_address_text text not null,
  intake_latitude double precision,
  intake_longitude double precision,
  client_id uuid references public.clients (id) on delete set null,
  agenda_completed_at timestamptz,
  visita_completed_at timestamptz,
  cotizacion_completed_at timestamptz,
  venta_completed_at timestamptz,
  descargables_completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists trabajos_current_stage_idx
  on public.trabajos (current_stage);

create index if not exists trabajos_status_idx
  on public.trabajos (status);

create index if not exists trabajos_client_id_idx
  on public.trabajos (client_id);

create or replace function public.set_trabajos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_trabajos_updated_at on public.trabajos;
create trigger trg_trabajos_updated_at
before update on public.trabajos
for each row
execute function public.set_trabajos_updated_at();

alter table public.trabajos enable row level security;

drop policy if exists "staff can read trabajos" on public.trabajos;
create policy "staff can read trabajos"
on public.trabajos
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can insert trabajos" on public.trabajos;
create policy "staff can insert trabajos"
on public.trabajos
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can update trabajos" on public.trabajos;
create policy "staff can update trabajos"
on public.trabajos
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'))
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

create table if not exists public.trabajo_agenda_stage (
  trabajo_id uuid primary key references public.trabajos (id) on delete cascade,
  appointment_at timestamptz not null,
  work_type text not null,
  assignee_name text not null,
  note text not null,
  contact_name text not null,
  contact_phone text not null,
  address_text text not null,
  latitude double precision,
  longitude double precision,
  client_id uuid references public.clients (id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists trabajo_agenda_stage_client_id_idx
  on public.trabajo_agenda_stage (client_id);

create or replace function public.set_trabajo_agenda_stage_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_trabajo_agenda_stage_updated_at on public.trabajo_agenda_stage;
create trigger trg_trabajo_agenda_stage_updated_at
before update on public.trabajo_agenda_stage
for each row
execute function public.set_trabajo_agenda_stage_updated_at();

alter table public.trabajo_agenda_stage enable row level security;

drop policy if exists "staff can read trabajo agenda stage" on public.trabajo_agenda_stage;
create policy "staff can read trabajo agenda stage"
on public.trabajo_agenda_stage
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can insert trabajo agenda stage" on public.trabajo_agenda_stage;
create policy "staff can insert trabajo agenda stage"
on public.trabajo_agenda_stage
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can update trabajo agenda stage" on public.trabajo_agenda_stage;
create policy "staff can update trabajo agenda stage"
on public.trabajo_agenda_stage
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'))
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

create table if not exists public.trabajo_media_assets (
  id uuid primary key default gen_random_uuid(),
  trabajo_id uuid not null references public.trabajos (id) on delete cascade,
  stage text not null check (stage in ('agenda', 'visita', 'cotizacion', 'venta', 'descargables')),
  kind text not null check (kind in ('house', 'electrical', 'roof', 'utility_bill', 'signature', 'other')),
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  capture_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists trabajo_media_assets_trabajo_id_idx
  on public.trabajo_media_assets (trabajo_id);

create index if not exists trabajo_media_assets_stage_idx
  on public.trabajo_media_assets (stage);

create index if not exists trabajo_media_assets_kind_idx
  on public.trabajo_media_assets (kind);

create unique index if not exists trabajo_media_assets_storage_path_key
  on public.trabajo_media_assets (storage_path);

create or replace function public.set_trabajo_media_assets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_trabajo_media_assets_updated_at on public.trabajo_media_assets;
create trigger trg_trabajo_media_assets_updated_at
before update on public.trabajo_media_assets
for each row
execute function public.set_trabajo_media_assets_updated_at();

alter table public.trabajo_media_assets enable row level security;

drop policy if exists "staff can read trabajo media assets" on public.trabajo_media_assets;
create policy "staff can read trabajo media assets"
on public.trabajo_media_assets
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can insert trabajo media assets" on public.trabajo_media_assets;
create policy "staff can insert trabajo media assets"
on public.trabajo_media_assets
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can update trabajo media assets" on public.trabajo_media_assets;
create policy "staff can update trabajo media assets"
on public.trabajo_media_assets
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'))
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

create table if not exists public.trabajo_visita_stage (
  trabajo_id uuid primary key references public.trabajos (id) on delete cascade,
  execution_date date not null,
  contact_name text not null,
  contact_phone text not null,
  confirmed_address text not null,
  utility_bill_asset_id uuid references public.trabajo_media_assets (id) on delete set null,
  interest_package text not null,
  quotation_type text not null,
  minisplit_attributes jsonb not null default '{}'::jsonb,
  house_attributes jsonb not null default '{}'::jsonb,
  electrical_attributes jsonb not null default '{}'::jsonb,
  roof_attributes jsonb not null default '{}'::jsonb,
  notes text not null default '',
  signature_asset_id uuid references public.trabajo_media_assets (id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists trabajo_visita_stage_utility_bill_asset_id_idx
  on public.trabajo_visita_stage (utility_bill_asset_id);

create index if not exists trabajo_visita_stage_signature_asset_id_idx
  on public.trabajo_visita_stage (signature_asset_id);

create or replace function public.set_trabajo_visita_stage_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_trabajo_visita_stage_updated_at on public.trabajo_visita_stage;
create trigger trg_trabajo_visita_stage_updated_at
before update on public.trabajo_visita_stage
for each row
execute function public.set_trabajo_visita_stage_updated_at();

alter table public.trabajo_visita_stage enable row level security;

drop policy if exists "staff can read trabajo visita stage" on public.trabajo_visita_stage;
create policy "staff can read trabajo visita stage"
on public.trabajo_visita_stage
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can insert trabajo visita stage" on public.trabajo_visita_stage;
create policy "staff can insert trabajo visita stage"
on public.trabajo_visita_stage
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can update trabajo visita stage" on public.trabajo_visita_stage;
create policy "staff can update trabajo visita stage"
on public.trabajo_visita_stage
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'))
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

create table if not exists public.trabajo_quotation_stage (
  trabajo_id uuid primary key references public.trabajos (id) on delete cascade,
  scope_summary text not null,
  amount numeric(12,2) not null check (amount >= 0),
  terms_and_conditions text not null default '',
  outcome text not null,
  quotation_type text not null,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists trabajo_quotation_stage_quotation_type_idx
  on public.trabajo_quotation_stage (quotation_type);

create or replace function public.set_trabajo_quotation_stage_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_trabajo_quotation_stage_updated_at on public.trabajo_quotation_stage;
create trigger trg_trabajo_quotation_stage_updated_at
before update on public.trabajo_quotation_stage
for each row
execute function public.set_trabajo_quotation_stage_updated_at();

alter table public.trabajo_quotation_stage enable row level security;

drop policy if exists "staff can read trabajo quotation stage" on public.trabajo_quotation_stage;
create policy "staff can read trabajo quotation stage"
on public.trabajo_quotation_stage
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can insert trabajo quotation stage" on public.trabajo_quotation_stage;
create policy "staff can insert trabajo quotation stage"
on public.trabajo_quotation_stage
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can update trabajo quotation stage" on public.trabajo_quotation_stage;
create policy "staff can update trabajo quotation stage"
on public.trabajo_quotation_stage
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'))
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

create table if not exists public.trabajo_sale_stage (
  trabajo_id uuid primary key references public.trabajos (id) on delete cascade,
  quotation_trabajo_id uuid not null references public.trabajo_quotation_stage (trabajo_id) on delete restrict,
  confirmed_on date not null,
  agreed_amount numeric(12,2) not null check (agreed_amount >= 0),
  notes text not null default '',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists trabajo_sale_stage_quotation_trabajo_id_idx
  on public.trabajo_sale_stage (quotation_trabajo_id);

create or replace function public.set_trabajo_sale_stage_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_trabajo_sale_stage_updated_at on public.trabajo_sale_stage;
create trigger trg_trabajo_sale_stage_updated_at
before update on public.trabajo_sale_stage
for each row
execute function public.set_trabajo_sale_stage_updated_at();

alter table public.trabajo_sale_stage enable row level security;

drop policy if exists "staff can read trabajo sale stage" on public.trabajo_sale_stage;
create policy "staff can read trabajo sale stage"
on public.trabajo_sale_stage
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can insert trabajo sale stage" on public.trabajo_sale_stage;
create policy "staff can insert trabajo sale stage"
on public.trabajo_sale_stage
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can update trabajo sale stage" on public.trabajo_sale_stage;
create policy "staff can update trabajo sale stage"
on public.trabajo_sale_stage
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'))
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

create table if not exists public.trabajo_document_overrides (
  id uuid primary key default gen_random_uuid(),
  trabajo_id uuid not null references public.trabajos (id) on delete cascade,
  template_key text not null,
  export_instance_key text not null,
  field_key text not null,
  field_value jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (trabajo_id, template_key, export_instance_key, field_key)
);

create index if not exists trabajo_document_overrides_trabajo_id_idx
  on public.trabajo_document_overrides (trabajo_id);

create index if not exists trabajo_document_overrides_template_idx
  on public.trabajo_document_overrides (template_key, export_instance_key);

create or replace function public.set_trabajo_document_overrides_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_trabajo_document_overrides_updated_at on public.trabajo_document_overrides;
create trigger trg_trabajo_document_overrides_updated_at
before update on public.trabajo_document_overrides
for each row
execute function public.set_trabajo_document_overrides_updated_at();

alter table public.trabajo_document_overrides enable row level security;

drop policy if exists "staff can read trabajo document overrides" on public.trabajo_document_overrides;
create policy "staff can read trabajo document overrides"
on public.trabajo_document_overrides
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can insert trabajo document overrides" on public.trabajo_document_overrides;
create policy "staff can insert trabajo document overrides"
on public.trabajo_document_overrides
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can update trabajo document overrides" on public.trabajo_document_overrides;
create policy "staff can update trabajo document overrides"
on public.trabajo_document_overrides
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'))
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));
