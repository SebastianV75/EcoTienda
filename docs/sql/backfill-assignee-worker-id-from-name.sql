-- Backfill legacy assignment rows that still carry only assignee_name.
-- Safe to run multiple times: it only fills missing assignee_worker_id values.
-- It matches by trimmed worker full_name.

-- 1) Trabajo agenda stage
update public.trabajo_agenda_stage as tas
set assignee_worker_id = w.id,
    assignee_name = w.full_name
from public.workers as w
where tas.assignee_worker_id is null
  and tas.assignee_name is not null
  and btrim(tas.assignee_name) <> ''
  and btrim(lower(tas.assignee_name)) = btrim(lower(w.full_name));

-- 2) Agenda compatibility bridge
update public.agenda_items as ai
set assignee_worker_id = w.id,
    assignee_name = w.full_name
from public.workers as w
where ai.assignee_worker_id is null
  and ai.assignee_name is not null
  and btrim(ai.assignee_name) <> ''
  and btrim(lower(ai.assignee_name)) = btrim(lower(w.full_name));

-- Optional verification queries:
-- select count(*) from public.trabajo_agenda_stage where assignee_worker_id is null and assignee_name is not null;
-- select count(*) from public.agenda_items where assignee_worker_id is null and assignee_name is not null;
