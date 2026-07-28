-- Agregar constraint única para quotation_number
-- Esto previene duplicados a nivel de base de datos

-- Primero, identificar y resolver duplicados existentes
-- Renombrar duplicados agregando un sufijo único
DO $$
DECLARE
    dup_record RECORD;
    dup_count INTEGER;
    new_number TEXT;
BEGIN
    -- Encontrar todos los quotation_number duplicados
    FOR dup_record IN 
        SELECT quotation_number, COUNT(*) as count
        FROM quotations
        WHERE quotation_number IS NOT NULL
        GROUP BY quotation_number
        HAVING COUNT(*) > 1
    LOOP
        dup_count := 1;
        
        -- Para cada duplicado (excepto el primero), renombrarlo
        FOR dup_record IN 
            SELECT id, quotation_number, created_at
            FROM quotations
            WHERE quotation_number = dup_record.quotation_number
            ORDER BY created_at ASC
            OFFSET 1 -- Saltar el primero
        LOOP
            dup_count := dup_count + 1;
            new_number := dup_record.quotation_number || '-' || dup_count;
            
            UPDATE quotations
            SET quotation_number = new_number
            WHERE id = dup_record.id;
            
            RAISE NOTICE 'Renombrado % a %', dup_record.quotation_number, new_number;
        END LOOP;
    END LOOP;
END $$;

-- Agregar constraint única
ALTER TABLE quotations 
ADD CONSTRAINT quotations_quotation_number_unique 
UNIQUE (quotation_number);

-- Crear índice para mejorar performance de búsquedas
CREATE INDEX IF NOT EXISTS idx_quotations_quotation_number 
ON quotations(quotation_number);
