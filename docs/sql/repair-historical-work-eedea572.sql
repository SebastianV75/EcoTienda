-- Corrección one-off aplicada en Supabase EcoTienda.
-- Trabajo: eedea572-bad3-401f-925a-5c6b427e29f6
-- La venta real quedó en 8,000; la cotización original conserva 27,577.59.
-- No ejecutar sobre otro trabajo ni cambiar importes sin validar el contexto comercial.

begin;

do $$
declare
  quotation_total numeric;
  projection_amount numeric;
  sale_amount numeric;
  quotation_status text;
  current_stage text;
  cotizacion_completed_at timestamptz;
  venta_completed_at timestamptz;
begin
  select
    q.total,
    q.status,
    tqs.amount,
    t.current_stage,
    t.cotizacion_completed_at,
    t.venta_completed_at,
    tss.agreed_amount
  into
    quotation_total,
    quotation_status,
    projection_amount,
    current_stage,
    cotizacion_completed_at,
    venta_completed_at,
    sale_amount
  from public.quotations q
  join public.trabajo_quotation_stage tqs on tqs.trabajo_id = q.trabajo_id
  join public.trabajos t on t.id = q.trabajo_id
  join public.trabajo_sale_stage tss on tss.trabajo_id = q.trabajo_id
  where q.id = 'a491540a-1bf3-4128-b6f6-b9eb377dcc22'
    and q.trabajo_id = 'eedea572-bad3-401f-925a-5c6b427e29f6'
  for update;

  if quotation_total is null
     or quotation_total <> 27577.59
     or projection_amount <> 31990
     or sale_amount <> 8000
     or quotation_status <> 'sent'
     or current_stage <> 'cotizacion'
     or cotizacion_completed_at is not null
     or venta_completed_at is null then
    raise exception 'Precondición no coincide; no se modificó el registro histórico';
  end if;

  update public.quotations
  set status = 'accepted'
  where id = 'a491540a-1bf3-4128-b6f6-b9eb377dcc22';

  update public.trabajo_quotation_stage
  set amount = quotation_total
  where trabajo_id = 'eedea572-bad3-401f-925a-5c6b427e29f6';

  update public.trabajos
  set
    current_stage = 'descargables',
    cotizacion_completed_at = venta_completed_at
  where id = 'eedea572-bad3-401f-925a-5c6b427e29f6';
end $$;

commit;
