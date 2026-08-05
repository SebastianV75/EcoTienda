create extension if not exists pgcrypto;

create table if not exists public.agenda_items (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  titulo text not null,
  tipo text not null check (tipo in ('cita', 'visita_tecnica', 'instalacion', 'recordatorio_interno')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_proceso', 'finalizado')),
  descripcion text,
  client_id uuid references public.clients (id) on delete set null,
  visit_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists agenda_items_fecha_idx
  on public.agenda_items (fecha);

create index if not exists agenda_items_estado_fecha_idx
  on public.agenda_items (estado, fecha);

create index if not exists agenda_items_tipo_fecha_idx
  on public.agenda_items (tipo, fecha);

create index if not exists agenda_items_client_id_idx
  on public.agenda_items (client_id);

create or replace function public.set_agenda_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_agenda_items_updated_at on public.agenda_items;
create trigger trg_agenda_items_updated_at
before update on public.agenda_items
for each row
execute function public.set_agenda_items_updated_at();

alter table public.agenda_items enable row level security;

drop policy if exists "staff can read agenda items" on public.agenda_items;
create policy "staff can read agenda items"
on public.agenda_items
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'technician'));

drop policy if exists "admins can insert agenda items" on public.agenda_items;
create policy "admins can insert agenda items"
on public.agenda_items
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can update agenda items" on public.agenda_items;
create policy "admins can update agenda items"
on public.agenda_items
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can delete agenda items" on public.agenda_items;
create policy "admins can delete agenda items"
on public.agenda_items
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
