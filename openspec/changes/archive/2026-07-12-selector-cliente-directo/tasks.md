# Tasks: Direct client selector navigation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 80-160 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Implementation tasks

- [x] 1. Add the client-side selector island in `src/features/documents/client-preview-selector.tsx`.
  - Build a small `"use client"` component that accepts `clients` and `template` (`"carta-poder" | "ubicacion-cliente"`).
  - Use `router.push()` from `next/navigation` to navigate to `/admin/documents/{template}/preview?clientId=<id>` on non-empty select changes.
  - Keep `defaultValue=""`, the `Selecciona un cliente` placeholder, accessible `label/htmlFor/id/name`, and a pending state that disables the select while navigation is in flight.
  - Verification: placeholder selection does not navigate; selecting a client builds the expected preview URL.

- [x] 2. Refactor `src/app/admin/documents/carta-poder/page.tsx` to use direct selection.
  - Keep `requireRole(["admin"])`, `getClients()`, `AppShell`, and the `Volver a descargables` link unchanged.
  - Remove `searchParams` handling, selected-client query state, the submit button, and the confirmation section with `Abrir vista previa`.
  - Replace the current form body with the new `ClientPreviewSelector` using `template="carta-poder"`.
  - Verification: the page renders the selector card only, and selecting a client goes straight to Carta Poder preview.

- [x] 3. Refactor `src/app/admin/documents/ubicacion-cliente/page.tsx` to use direct selection.
  - Keep the same server-side auth/data loading and surrounding page structure.
  - Remove `searchParams` handling, the submit button, and the confirmation section.
  - Render `ClientPreviewSelector` with `template="ubicacion-cliente"`.
  - Verification: the page renders the selector card only, and selecting a client goes straight to Ubicación del cliente preview.

- [x] 4. Validate unchanged preview/back behavior and project safety checks.
  - Manually verify both flows:
    - `/admin/documents/carta-poder` → select client → `/admin/documents/carta-poder/preview?clientId=<id>` → browser Back returns to selector.
    - `/admin/documents/ubicacion-cliente` → select client → `/admin/documents/ubicacion-cliente/preview?clientId=<id>` → browser Back returns to selector.
  - Confirm preview pages and `/admin/documents` remain unchanged in behavior.
  - Run `npm run lint`.
  - Run `npm run build`.
