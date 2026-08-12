-- Migración: Agregar política de DELETE para quotations
-- Ejecutar en Supabase SQL Editor
-- Ejecuta primero create-workers-table.sql o add-administrative-role-to-workers.sql.

DROP POLICY IF EXISTS "Authenticated users can delete quotations" ON public.quotations;
CREATE POLICY "Authenticated users can delete quotations"
  ON public.quotations FOR DELETE TO authenticated
  USING ((select app_private.current_worker_role()) in ('admin', 'administrative', 'technician'));
