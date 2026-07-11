# Tasks — Ubicación del cliente

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 180-320 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Implementation tasks

- [x] 1. Activate the template entry on the documents index
  - File: `src/app/admin/documents/page.tsx`
  - Update the `templates` entry for **Ubicación del cliente** to `status: "Activo"` and `href: "/admin/documents/ubicacion-cliente"`.
  - Adjust the description so it no longer presents the template as pending.
  - Verification: `/admin/documents` shows the card as active and navigable; other pending templates remain unchanged.

- [x] 2. Add the client selector route for the preview-only flow
  - File: `src/app/admin/documents/ubicacion-cliente/page.tsx` (new)
  - Mirror the pattern from `src/app/admin/documents/carta-poder/page.tsx`.
  - Require admin access with `requireRole(["admin"])`.
  - Load clients with `getClients()` from `src/features/clients/data.ts`.
  - Render the selector inside `AppShell` with a back link to `/admin/documents`.
  - Only show the preview CTA when `searchParams.clientId` is present.
  - Verification: selecting a client enables navigation to `/admin/documents/ubicacion-cliente/preview?clientId=<id>`; no CTA is shown before selection.

- [x] 3. Build the preview presentation component with field and map fallbacks
  - Files: `src/features/documents/ubicacion-cliente-preview.tsx` (new), `src/types/client.ts` (confirm compatibility only; change only if implementation proves it necessary)
  - Accept a `ClientRecord` and render: `full_name`, `address`, `neighborhood`, `rpu`, `rfc`, `latitude`, `longitude`.
  - Add a helper for empty values that renders `Sin dato` instead of omitting rows.
  - Add coordinate validation so nullish/non-finite/both-zero coordinates show `Sin coordenadas guardadas`.
  - Build a Google Static Maps `<img>` URL using `process.env.GOOGLE_MAPS_API_KEY`; if the key is missing, show a map-unavailable empty state instead of failing.
  - Keep the layout mobile-first: stacked by default, no horizontal overflow, map full width.
  - Verification: populated values render correctly; empty RFC or similar fields show `Sin dato`; invalid coordinates show the empty map state.

- [x] 4. Add the admin preview route with graceful error handling
  - File: `src/app/admin/documents/ubicacion-cliente/preview/page.tsx` (new)
  - Mirror the structure of `src/app/admin/documents/carta-poder/preview/page.tsx` but keep this slice preview-only.
  - Require admin access with `requireRole(["admin"])`.
  - Read `searchParams.clientId`; when missing, render a recovery card linking back to `/admin/documents/ubicacion-cliente`.
  - Call `getClientById(clientId)` from `src/features/clients/data.ts`; catch lookup errors and render a friendly fallback card instead of crashing.
  - Render navigation links for `Cambiar cliente` and `Volver a descargables`.
  - Do **not** import or render `PrintButton`.
  - Verification: valid client renders preview; missing or invalid `clientId` returns a usable recovery state; no print/download UI appears.

- [x] 5. Run project safety-net validation for the narrow slice
  - Commands: `npm run lint`, `npm run build`
  - Manual checks:
    - `/admin/documents` exposes the active template link.
    - `/admin/documents/ubicacion-cliente` lists clients and keeps the preview CTA hidden until a client is selected.
    - `/admin/documents/ubicacion-cliente/preview?clientId=<id>` shows the seven required fields and the map or the correct empty state.
    - At mobile width (~375px), the preview stacks vertically without horizontal scroll.
  - Record any follow-up needed for later slices, but do not add print/PDF scope in this PR.

## Suggested review path

1. `src/app/admin/documents/page.tsx`
2. `src/app/admin/documents/ubicacion-cliente/page.tsx`
3. `src/app/admin/documents/ubicacion-cliente/preview/page.tsx`
4. `src/features/documents/ubicacion-cliente-preview.tsx`
5. Validation evidence from `npm run lint` and `npm run build`
