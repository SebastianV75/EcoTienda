-- Gap 1: hacer explícita la relación 1:1 entre un Trabajo y su cotización canónica.
-- `trabajo_visita_stage` y `trabajo_sale_stage` ya tienen `trabajo_id` como
-- primary key, por lo que la base de datos ya limita a una visita y una venta
-- por Trabajo. Este índice completa la misma garantía para `quotations`.
--
-- Ejecutar primero la consulta de auditoría. Si devuelve filas, resolver los
-- duplicados antes de continuar: no se debe elegir una cotización por heurística.
--
-- select trabajo_id, count(*) as quotation_count,
--        array_agg(id order by created_at desc) as quotation_ids
-- from public.quotations
-- where trabajo_id is not null
-- group by trabajo_id
-- having count(*) > 1;

do $$
begin
  if exists (
    select 1
    from public.quotations
    where trabajo_id is not null
    group by trabajo_id
    having count(*) > 1
  ) then
    raise exception
      'No se puede crear el índice: existen cotizaciones duplicadas por trabajo. Resuélvelas primero.';
  end if;
end
$$;

create unique index if not exists quotations_one_per_trabajo_idx
  on public.quotations (trabajo_id)
  where trabajo_id is not null;
