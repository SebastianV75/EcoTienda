-- Repair rows left by the old non-atomic visit completion flow.
-- A completed visit is the source of truth for these compatibility fields.

update public.trabajos as trabajo
set current_stage = case
      when trabajo.current_stage in ('agenda', 'visita') then 'cotizacion'
      else trabajo.current_stage
    end,
    agenda_completed_at = coalesce(trabajo.agenda_completed_at, visita.completed_at),
    visita_completed_at = coalesce(trabajo.visita_completed_at, visita.completed_at)
from public.trabajo_visita_stage as visita
where visita.trabajo_id = trabajo.id
  and visita.completed_at is not null
  and trabajo.status <> 'archived';

update public.trabajo_agenda_stage as agenda
set completed_at = visita.completed_at
from public.trabajo_visita_stage as visita
where visita.trabajo_id = agenda.trabajo_id
  and visita.completed_at is not null
  and agenda.completed_at is null;

update public.agenda_items as agenda
set estado = 'finalizado',
    visit_id = agenda.id
from public.trabajo_visita_stage as visita
where visita.trabajo_id = agenda.id
  and visita.completed_at is not null
  and agenda.estado <> 'finalizado';
