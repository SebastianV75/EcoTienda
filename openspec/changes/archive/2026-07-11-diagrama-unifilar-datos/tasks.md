# Tasks: Diagrama unifilar data panel

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 180-320 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Implementation tasks

- [x] 1. Apply the additive solar-field schema update remotely and keep the repo SQL in sync.
  - Execute the 5 `alter table public.clients add column if not exists ... text;` statements against the remote Supabase project.
  - Update `docs/sql/create-clients-table.sql` with the same additive statements only for: `panel_count`, `panel_power`, `inverter`, `installed_capacity`, `estimated_monthly_generation`.
  - Do not add any other inferred CFE/metering fields, defaults, indexes, or constraints.
  - Verification: remote `public.clients` now exposes the 5 nullable columns and the SQL file matches exactly.

- [x] 2. Extend shared client typing and data fetch helpers for the new nullable fields.
  - Update `src/types/client.ts` so `ClientRecord` includes only the 5 new fields as `string | null`.
  - Leave `ClientFormValues` unchanged.
  - Update `src/features/clients/data.ts` so `clientSelect` includes the 5 columns and the existing helpers continue returning backward-compatible records.
  - Verification: `getClients()` and `getClientById()` can fetch records without breaking existing Carta Poder or Ubicación del cliente flows.

- [x] 3. Add the active document entry for the new flow.
  - Update `src/app/admin/documents/page.tsx` to add the `Diagrama unifilar` card with status `Activo` and `href` `/admin/documents/diagrama-unifilar`.
  - Preserve the current behavior and ordering expectations for `Carta Poder`, `Ubicación del cliente`, and `Formato CFE`.
  - Verification: `/admin/documents` shows the new active card and existing cards remain unchanged.

- [x] 4. Build the admin-only selector route for unifilar preview navigation.
  - Create `src/app/admin/documents/diagrama-unifilar/page.tsx` using `requireRole(["admin"])`, `AppShell`, and `getClients()`.
  - Reuse the established document-selector pattern to list options as `{full_name} · {rpu}` and navigate to `/admin/documents/diagrama-unifilar/preview?clientId=<id>`.
  - Keep Spanish user-facing copy and a `Volver a descargables` path back to `/admin/documents`.
  - Verification: selecting a client reaches the preview URL with the expected `clientId` query param.

- [x] 5. Build the preview route with recovery states and the read-only data panel component.
  - Create `src/app/admin/documents/diagrama-unifilar/preview/page.tsx` with admin guard, `clientId` validation, `getClientById(clientId)`, and recovery cards for missing or invalid clients.
  - Create `src/features/documents/diagrama-unifilar-preview.tsx` as a presentational component that renders only static text via two sections: `Datos del cliente` and `Equipo de generación`.
  - Map existing fields exactly as approved: `full_name`, `rpu` as `Número de servicio`, `rfc`, `phone`, `address`, `neighborhood`, plus only `panel_count`, `panel_power`, `inverter`, `installed_capacity`, `estimated_monthly_generation`.
  - Format null or blank values as `—`; do not add inputs, print actions, PDF actions, diagram graphics, or new dependencies.
  - Verification: valid clients render both sections; missing solar data renders `—`; missing/invalid `clientId` shows recovery navigation.

- [x] 6. Run regression and delivery validation before review.
  - Manually verify these paths:
    - `/admin/documents` shows `Diagrama unifilar` as active.
    - `/admin/documents/diagrama-unifilar` lists clients as `{full_name} · {rpu}`.
    - `/admin/documents/diagrama-unifilar/preview?clientId=<id>` renders both required sections and correct labels.
    - Existing `/admin/documents/carta-poder` and `/admin/documents/ubicacion-cliente` flows still work.
  - Run `npm run lint`.
  - Run `npm run build`.
  - Verification: manual checks pass and both commands exit successfully.
