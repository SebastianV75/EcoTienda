alter table public.agenda_items
  add column if not exists assignee_worker_id uuid references public.workers (id) on delete set null,
  add column if not exists assignee_name text;

alter table public.trabajo_agenda_stage
  add column if not exists assignee_worker_id uuid references public.workers (id) on delete set null,
  add column if not exists assignee_name text;

create index if not exists agenda_items_assignee_worker_id_idx
  on public.agenda_items (assignee_worker_id);

create index if not exists trabajo_agenda_stage_assignee_worker_id_idx
  on public.trabajo_agenda_stage (assignee_worker_id);
