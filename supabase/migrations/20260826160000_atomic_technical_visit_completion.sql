-- The visit form and the agenda compatibility bridge must be completed as one unit.
-- This function is exposed only through the authenticated Supabase API and performs
-- its own authorization because SECURITY DEFINER bypasses table RLS.

create or replace function public.complete_technical_visit(
  p_trabajo_id uuid,
  p_visit jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_worker public.workers%rowtype;
  v_trabajo public.trabajos%rowtype;
  v_agenda public.trabajo_agenda_stage%rowtype;
  v_agenda_item public.agenda_items%rowtype;
  v_completed_at timestamptz;
begin
  select *
  into v_worker
  from public.workers
  where auth_user_id = (select auth.uid())
    and active = true
    and role in ('admin', 'technician')
  limit 1;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'No tienes permiso para cerrar esta visita.';
  end if;

  select *
  into v_trabajo
  from public.trabajos
  where id = p_trabajo_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'No se encontró el trabajo de la visita.';
  end if;

  if v_trabajo.status = 'archived'
     or v_trabajo.current_stage not in ('agenda', 'visita') then
    raise exception using
      errcode = 'P0001',
      message = 'La visita ya fue completada o el trabajo ya avanzó a otra etapa.';
  end if;

  select *
  into v_agenda
  from public.trabajo_agenda_stage
  where trabajo_id = p_trabajo_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'No se encontró la etapa de agenda de la visita.';
  end if;

  if v_worker.role = 'technician'
     and v_agenda.assignee_worker_id is distinct from v_worker.id then
    raise exception using
      errcode = '42501',
      message = 'Solo el técnico asignado puede guardar esta visita.';
  end if;

  if v_trabajo.current_stage = 'agenda'
     and (
       v_agenda.appointment_at is null
       or nullif(btrim(v_agenda.work_type), '') is null
       or (v_agenda.assignee_worker_id is null and nullif(btrim(v_agenda.assignee_name), '') is null)
       or nullif(btrim(v_agenda.note), '') is null
       or nullif(btrim(v_agenda.contact_name), '') is null
       or nullif(btrim(v_agenda.contact_phone), '') is null
       or nullif(btrim(v_agenda.address_text), '') is null
       or v_agenda.latitude is null
       or v_agenda.longitude is null
     ) then
    raise exception using
      errcode = '23514',
      message = 'Completa la etapa de Agenda antes de cerrar la visita.';
  end if;

  select *
  into v_agenda_item
  from public.agenda_items
  where id = p_trabajo_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'No se encontró el elemento de agenda de la visita.';
  end if;

  v_completed_at := coalesce(
    nullif(p_visit->>'completed_at', '')::timestamptz,
    timezone('utc', now())
  );

  insert into public.trabajo_visita_stage (
    trabajo_id,
    execution_date,
    contact_name,
    contact_phone,
    confirmed_address,
    utility_bill_asset_id,
    interest_package,
    quotation_type,
    minisplit_attributes,
    house_attributes,
    electrical_attributes,
    roof_attributes,
    notes,
    signature_asset_id,
    completed_at
  ) values (
    p_trabajo_id,
    nullif(p_visit->>'execution_date', '')::date,
    p_visit->>'contact_name',
    p_visit->>'contact_phone',
    p_visit->>'confirmed_address',
    nullif(p_visit->>'utility_bill_asset_id', '')::uuid,
    p_visit->>'interest_package',
    p_visit->>'quotation_type',
    coalesce(p_visit->'minisplit_attributes', '{}'::jsonb),
    coalesce(p_visit->'house_attributes', '{}'::jsonb),
    coalesce(p_visit->'electrical_attributes', '{}'::jsonb),
    coalesce(p_visit->'roof_attributes', '{}'::jsonb),
    coalesce(p_visit->>'notes', ''),
    nullif(p_visit->>'signature_asset_id', '')::uuid,
    v_completed_at
  )
  on conflict (trabajo_id) do update set
    execution_date = excluded.execution_date,
    contact_name = excluded.contact_name,
    contact_phone = excluded.contact_phone,
    confirmed_address = excluded.confirmed_address,
    utility_bill_asset_id = excluded.utility_bill_asset_id,
    interest_package = excluded.interest_package,
    quotation_type = excluded.quotation_type,
    minisplit_attributes = excluded.minisplit_attributes,
    house_attributes = excluded.house_attributes,
    electrical_attributes = excluded.electrical_attributes,
    roof_attributes = excluded.roof_attributes,
    notes = excluded.notes,
    signature_asset_id = excluded.signature_asset_id,
    completed_at = excluded.completed_at;

  update public.trabajos
  set current_stage = 'cotizacion',
      agenda_completed_at = coalesce(v_trabajo.agenda_completed_at, v_completed_at),
      visita_completed_at = v_completed_at
  where id = p_trabajo_id
    and current_stage in ('agenda', 'visita');

  update public.trabajo_agenda_stage
  set completed_at = v_completed_at
  where trabajo_id = p_trabajo_id;

  update public.agenda_items
  set estado = 'finalizado',
      visit_id = p_trabajo_id
  where id = p_trabajo_id;

  return jsonb_build_object(
    'trabajo_id', p_trabajo_id,
    'completed_at', v_completed_at
  );
end;
$$;

revoke all on function public.complete_technical_visit(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.complete_technical_visit(uuid, jsonb) to authenticated;
