alter table public.unifilar_diagram_assets
  add column if not exists sha256 text;
