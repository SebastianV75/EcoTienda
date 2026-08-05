# Guía de Configuración - Generación de PDF para Cotizaciones

## Resumen

El módulo de cotizaciones ahora incluye generación automática de PDF profesional al guardar cada cotización. El PDF se almacena en Supabase Storage y puede descargarse bajo demanda.

---

## Configuración en Supabase

### 1. Ejecutar el SQL

Ve a **Supabase Dashboard → SQL Editor** y ejecuta el contenido completo de:

```
docs/quotations-schema.sql
```

Este script crea:

- Tabla `company_settings` con datos iniciales de EcoTienda
- Tabla `suppliers` para proveedores
- Tabla `quotations` con campos `quotation_number` y `pdf_url`
- Tabla `quotation_items` para productos
- Políticas RLS para usuarios autenticados

### 2. Crear Bucket de Storage

1. Ve a **Supabase Dashboard → Storage**
2. Click en **"New bucket"**
3. Configuración:
   - **Name:** `quotations`
   - **Public bucket:** `false` (desactivado)
   - **File size limit:** 10 MB (suficiente para PDFs)
4. Click en **"Create bucket"**

### 3. Configurar Políticas del Bucket

En el bucket `quotations`, ve a **Policies** y crea:

**Policy 1: Authenticated users can upload**

```sql
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'quotations');
```

**Policy 2: Authenticated users can view**

```sql
CREATE POLICY "Authenticated users can view"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'quotations');
```

**Policy 3: Authenticated users can delete**

```sql
CREATE POLICY "Authenticated users can delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'quotations');
```

---

## Uso del Sistema

### Crear una Nueva Cotización

1. Navega a `/admin/quotations/new`
2. Selecciona o crea un proveedor
3. Agrega productos indicando piezas y precio unitario
4. Click en **"Guardar cotización"**

**Resultado:**

- Se genera automáticamente un número consecutivo: `EcoCotizacion-001`, `EcoCotizacion-002`, etc.
- Se crea el PDF profesional con todos los datos
- El PDF se sube a Supabase Storage
- Se redirige a la página de detalles de la cotización

### Ver Detalles de Cotización

Navega a `/admin/quotations/[id]` para ver:

- Datos del proveedor y cliente
- Tabla de productos
- Totales (subtotal, total)
- Términos y condiciones
- Botón **"Descargar PDF"**

### Descargar PDF

Click en **"Descargar PDF"** en la página de detalles.

El archivo se descarga como: `EcoCotizacion-001.pdf`

---

## Estructura del PDF

El PDF generado incluye:

1. **Encabezado**
   - Logo y datos de EcoTienda (izquierda)
   - Título "Cotización" en cursiva (derecha)
   - Fecha, número de cotización, ID del cliente

2. **Información del Cliente**
   - Datos del proveedor (izquierda)
   - Fecha de validez y preparada por (derecha)

3. **Notas**
   - Comentarios o instrucciones especiales

4. **Tabla Comercial**
   - Vendedor, Número de O/C, Fecha de envío, Envío mediante, Punto F.O.B., Términos

5. **Tabla de Productos**
   - Piezas, Descripción, Precio unitario, Monto

6. **Totales**
   - Subtotal, Total

7. **Pie de Página**
   - Información de contacto
   - "¡GRACIAS POR SU COMPRA!"

---

## Personalización

### Modificar Datos de la Compañía

Edita la tabla `company_settings` en Supabase:

```sql
UPDATE company_settings SET
  company_name = 'Tu Empresa',
  slogan = 'Tu eslogan',
  address = 'Tu dirección',
  city = 'Tu ciudad',
  state = 'Tu estado',
  zip_code = 'Tu CP',
  phone = 'Tu teléfono',
  email = 'tu@email.com',
  contact_name = 'Nombre de contacto',
  payment_terms_days = 30
WHERE id = (SELECT id FROM company_settings LIMIT 1);
```

### Modificar Estilos del PDF

Edita el archivo:

```
src/features/quotations/pdf/pdf-styles.ts
```

Puedes cambiar:

- Colores (paleta azul institucional)
- Tamaños de fuente
- Espaciados
- Bordes

---

## Solución de Problemas

### El PDF no se genera

**Causa:** Error en la generación o subida a Storage.

**Solución:**

1. Verifica que el bucket `quotations` existe en Storage
2. Verifica las políticas del bucket
3. Revisa los logs del servidor para errores específicos

### El PDF se genera pero no se descarga

**Causa:** Problema con la URL pública del Storage.

**Solución:**

1. Ve a **Storage → quotations → Settings**
2. Verifica que la URL pública esté configurada
3. Si el bucket es privado, el sistema usa URLs firmadas automáticamente

### Error "No se pudo cargar la cotización"

**Causa:** El ID de cotización no existe o no tienes permisos.

**Solución:**

1. Verifica que estés autenticado como admin
2. Verifica que el ID de cotización sea correcto
3. Revisa la tabla `quotations` en Supabase

---

## Archivos Creados

```
src/
├── types/
│   └── quotation.ts                       # Tipos actualizados
├── features/
│   └── quotations/
│       ├── pdf/
│       │   ├── pdf-styles.ts              # Estilos y colores
│       │   ├── pdf-header.tsx             # Encabezado
│       │   ├── pdf-client-info.tsx        # Info cliente
│       │   ├── pdf-notes.tsx              # Notas
│       │   ├── pdf-commercial-table.tsx   # Tabla comercial
│       │   ├── pdf-products-table.tsx     # Tabla productos
│       │   ├── pdf-totals.tsx             # Totales
│       │   ├── pdf-footer.tsx             # Pie de página
│       │   └── quotation-pdf.tsx          # Documento PDF
│       ├── quotation-number.ts            # Generador de números
│       ├── pdf-generator.tsx              # Servicio de generación
│       └── actions.ts                     # Server actions actualizado
└── app/
    ├── api/
    │   └── quotations/
    │       └── [id]/
    │           └── pdf/
    │               └── route.ts           # API descarga PDF
    └── admin/
        └── quotations/
            └── [id]/
                └── page.tsx               # Página de detalles
```

---

## Próximos Pasos

1. **Regenerar PDF:** Agregar botón para regenerar PDF si cambian los datos
2. **Enviar por Email:** Integrar envío automático de PDF por correo
3. **Firmas Digitales:** Agregar campo de firma en el PDF
4. **Marca de Agua:** Agregar marca de agua "BORRADOR" hasta que se confirme
5. **Multi-página:** Soporte para cotizaciones con muchos productos

---

## Soporte

Si encuentras problemas:

1. Revisa los logs del servidor (`npm run dev`)
2. Verifica la consola del navegador
3. Consulta la tabla `quotations` en Supabase para ver si `pdf_url` está poblado
4. Verifica que el archivo existe en Storage
