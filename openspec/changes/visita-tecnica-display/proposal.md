# Proposal: Visita Técnica — Display legible de atributos JSONB

## Intent

La vista "Visita Técnica Completado" en `src/app/admin/trabajos/[id]/page.tsx` vuelca los 4 grupos de atributos JSONB (`house_attributes`, `electrical_attributes`, `roof_attributes`, `minisplit_attributes`) con `JSON.stringify(..., null, 2)` dentro de un `<pre>`. El admin ve llaves `{}`, comillas `""` y snake_case crudo: no es legible ni profesional. Queremos un render campo por campo, con etiquetas traducidas al español y un patrón pregunta-arriba / respuesta-abajo.

## Scope

### In Scope
- Render campo por campo de los 4 grupos de atributos en la sección Visita Técnica del detalle de trabajo (admin).
- Diccionario de traducción de claves snake_case → etiquetas en español humano (cubre los 4 flujos de visita: paneles, minisplit, ampliar, cambio-220).
- Patrón de layout: etiqueta arriba (negrita / color tenue), valor abajo.
- Reutilizar el helper existente `getDisplayValue()` (y/o un renderer nuevo) para valores nulos/vacíos → `—`.
- Manejo diferenciado de claves que guardan **asset IDs / UUIDs** (fotos, videos, imágenes): no mostrar UUID crudo — marcar como "Ver archivo" o fullestercicio diferido a design.

### Out of Scope
- Tocar base de datos, schema, migraciones o el guardado (server actions intocadas).
- Lógica de negocio / validación de `rules.ts`.
- Render de timeline, agenda, cotización, venta, descargables (sin cambios).
- Galería interactiva de media (asset viewer) — fuera del alcance de este cambio visual.

## Capabilities

### New Capabilities
- `trabajo-detail-display`: Render legible de la sección Visita Técnica en el detalle de trabajo admin, incluyendo traducción de atributos y patrón pregunta/respuesta. No existe spec previa que cubra esta vista.

### Modified Capabilities
- None — no hay spec `trabajo-detail-display` previa que modificar.

## Approach

1. Extraer un renderer `VisitaAttributeGroup` (componente client-safe reductor) que recibe un `TrabajoJsonObject` + grupo y devuelve lista de pares `{ key, label, value }`.
2. Centralizar el diccionario `visitaAttributeLabels` — un `Record<grupo, Record<snakeCase, labelEs>>` con fallback a la clave humanizada si no se mapea.
3. Reemplazar los 4 bloques `<pre>{JSON.stringify(...)}` por `<dl>` semántico: `<dt>` = etiqueta (text-xs font-medium text-[var(--brand-strong)]), `<dd>` = valor (text-sm text-[var(--foreground)]) — mismo sistema de diseño ya usado arriba en la misma vista para "Cita programada", "Asignado a", etc.
4. Reutilizar `getDisplayValue()` para fallback `—` en vacíos.
5. Mantener el guard de `Object.keys(...).length > 0` existente por grupo.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/admin/trabajos/[id]/page.tsx` (líneas ~185-216) | Modified | Reemplazar 4 `<pre>JSON.stringify` por `<dl>` con etiquetas traducidas. |
| `src/features/trabajos/components/` | New | Componente `visita-attribute-group.tsx` + módulo `visita-attribute-labels.ts`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Claves no contempladas en el diccionario | Med | Fallback humanizado (snake → Title Case) para claves desconocidas; log warn en dev. |
| Asset IDs (UUIDs) mostrados como texto feo | Med | Marcar claves `*_photo/*_image/*_video` como tipo media; mostrar "Archivo adjunto" hasta que design defina el viewer. |
| Regresión visual en flujos con grupos vacíos (minisplit, cambio-220) | Baja | Mantener guard `Object.keys.length > 0`; cubrir los 4 flujos. |

## Rollback Plan

Revert del commit. El cambio es puramente de presentación en un seul archivo de vista + 2 nuevos módicos contiguos. No hay migración ni cambio de datos — `git revert <sha>` restaura el render JSON.stringify anterior sin pérdida.

## Dependencies

- Ninguna nueva. Reutiliza helpers `getDisplayValue`, variables CSS `--brand-strong` / `--foreground` / `--muted` ya en uso.

## Success Criteria

- [ ] En el detalle de un trabajo con visita completada, los 4 grupos se muestran como pares etiqueta/valor legibles (0 llaves, 0 comillas, 0 snake_case visible).
- [ ] `roof_material` se muestra como "Material del techo"; `has_mufa` como "Tiene mufa".
- [ ] Valores nulos/vacíos muestran `—`, consistente con el resto de la vista.
- [ ] `npm run lint` y `npm run build` pasan sin regresión.
- [ ] Los server actions y `rules.ts` permanecen sin cambios (diff = 0 en esos archivos).

## Proposal question round (mathistique de refinamiento opcional)

Esperamos respuesta del usuario o scroll directo a specs/design sin tregua:

1. **Asset IDs (fotos/videos)**: ¿mostrar "Archivo adjunto" estático en este cambio, o ya diseñar el link al asset en Storage en esta misma propuesta?
2. **Booleanos (`has_mufa`, `has_marine_ladder`, `has_minisplit`)**: ¿renderizar "Sí"/"No" o mantener el valor crudo guardado?
3. **Claves desconocidas** (futuras visitas con campos nuevos): ¿fallback Title Case silencioso, o bloque visible "atributo no reconocido" para forzar actualización del diccionario?
4. **Orden dentro de cada grupo**: ¿orden del diccionario (fijo, curado) u orden de inserción del JSONB (orden de captura)?