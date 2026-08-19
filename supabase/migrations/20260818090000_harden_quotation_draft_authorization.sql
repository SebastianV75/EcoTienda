-- Align quotation draft authorization with the active Worker role resolver.
-- Authorization must come from the server-managed role claim and active Worker.

create or replace function public.save_quotation_draft(
  p_quotation_id uuid,
  p_trabajo_id uuid,
  p_quotation_number text,
  p_supplier_name text,
  p_project text,
  p_status text,
  p_terms_and_conditions text,
  p_order_deadline text,
  p_expected_delivery text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quotation_id uuid;
  v_item jsonb;
  v_type text;
  v_product_name text;
  v_unit text;
  v_quantity numeric;
  v_unit_price numeric;
  v_amount numeric;
  v_subtotal numeric := 0;
  v_sort_order integer := 0;
  v_status text := coalesce(nullif(trim(p_status), ''), 'draft');
  v_items jsonb := coalesce(p_items, '[]'::jsonb);
begin
  if auth.uid() is null
     or coalesce(app_private.current_worker_role(), '') not in ('admin', 'administrative') then
    raise exception 'Solo un usuario autorizado puede guardar cotizaciones.'
      using errcode = '42501';
  end if;

  if nullif(trim(coalesce(p_supplier_name, '')), '') is null
     or nullif(trim(coalesce(p_project, '')), '') is null then
    raise exception 'Proveedor y cliente son obligatorios.'
      using errcode = '22023';
  end if;

  if v_status not in ('draft', 'sent', 'accepted', 'rejected') then
    raise exception 'El estado de la cotización no es válido.'
      using errcode = '22023';
  end if;

  if jsonb_typeof(v_items) <> 'array' then
    raise exception 'Los productos de la cotización deben ser una lista.'
      using errcode = '22023';
  end if;

  if p_quotation_id is not null then
    select id
      into v_quotation_id
      from public.quotations
      where id = p_quotation_id
      for update;

    if v_quotation_id is null then
      raise exception 'La cotización no existe.' using errcode = 'P0002';
    end if;
  else
    if nullif(trim(coalesce(p_quotation_number, '')), '') is null then
      raise exception 'Falta el número de cotización.' using errcode = '22023';
    end if;

    insert into public.quotations (
      quotation_number,
      trabajo_id,
      supplier_name,
      project,
      terms_and_conditions,
      order_deadline,
      expected_delivery,
      subtotal,
      total,
      status
    ) values (
      trim(p_quotation_number),
      p_trabajo_id,
      trim(p_supplier_name),
      trim(p_project),
      nullif(trim(coalesce(p_terms_and_conditions, '')), ''),
      nullif(trim(coalesce(p_order_deadline, '')), '')::date,
      nullif(trim(coalesce(p_expected_delivery, '')), '')::date,
      0,
      0,
      v_status
    )
    returning id into v_quotation_id;
  end if;

  if p_quotation_id is not null then
    update public.quotations
       set trabajo_id = p_trabajo_id,
           supplier_name = trim(p_supplier_name),
           project = trim(p_project),
           status = v_status,
           terms_and_conditions = nullif(trim(coalesce(p_terms_and_conditions, '')), ''),
           order_deadline = nullif(trim(coalesce(p_order_deadline, '')), '')::date,
           expected_delivery = nullif(trim(coalesce(p_expected_delivery, '')), '')::date
     where id = v_quotation_id;
  end if;

  delete from public.quotation_items
   where quotation_id = v_quotation_id;

  for v_item in
    select value from jsonb_array_elements(v_items)
  loop
    v_type := coalesce(v_item ->> 'type', 'product');
    v_product_name := coalesce(v_item ->> 'product_name', '');
    v_unit := coalesce(nullif(v_item ->> 'unit', ''), 'pz');

    if v_type not in ('product', 'section', 'note') then
      raise exception 'El tipo de producto no es válido.' using errcode = '22023';
    end if;

    if v_type = 'product' then
      begin
        v_quantity := (v_item ->> 'quantity')::numeric;
        v_unit_price := (v_item ->> 'unit_price')::numeric;
      exception when others then
        raise exception 'Las piezas tienen valores numéricos inválidos.'
          using errcode = '22023';
      end;

      if v_quantity is null
         or v_quantity <> trunc(v_quantity)
         or v_quantity < 1
         or v_unit_price is null
         or v_unit_price < 0 then
        raise exception 'Las piezas deben ser enteros positivos y el precio no negativo.'
          using errcode = '22023';
      end if;

      v_amount := round(v_quantity * v_unit_price, 2);
      v_subtotal := v_subtotal + v_amount;
    else
      v_quantity := 1;
      v_unit_price := 0;
      v_amount := 0;
    end if;

    insert into public.quotation_items (
      quotation_id,
      type,
      product_name,
      quantity,
      unit,
      unit_price,
      tax_rate,
      amount,
      sort_order
    ) values (
      v_quotation_id,
      v_type,
      v_product_name,
      v_quantity,
      v_unit,
      v_unit_price,
      0,
      v_amount,
      v_sort_order
    );

    v_sort_order := v_sort_order + 1;
  end loop;

  update public.quotations
     set subtotal = round(v_subtotal, 2),
         total = round(v_subtotal, 2)
   where id = v_quotation_id;

  return v_quotation_id;
end;
$$;

revoke all on function public.save_quotation_draft(
  uuid, uuid, text, text, text, text, text, text, text, jsonb
) from public, anon;
grant execute on function public.save_quotation_draft(
  uuid, uuid, text, text, text, text, text, text, text, jsonb
) to authenticated;
