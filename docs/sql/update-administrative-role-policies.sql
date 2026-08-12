-- Incremental, idempotent RLS migration for existing EcoTienda installations.
-- Run only after docs/sql/add-administrative-role-to-workers.sql succeeds.

-- Remove legacy permissive policies before installing the canonical helper-based set.
drop policy if exists "technician can read assigned trabajos" on public.trabajos;
drop policy if exists "technician can update assigned trabajos" on public.trabajos;
drop policy if exists "technician can read assigned agenda stage" on public.trabajo_agenda_stage;
drop policy if exists "technician can update assigned agenda stage" on public.trabajo_agenda_stage;
drop policy if exists "technician can read assigned visita stage" on public.trabajo_visita_stage;
drop policy if exists "technician can insert assigned visita stage" on public.trabajo_visita_stage;
drop policy if exists "technician can update assigned visita stage" on public.trabajo_visita_stage;
drop policy if exists "Authenticated users can delete quotations" on public.quotations;

-- Agenda bridge: technicians can read; admin and administrative manage records.
drop policy if exists "staff can read agenda items" on public.agenda_items;
create policy "staff can read agenda items" on public.agenda_items for select
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "admins can insert agenda items" on public.agenda_items;
create policy "admins can insert agenda items" on public.agenda_items for insert
to authenticated
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));
drop policy if exists "admins can update agenda items" on public.agenda_items;
create policy "admins can update agenda items" on public.agenda_items for update
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'))
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));
drop policy if exists "admins can delete agenda items" on public.agenda_items;
create policy "admins can delete agenda items" on public.agenda_items for delete
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'));

-- Clients and projects are managed by office roles.
drop policy if exists "admins can read clients" on public.clients;
create policy "admins can read clients" on public.clients for select
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'));
drop policy if exists "admins can insert clients" on public.clients;
create policy "admins can insert clients" on public.clients for insert
to authenticated
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));
drop policy if exists "admins can update clients" on public.clients;
create policy "admins can update clients" on public.clients for update
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'))
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));

drop policy if exists "admins can read projects" on public.projects;
create policy "admins can read projects" on public.projects for select
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'));
drop policy if exists "admins can insert projects" on public.projects;
create policy "admins can insert projects" on public.projects for insert
to authenticated
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));
drop policy if exists "admins can update projects" on public.projects;
create policy "admins can update projects" on public.projects for update
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'))
with check ((select app_private.current_worker_role()) in ('admin', 'administrative'));
drop policy if exists "admins can delete projects" on public.projects;
create policy "admins can delete projects" on public.projects for delete
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'));

-- Quotations and items retain technician access and add administrative.
drop policy if exists "staff can read quotations" on public.quotations;
create policy "staff can read quotations" on public.quotations for select
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "staff can insert quotations" on public.quotations;
create policy "staff can insert quotations" on public.quotations for insert
to authenticated
with check ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "staff can update quotations" on public.quotations;
create policy "staff can update quotations" on public.quotations for update
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'))
with check ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "staff can delete quotations" on public.quotations;
create policy "staff can delete quotations" on public.quotations for delete
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "Authenticated users can delete quotations" on public.quotations;

drop policy if exists "staff can read quotation items" on public.quotation_items;
create policy "staff can read quotation items" on public.quotation_items for select
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "staff can insert quotation items" on public.quotation_items;
create policy "staff can insert quotation items" on public.quotation_items for insert
to authenticated
with check ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "staff can update quotation items" on public.quotation_items;
create policy "staff can update quotation items" on public.quotation_items for update
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'))
with check ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "staff can delete quotation items" on public.quotation_items;
create policy "staff can delete quotation items" on public.quotation_items for delete
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));

-- Workflow tables: all application roles use the workflow; office roles delete.
drop policy if exists "staff can read trabajos" on public.trabajos;
create policy "staff can read trabajos" on public.trabajos for select
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "staff can insert trabajos" on public.trabajos;
create policy "staff can insert trabajos" on public.trabajos for insert
to authenticated
with check ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "staff can update trabajos" on public.trabajos;
create policy "staff can update trabajos" on public.trabajos for update
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'))
with check ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
drop policy if exists "admin can delete trabajos" on public.trabajos;
create policy "admin can delete trabajos" on public.trabajos for delete
to authenticated
using ((select app_private.current_worker_role()) in ('admin', 'administrative'));

do $$
declare
  table_name text;
  policy_label text;
begin
  foreach table_name in array array[
    'trabajo_agenda_stage',
    'trabajo_media_assets',
    'trabajo_visita_stage',
    'trabajo_quotation_stage',
    'trabajo_sale_stage',
    'trabajo_document_overrides'
  ] loop
    policy_label := replace(table_name, '_', ' ');
    execute format('drop policy if exists %I on public.%I', 'staff can read ' || policy_label, table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select app_private.current_worker_role()) in (''admin'', ''administrative'', ''technician''))',
      'staff can read ' || policy_label, table_name
    );
    execute format('drop policy if exists %I on public.%I', 'staff can insert ' || policy_label, table_name);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select app_private.current_worker_role()) in (''admin'', ''administrative'', ''technician''))',
      'staff can insert ' || policy_label, table_name
    );
    execute format('drop policy if exists %I on public.%I', 'staff can update ' || policy_label, table_name);
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select app_private.current_worker_role()) in (''admin'', ''administrative'', ''technician'')) with check ((select app_private.current_worker_role()) in (''admin'', ''administrative'', ''technician''))',
      'staff can update ' || policy_label, table_name
    );
    execute format('drop policy if exists %I on public.%I', 'admin can delete ' || policy_label, table_name);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select app_private.current_worker_role()) in (''admin'', ''administrative''))',
      'admin can delete ' || policy_label, table_name
    );
  end loop;
end $$;
