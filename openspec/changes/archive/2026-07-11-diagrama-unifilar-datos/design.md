# Diagrama unifilar data panel design

This change adds a data-only unifilar document flow: document card, client selector, preview route, nullable client fields, and a read-only two-section data panel. It intentionally does not render the graphical diagram, generate print/PDF output, or introduce new dependencies.

## Design summary

| Area | Decision |
|------|----------|
| Scope | Ship only the data-side panel for the unifilar document. The real diagram remains deferred until reference assets are provided. |
| Data model | Add 5 nullable `text` columns on `public.clients` for solar equipment; do not modify existing columns or require backfill. |
| Fetching | Extend the existing `clientSelect` projection and `ClientRecord` type so existing helpers return the new nullable fields. |
| Documents index | Add one active template entry for `Diagrama unifilar` pointing to `/admin/documents/diagrama-unifilar`. |
| Selector | Add a selector page at `/admin/documents/diagrama-unifilar` using `AppShell`, `getClients()`, and a small client selector component that navigates to preview with `clientId`. |
| Preview | Add `/admin/documents/diagrama-unifilar/preview?clientId=<id>` with the same admin guard and recovery-card behavior used by existing document previews. |
| Data panel | Implement a read-only presentational component with two independent sections: client data and solar equipment. |
| Null display | Render missing values as `—`, not empty strings or editable fields. |
| Existing flows | Do not change Carta Poder or Ubicación del cliente behavior except for safe shared type/data projection additions. |

## Data model

Add 5 nullable columns for the solar equipment fields displayed in the data panel side section:

```sql
alter table public.clients add column if not exists panel_count text;
alter table public.clients add column if not exists panel_power text;
alter table public.clients add column if not exists inverter text;
alter table public.clients add column if not exists installed_capacity text;
alter table public.clients add column if not exists estimated_monthly_generation text;
```

Apply these in `docs/sql/create-clients-table.sql` as additive `alter table ... add column if not exists` statements. No defaults, indexes, constraints, triggers, or form fields are needed for this slice.

Update `src/types/client.ts`:

- Add the 5 fields to `ClientRecord` as `string | null`.
- Do not add them to `ClientFormValues`; this slice has no client create/edit UI for these fields.

Update `src/features/clients/data.ts`:

- Extend `clientSelect` with the 5 new column names.
- Keep `normalizeClient(row)` as a pass-through unless Supabase returns a field shape that needs normalization.

## Data flow

```text
/admin/documents
  -> template card links to /admin/documents/diagrama-unifilar

/admin/documents/diagrama-unifilar
  -> requireRole(["admin"])
  -> getClients()
  -> render selector options: full_name · rpu
  -> navigate to /admin/documents/diagrama-unifilar/preview?clientId=<id>

/admin/documents/diagrama-unifilar/preview?clientId=<id>
  -> requireRole(["admin"])
  -> validate clientId exists
  -> getClientById(clientId)
  -> render DiagramaUnifilarPreview(client)
  -> null fields display as —
```

## File-level design

| File | Change |
|------|--------|
| `docs/sql/create-clients-table.sql` | Add the 5 nullable columns using `add column if not exists`. |
| `src/types/client.ts` | Extend `ClientRecord` with 5 nullable field types. Leave `ClientFormValues` unchanged. |
| `src/features/clients/data.ts` | Add the 5 new columns to `clientSelect` so selector and preview receive complete records. |
| `src/app/admin/documents/page.tsx` | Add an active `Diagrama unifilar` template card before or after existing active templates. Keep existing entries unchanged. |
| `src/app/admin/documents/diagrama-unifilar/page.tsx` | New admin-only selector page with `AppShell`, back link to `/admin/documents`, and client selector card. |
| `src/app/admin/documents/diagrama-unifilar/preview/page.tsx` | New admin-only preview route with missing/invalid `clientId` recovery cards and navigation back to selector/documents. |
| `src/features/documents/diagrama-unifilar-preview.tsx` | New read-only presentational data panel component. |

## Component contracts

