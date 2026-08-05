-- Mantiene compatibilidad con la columna histórica de impuestos.
-- La aplicación ya no la captura, la escribe ni la usa para calcular totales.
ALTER TABLE public.quotation_items
  ALTER COLUMN tax_rate SET DEFAULT 0;
