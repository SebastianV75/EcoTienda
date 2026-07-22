alter table public.quotations
  add column if not exists client_id uuid references public.clients (id) on delete set null;

create index if not exists idx_quotations_client on public.quotations (client_id);
