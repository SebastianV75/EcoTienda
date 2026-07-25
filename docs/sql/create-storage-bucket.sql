-- Crear bucket para imágenes y videos de visita técnica
INSERT INTO storage.buckets (id, name, public)
VALUES ('visita-images', 'visita-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política: cualquier usuario autenticado puede subir imágenes
CREATE POLICY "Usuarios autenticados pueden subir"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'visita-images');

-- Política: cualquier usuario autenticado puede leer imágenes
CREATE POLICY "Usuarios autenticados pueden leer"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'visita-images');

-- Política: cualquier usuario autenticado puede eliminar imágenes
CREATE POLICY "Usuarios autenticados pueden eliminar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'visita-images');

-- Política: acceso público de lectura (para mostrar imágenes sin auth)
CREATE POLICY "Lectura pública"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'visita-images');
