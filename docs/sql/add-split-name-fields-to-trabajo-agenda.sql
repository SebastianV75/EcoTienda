alter table public.trabajos
  add column if not exists intake_first_name text,
  add column if not exists intake_paternal_last_name text,
  add column if not exists intake_maternal_last_name text;

alter table public.trabajo_agenda_stage
  add column if not exists first_name text,
  add column if not exists paternal_last_name text,
  add column if not exists maternal_last_name text;
