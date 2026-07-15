-- Migración: Agregar política de DELETE para quotations
-- Ejecutar en Supabase SQL Editor

CREATE POLICY "Authenticated users can delete quotations"
  ON quotations FOR DELETE TO authenticated USING (true);
