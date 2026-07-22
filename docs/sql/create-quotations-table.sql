create extension if not exists pgcrypto;

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text unique,
  trabajo_id uuid references public.trabajos (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  supplier_name text not null,
  supplier_reference text,
  project text,
  terms_and_conditions text,
  order_deadline date,
  expected_delivery date,
  require_confirmation boolean not null default false,
  deliver_to text,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  pdf_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_quotations_trabajo on public.quotations (trabajo_id);
create index if not exists idx_quotations_client on public.quotations (client_id);
create index if not exists idx_quotations_status on public.quotations (status);

create or replace function public.set_quotations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_quotations_updated_at on public.quotations;
create trigger trg_quotations_updated_at
before update on public.quotations
for each row
execute function public.set_quotations_updated_at();

alter table public.quotations enable row level security;

drop policy if exists "staff can read quotations" on public.quotations;
create policy "staff can read quotations"
on public.quotations
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can insert quotations" on public.quotations;
create policy "staff can insert quotations"
on public.quotations
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can update quotations" on public.quotations;
create policy "staff can update quotations"
on public.quotations
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'))
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can delete quotations" on public.quotations;
create policy "staff can delete quotations"
on public.quotations
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  type text not null default 'product' check (type in ('product', 'section', 'note')),
  product_name text not null,
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  unit text not null,
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  tax_rate numeric(5,2) not null default 0 check (tax_rate >= 0),
  amount numeric(12,2) not null default 0 check (amount >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_quotation_items_quotation on public.quotation_items (quotation_id);

create or replace function public.set_quotation_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_quotation_items_updated_at on public.quotation_items;
create trigger trg_quotation_items_updated_at
before update on public.quotation_items
for each row
execute function public.set_quotation_items_updated_at();

alter table public.quotation_items enable row level security;

drop policy if exists "staff can read quotation items" on public.quotation_items;
create policy "staff can read quotation items"
on public.quotation_items
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can insert quotation items" on public.quotation_items;
create policy "staff can insert quotation items"
on public.quotation_items
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can update quotation items" on public.quotation_items;
create policy "staff can update quotation items"
on public.quotation_items
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'))
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "staff can delete quotation items" on public.quotation_items;
create policy "staff can delete quotation items"
on public.quotation_items
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));