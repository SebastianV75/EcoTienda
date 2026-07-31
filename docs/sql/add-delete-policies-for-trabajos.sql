-- Migration: add DELETE policies for trabajo-related tables
-- Safe to run multiple times: each policy is dropped before creation.
-- This only grants DELETE permission to admin users. No tables, data, or existing policies are modified.

-- Main trabajo table
DROP POLICY IF EXISTS "admin can delete trabajos" ON public.trabajos;
CREATE POLICY "admin can delete trabajos"
ON public.trabajos
FOR DELETE
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Stage tables
DROP POLICY IF EXISTS "admin can delete trabajo agenda stage" ON public.trabajo_agenda_stage;
CREATE POLICY "admin can delete trabajo agenda stage"
ON public.trabajo_agenda_stage
FOR DELETE
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin can delete trabajo media assets" ON public.trabajo_media_assets;
CREATE POLICY "admin can delete trabajo media assets"
ON public.trabajo_media_assets
FOR DELETE
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin can delete trabajo visita stage" ON public.trabajo_visita_stage;
CREATE POLICY "admin can delete trabajo visita stage"
ON public.trabajo_visita_stage
FOR DELETE
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin can delete trabajo quotation stage" ON public.trabajo_quotation_stage;
CREATE POLICY "admin can delete trabajo quotation stage"
ON public.trabajo_quotation_stage
FOR DELETE
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin can delete trabajo sale stage" ON public.trabajo_sale_stage;
CREATE POLICY "admin can delete trabajo sale stage"
ON public.trabajo_sale_stage
FOR DELETE
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin can delete trabajo document overrides" ON public.trabajo_document_overrides;
CREATE POLICY "admin can delete trabajo document overrides"
ON public.trabajo_document_overrides
FOR DELETE
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Agenda bridge table
DROP POLICY IF EXISTS "admins can delete agenda items" ON public.agenda_items;
CREATE POLICY "admins can delete agenda items"
ON public.agenda_items
FOR DELETE
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
