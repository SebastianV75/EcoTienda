-- Link each sale directly to the canonical quotation record.
-- The old column stored trabajos.id despite its name. Convert those values
-- before adding the FK to quotations.id.

begin;

do $$
begin
  if exists (
    select 1
    from public.trabajo_sale_stage sale
    left join public.quotations quotation
      on quotation.trabajo_id = sale.quotation_trabajo_id
    where quotation.id is null
       or sale.trabajo_id <> sale.quotation_trabajo_id
  ) then
    raise exception 'No se puede migrar la FK: existe una venta sin cotización canónica por trabajo';
  end if;

  if exists (
    select sale.trabajo_id
    from public.trabajo_sale_stage sale
    join public.quotations quotation
      on quotation.trabajo_id = sale.quotation_trabajo_id
    group by sale.trabajo_id
    having count(*) <> 1
  ) then
    raise exception 'No se puede migrar la FK: alguna venta no tiene exactamente una cotización canónica';
  end if;
end $$;

alter table public.trabajo_sale_stage
  drop constraint if exists trabajo_sale_stage_quotation_trabajo_id_fkey;

drop index if exists public.trabajo_sale_stage_quotation_trabajo_id_idx;

alter table public.trabajo_sale_stage
  rename column quotation_trabajo_id to quotation_id;

update public.trabajo_sale_stage sale
set quotation_id = quotation.id
from public.quotations quotation
where quotation.trabajo_id = sale.quotation_id;

alter table public.trabajo_sale_stage
  alter column quotation_id set not null;

alter table public.trabajo_sale_stage
  add constraint trabajo_sale_stage_quotation_id_fkey
  foreign key (quotation_id)
  references public.quotations (id)
  on delete restrict;

create index trabajo_sale_stage_quotation_id_idx
  on public.trabajo_sale_stage (quotation_id);

commit;
