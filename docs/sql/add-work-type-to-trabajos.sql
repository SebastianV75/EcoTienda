alter table public.trabajos
  add column if not exists work_type text;

create index if not exists trabajos_work_type_idx
  on public.trabajos (work_type);

update public.trabajos t
set work_type = s.work_type
from public.trabajo_agenda_stage s
where s.trabajo_id = t.id
  and t.work_type is null;
