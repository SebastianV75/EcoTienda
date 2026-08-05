-- EcoTienda: Schema para módulo de cotizaciones con generación de PDF
-- Ejecutar este SQL en Supabase → SQL Editor

-- Tabla de configuración de compañía
CREATE TABLE company_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'EcoTienda',
  slogan TEXT DEFAULT 'Soluciones sustentables para tu hogar',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip_code TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  fax TEXT DEFAULT '',
  email TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  payment_terms_days INTEGER DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO company_settings (company_name, slogan, address, city, state, zip_code, phone, email, contact_name)
VALUES (
  'EcoTienda',
  'Soluciones sustentables para tu hogar',
  'Av. Principal 123',
  'Guadalajara',
  'Jalisco',
  '44100',
  '(33) 1234-5678',
  'contacto@ecotienda.com',
  'Administrador EcoTienda'
);

-- Políticas RLS para company_settings
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view company_settings"
  ON company_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update company_settings"
  ON company_settings FOR UPDATE TO authenticated USING (true);

-- Tabla de proveedores
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  nif TEXT,
  email TEXT,
  phone TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de cotizaciones
CREATE TABLE quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number TEXT UNIQUE,
  trabajo_id UUID REFERENCES trabajos(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  supplier_reference TEXT,
  order_deadline TIMESTAMPTZ,
  expected_delivery DATE,
  require_confirmation BOOLEAN DEFAULT FALSE,
  deliver_to TEXT DEFAULT '',
  project TEXT,
  terms_and_conditions TEXT,
  subtotal NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabla de items de cotización
CREATE TABLE quotation_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity NUMERIC(10, 2) DEFAULT 1,
  unit TEXT DEFAULT 'pz',
  unit_price NUMERIC(12, 2) DEFAULT 0,
  -- Campo legado: la aplicación ya no captura ni calcula impuestos.
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  amount NUMERIC(12, 2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas
CREATE INDEX idx_quotations_supplier ON quotations(supplier_id);
CREATE INDEX idx_quotations_trabajo ON quotations(trabajo_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_number ON quotations(quotation_number);
CREATE INDEX idx_quotation_items_quotation ON quotation_items(quotation_id);

-- Políticas RLS (Row Level Security)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- Permitir acceso a usuarios autenticados
CREATE POLICY "Authenticated users can view suppliers"
  ON suppliers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert suppliers"
  ON suppliers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers"
  ON suppliers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view quotations"
  ON quotations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert quotations"
  ON quotations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update quotations"
  ON quotations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete quotations"
  ON quotations FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view quotation_items"
  ON quotation_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert quotation_items"
  ON quotation_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update quotation_items"
  ON quotation_items FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete quotation_items"
  ON quotation_items FOR DELETE TO authenticated USING (true);

-- =============================================
-- MIGRACIÓN: Hacer columnas de proveedor opcionales (para cotizaciones solo con cliente)
-- Ejecutar si la tabla ya existe con restricciones NOT NULL
-- =============================================

ALTER TABLE quotations
  ALTER COLUMN supplier_id DROP NOT NULL,
  ALTER COLUMN supplier_name DROP NOT NULL,
  ALTER COLUMN supplier_reference DROP NOT NULL,
  ALTER COLUMN order_deadline DROP NOT NULL,
  ALTER COLUMN expected_delivery DROP NOT NULL,
  ALTER COLUMN require_confirmation DROP NOT NULL,
  ALTER COLUMN deliver_to DROP NOT NULL;

-- Verificar que status permite NULL (para edición)
-- Si la tabla ya tiene status con DEFAULT 'draft', esta línea es opcional:
-- ALTER TABLE quotations ALTER COLUMN status DROP NOT NULL;