### Preview component

```ts
type DiagramaUnifilarPreviewProps = {
  client: ClientRecord;
};
```

Suggested internal structure:

```ts
type PanelField = { label: string; value: string | null | undefined };
type PanelSection = { title: string; fields: PanelField[] };
```

Rendering rules:

- Render `<article>` containing two section cards.
- Render each section from data arrays so sections can be moved into a future diagram layout without changing field mapping.
- Use `<dl>`, `<dt>`, and `<dd>` for label/value pairs.
- Use static text only; no `input`, `textarea`, `contentEditable`, or mutation controls.
- `formatPanelValue(value)` returns trimmed value or `—`.

Field mapping:

| Section | Fields |
|---------|--------|
| Datos del cliente | `Nombre del titular -> full_name`, `Número de servicio -> rpu`, `R.F.C. -> rfc`, `Teléfono -> phone`, `Domicilio -> address`, `Colonia -> neighborhood` |
| Equipo de generación | `Cantidad de paneles -> panel_count`, `Potencia de paneles -> panel_power`, `Inversor -> inverter`, `Capacidad instalada -> installed_capacity`, `Generación media mensual estimada -> estimated_monthly_generation` |

## Route behavior and errors

Preview route should handle three cases:

1. Missing `clientId`: render an `AppShell` recovery card explaining that a client must be selected, with a link to `/admin/documents/diagrama-unifilar`.
2. Invalid or missing client record: catch `getClientById` errors and render a recovery card with links to choose another client and return to documents.
3. Valid client: render navigation links and `DiagramaUnifilarPreview`.

Do not call `redirect()` unless the implementation intentionally matches an existing pattern. A recovery card is safer for user orientation and aligns with `ubicacion-cliente`.

## Styling and UX

- Reuse existing Tailwind tokens and card shapes: `rounded-[28px]`, `border-[var(--border-soft)]`, `bg-white`, `shadow-sm`.
- Keep mobile-first grids; use one column by default and two columns for wider screens where helpful.
- Do not add animations beyond existing button/link transitions.
- Do not add a print button or print-specific workflow in this slice.
- Display the CFE service identifier as `Número de servicio`, using existing `client.rpu`.

## Tests and verification

Manual or automated checks should cover:

- `/admin/documents` shows `Diagrama unifilar` as `Activo` and preserves existing template cards.
- `/admin/documents/diagrama-unifilar` is admin-protected and lists clients as `{full_name} · {rpu}`.
- Selecting a client reaches `/admin/documents/diagrama-unifilar/preview?clientId=<id>`.
- Preview renders the two required section headings: "Datos del cliente" and "Equipo de generación".
- Populated fields show actual values.
- Null solar equipment fields show `—` and do not crash the page.
- Missing `clientId` shows a recovery path.
- Invalid `clientId` shows a recovery path.
- Existing Carta Poder and Ubicación del cliente flows still render.
- `npm run lint` passes.
- `npm run build` passes.

## Rollout and rollback

Rollout:

1. Apply the additive SQL changes in Supabase.
2. Deploy the application changes.
3. Populate solar equipment fields directly in Supabase only when data is available.

Rollback:

- Revert application files to remove the new routes, card, and component.
- Optionally drop the new columns later if confirmed unused. Because every column is nullable and additive, leaving them in place is safe.

## Risks

| Risk | Mitigation |
|------|------------|
| Solar equipment fields are not yet populated for most clients | All 5 new fields are nullable; preview displays "—" for missing values. No required data entry in this slice. |
| Existing helpers may fail if the database migration is not applied before deployment | Apply SQL before deploying code that selects the new columns. |
| Users expect the graphical diagram | Page copy should say this is a data preview for the unifilar document, not the finished diagram. |

## Out of scope

- Graphical unifilar diagram rendering.
- SVG/canvas/drawing library integration.
- Print or PDF export.
- New client create/edit form fields for the 5 solar equipment values.
- New dependencies.
- Changes to existing document preview layouts beyond shared type/data projection updates.
