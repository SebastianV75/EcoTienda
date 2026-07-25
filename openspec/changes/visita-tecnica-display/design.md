# Design: Visita Técnica Display — JSONB Attribute Rendering

## Technical Approach

Reemplazar el renderizado crudo de los 4 grupos JSONB (`house_attributes`, `electrical_attributes`, `roof_attributes`, `minisplit_attributes`) mediante un componente presentacional `VisitaAttributeGroup` que itera campo por campo, traduce claves a etiquetas en español, y renderiza valores con type-awareness (null→`—`, boolean→`Sí`/`No`, asset ID→vista previa de imagen).

El cambio es puramente visual: diff = 0 en server actions, `rules.ts`, y schema de base de datos.

## Architecture Decisions

| Decisión | Opción elegida | Alternativas rechazadas | Rationale |
|----------|----------------|------------------------|-----------|
| **Asset IDs → Vista previa** | Resolver URL pública de Supabase Storage y renderizar `<img>` con fallback a enlace | Mostrar solo el asset ID como texto | Los asset IDs son UUIDs de archivos en Supabase Storage; el usuario final necesita ver la imagen, no el ID |
| **Booleanos → "Sí"/"No"** | Mapear strings `"Si"`/`"No"` y booleans `true`/`false` a texto en español | Mostrar valores crudos (`"Si"`, `true`) | Consistencia con el resto de la UI en español; los formularios guardan `"Si"`/`"No"` como strings |
| **Claves desconocidas → Title Case** | Función `toTitleCase(key)` que convierte `snake_case` a `Title Case` | Mostrar la clave técnica en inglés (`has_mufa`) | Legibilidad para el usuario final; fallback automático si el diccionario no cubre una clave |
| **Orden de campos** | Orden curado en el diccionario por grupo | Orden alfabético o de inserción | Los formularios tienen un orden lógico (ej: techo → material → aislamiento → estructura); el diccionario lo respeta |

## Data Flow

```
trabajo.visita.{group}_attributes (JSONB)
    ↓
VisitaAttributeGroup component
    ↓
┌─────────────────────────────────────┐
│ 1. Itera entradas del objeto JSONB  │
│ 2. Busca etiqueta en diccionario    │
│ 3. Si no existe → Title Case        │
│ 4. Renderiza valor con type-aware:  │
│    - null/undefined → "—"           │
│    - boolean/"Si"/"No" → "Sí"/"No"  │
│    - asset ID → <img> o <a>         │
│    - string/number → texto plano    │
└─────────────────────────────────────┘
    ↓
Layout: etiqueta arriba, valor abajo
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/trabajos/components/visita-attribute-group.tsx` | Create | Componente presentacional que renderiza un grupo JSONB campo por campo |
| `src/features/trabajos/visita-attribute-labels.ts` | Create | Diccionario de traducción clave→etiqueta por grupo (house, electrical, roof, minisplit) |
| `src/app/admin/trabajos/[id]/page.tsx` | Modify | Reemplazar los 4 bloques `<pre>{JSON.stringify(...)}</pre>` por `<VisitaAttributeGroup>` |

## Interfaces / Contracts

### Diccionario de traducción

```typescript
// src/features/trabajos/visita-attribute-labels.ts

export type AttributeGroup = "house" | "electrical" | "roof" | "minisplit";

export const visitaAttributeLabels: Record<AttributeGroup, Record<string, string>> = {
  house: {
    hojas_visita: "Hojas de visita",
    house_image: "Imagen de casa",
    orientation: "Orientación",
    floors: "Pisos",
    email: "Correo electrónico",
    location: "Ubicación",
  },
  electrical: {
    meter_far: "Imagen del medidor de lejos",
    meter_close: "Imagen de medidor de cerca",
    voltage: "Voltaje",
    meter_position: "Medidor",
    has_mufa: "Tiene mufa",
    load_center: "Imagen de centro de carga",
    electrical_rise: "Imagen de subida eléctrica",
  },
  roof: {
    has_marine_ladder: "Tiene escalera marina",
    roof_image: "Imagen del techo",
    roof_material: "Material del techo",
    insulation_type: "Tipo de aislamiento",
    shading_1: "Imagen de sombreado 1",
    shading_2: "Imagen de sombreado 2",
    roof_measurements: "Medidas del techo",
    structure_type: "Tipo de estructura",
  },
  minisplit: {
    has_minisplit: "¿Con minisplits?",
    minisplit_specs: "Especificaciones de minisplit",
    minisplit_photo: "Foto de donde va el minisplit",
  },
};
```

### Componente presentacional

```typescript
// src/features/trabajos/components/visita-attribute-group.tsx

type VisitaAttributeGroupProps = {
  group: AttributeGroup;
  attributes: Record<string, string>;
  title: string;
};

export function VisitaAttributeGroup({ group, attributes, title }: VisitaAttributeGroupProps) {
  // Itera attributes, busca etiqueta en visitaAttributeLabels[group]
  // Renderiza cada par etiqueta/valor con layout question-above/answer-below
  // Type-aware: null→"—", boolean→"Sí"/"No", asset ID→<img> o <a>
}
```

### Resolución de asset IDs

Los asset IDs en los JSONB son UUIDs que referencian archivos en Supabase Storage (bucket `trabajos`). Para resolver la URL pública:

```typescript
const { data } = supabase.storage
  .from("trabajos")
  .getPublicUrl(assetId);

const imageUrl = data.publicUrl;
```

El componente `VisitaAttributeGroup` debe recibir el cliente de Supabase o la URL resuelta desde el server component padre.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `visita-attribute-labels.ts` | Verificar que todas las claves de los 4 grupos tienen etiqueta en español |
| Unit | `toTitleCase()` fallback | Verificar conversión `snake_case` → `Title Case` para claves no curadas |
| Unit | Type-aware rendering | Verificar que null→`—`, `"Si"`→`Sí`, `true`→`Sí`, asset ID→URL pública |
| Integration | `VisitaAttributeGroup` con datos reales | Renderizar con mock de `house_attributes` y verificar que muestra etiquetas y valores correctamente |
| Visual | Comparación antes/después | Verificar que el layout question-above/answer-below es legible y consistente con el resto de la UI |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. El cambio es puramente visual y no modifica el schema de base de datos ni los server actions.

## Open Questions

- [ ] ¿Existe un helper centralizado para resolver URLs públicas de Supabase Storage, o debe crearse uno?
- [ ] ¿Los asset IDs en los JSONB son paths completos o solo UUIDs? (Determina si se necesita concatenar con el bucket name)
- [ ] ¿Se debe agregar un fallback de imagen (placeholder) cuando la URL pública no resuelve, o mostrar un enlace roto es aceptable?
