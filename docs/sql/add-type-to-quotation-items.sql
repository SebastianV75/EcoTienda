-- Migración: Agregar campo type a quotation_items
-- Ejecutar en Supabase SQL Editor

-- Agregar columna type con valor por defecto 'product'
ALTER TABLE quotation_items 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'product';

-- Actualizar registros existentes que podrían tener valores NULL
UPDATE quotation_items SET type = 'product' WHERE type IS NULL;
