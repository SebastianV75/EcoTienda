# Apply progress — diagrama-unifilar-datos

## Completed tasks

- [x] 1. Apply the additive solar-field schema update remotely and keep the repo SQL in sync.
- [x] 2. Extend shared client typing and data fetch helpers for the new nullable fields.
- [x] 3. Add the active document entry for the new flow.
- [x] 4. Build the admin-only selector route for unifilar preview navigation.
- [x] 5. Build the preview route with recovery states and the read-only data panel component.
- [x] 6. Run regression and delivery validation before review.

## Files changed

- `docs/sql/create-clients-table.sql` — appended 5 additive `alter table public.clients add column if not exists ... text;` statements (`panel_count`, `panel_power`, `inverter`, `installed_capacity`, `estimated_monthly_generation`).
- `src/types/client.ts` — extended `ClientRecord` with the 5 nullable fields (`string | null`); `ClientFormValues` left unchanged.
- `src/features/clients/data.ts` — extended `clientSelect` projection to include the 5 new columns; `normalizeClient` unchanged.
- `src/features/documents/client-preview-selector.tsx` — added `"diagrama-unifilar"` to the `DocumentTemplateSlug` union.
- `src/app/admin/documents/page.tsx` — added a new active template card "Diagrama unifilar" linking to `/admin/documents/diagrama-unifilar`; existing Carta Poder, Ubicación del cliente, and Formato CFE entries preserved unchanged.
- `src/app/admin/documents/diagrama-unifilar/page.tsx` (new) — admin-only selector page with `AppShell`, `requireRole(["admin"])`, `getClients()`, "Volver a descargables" link, and `ClientPreviewSelector` with `template="diagrama-unifilar"`.
- `src/app/admin/documents/diagrama-unifilar/preview/page.tsx` (new) — admin-only preview route with `clientId` validation; recovery cards for missing or invalid clients; "Cambiar cliente" + "Volver a descargables" navigation; no print button per spec.
- `src/features/documents/diagrama-unifilar-preview.tsx` (new) — read-only presentational data panel with two independent `PanelSectionCard` sections ("Datos del cliente" and "Equipo de generación"); null/blank values render as `—` via `formatPanelValue`; static text only, no inputs/buttons.
- `openspec/changes/diagrama-unifilar-datos/tasks.md` — checkboxes marked complete for tasks 1–6.

## Remote SQL evidence

Migration applied against the linked Supabase project `EcoTienda` (ref `hnyldmmihqfpajvulfkw`):

```text
$ npx supabase db query --linked --file docs/sql/create-clients-table.sql
Initialising login role...

$ npx supabase db query --linked "select column_name, data_type, is_nullable from information_schema.columns where table_schema = 'public' and table_name = 'clients' and column_name in ('panel_count','panel_power','inverter','installed_capacity','estimated_monthly_generation') order by column_name;"
Initialising login role...
┌──────────────────────────────┬───────────┬─────────────┐
│ column_name                  │ data_type │ is_nullable │
├──────────────────────────────┼───────────┼─────────────┤
│ estimated_monthly_generation │ text      │ YES         │
│ installed_capacity           │ text      │ YES         │
│ inverter                     │ text      │ YES         │
│ panel_count                  │ text      │ YES         │
│ panel_power                  │ text      │ YES         │
└──────────────────────────────┴───────────┴─────────────┘
```

All 5 columns are present on the remote `public.clients` table as nullable `text`. The full `create-clients-table.sql` is idempotent (every DDL uses `if not exists` or `drop ... if exists`), so re-running the file is safe.

## Verification commands

- `npm run lint` → 0 errors. 1 pre-existing warning in `src/features/documents/ubicacion-cliente-preview.tsx` (no-img-element on the static map `<img>`); unrelated to this change and not in any of the touched files.
- `npm run build` → success. Both new routes appear in the build output:
  - `ƒ /admin/documents/diagrama-unifilar`
  - `ƒ /admin/documents/diagrama-unifilar/preview`
- TypeScript: clean (`Finished TypeScript in 1717ms`).

## Deviations from design

None. Exact approved fields only, no inferred CFE/metering columns, no print/PDF action, no graphical diagram, no new dependencies, no edits to `ClientFormValues`.

## Remaining tasks

None. All tasks complete. Ready for `sdd-verify`.
