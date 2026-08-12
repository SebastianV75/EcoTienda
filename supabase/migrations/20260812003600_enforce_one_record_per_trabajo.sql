-- Enforce one business record per Trabajo.
-- trabajo_visita_stage and trabajo_sale_stage already use trabajo_id as their
-- primary key. This completes the same invariant for canonical quotations.
-- The partial predicate keeps standalone quotations (trabajo_id IS NULL) valid.

create unique index if not exists quotations_one_per_trabajo_idx
  on public.quotations (trabajo_id)
  where trabajo_id is not null;
