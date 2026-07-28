alter table public.trabajo_quotation_stage
  add column if not exists rfc text,
  add column if not exists rpu text;
