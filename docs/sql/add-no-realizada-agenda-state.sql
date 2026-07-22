alter table public.agenda_items
  drop constraint if exists agenda_items_estado_check;

alter table public.agenda_items
  add constraint agenda_items_estado_check
  check (estado in ('pendiente', 'en_proceso', 'finalizado', 'no_realizada'));
