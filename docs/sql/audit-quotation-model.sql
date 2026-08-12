-- Gap 1: auditoría previa a retirar trabajo_quotation_stage.
-- No ejecutar una migración destructiva hasta revisar estos tres grupos.

-- 1) Trabajos con cotización canónica y proyección distinta.
select
  q.trabajo_id,
  q.id as quotation_id,
  q.total as canonical_total,
  tqs.amount as projected_total,
  q.project as canonical_scope,
  tqs.scope_summary as projected_scope
from public.quotations q
join public.trabajo_quotation_stage tqs
  on tqs.trabajo_id = q.trabajo_id
where q.trabajo_id is not null
  and (
    q.total is distinct from tqs.amount
    or coalesce(q.project, '') is distinct from coalesce(tqs.scope_summary, '')
  )
order by q.created_at desc;

-- 2) Registros solo en el modelo nuevo. Requieren decisión explícita:
--    crear una quotations canónica con proveedor/proyecto por defecto o conservarlos.
select tqs.*
from public.trabajo_quotation_stage tqs
left join public.quotations q on q.trabajo_id = tqs.trabajo_id
where q.id is null
order by tqs.created_at desc;

-- 3) Trabajos con más de una cotización canónica.
--    Resolverlos antes de aplicar enforce-one-quotation-per-trabajo.sql.
select
  trabajo_id,
  count(*) as quotation_count,
  array_agg(id order by created_at desc) as quotation_ids
from public.quotations
where trabajo_id is not null
group by trabajo_id
having count(*) > 1;
