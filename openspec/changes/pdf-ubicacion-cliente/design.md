# Design: PDF export for client location sheet

## Summary

Use the existing browser-print pattern already present for `carta-poder`: add a screen-only print action to the ubicacion-cliente preview route and tune the current preview markup with Tailwind print utilities. The first slice stays client-side, dependency-free, and route-compatible: no server-side PDF generation, no new document engine, and no dedicated print route.

## Decisions

| Area | Decision |
|------|----------|
| Print trigger | Reuse `src/features/documents/print-button.tsx` from the carta-poder flow. The button calls `window.print()` and remains client-only. |
| Route strategy | Keep `/admin/documents/ubicacion-cliente/preview?clientId=...`; do not add `?print=true` or a dedicated print route for this slice. |
| AppShell chrome suppression | Use Tailwind `print:hidden` on preview-page action chrome and on `AppShell` sidebar/header areas as needed. Use print layout utilities on the shell containers so the printable document can occupy the page. |
| Document print layout | Add print utilities directly to `UbicacionClientePreview` and its sections. Keep the screen layout unchanged. |
| Map handling | Continue using the existing Google Static Maps `<img>`. Change loading to `eager` so the image is more likely to be available before the print dialog snapshot. Preserve the existing fallback message for missing coordinates or failed map load. |
| CSS strategy | Prefer local Tailwind `print:` utilities over broad global CSS. Add global `@media print` only if shell-level browser defaults (background/padding/page sizing) cannot be expressed cleanly in component classes. |

## Current pattern to follow

`carta-poder` already implements the project pattern for print preview:

- `src/features/documents/print-button.tsx` is a client component that calls `window.print()`.
- `src/app/admin/documents/carta-poder/preview/page.tsx` wraps navigation actions with `print:hidden`.
- `src/features/documents/carta-poder-preview.tsx` uses Tailwind `print:` utilities to remove borders, shadows, and padding in printed output.

The ubicacion-cliente implementation should extend that pattern instead of introducing another print mechanism.

## Data flow

1. Admin opens `/admin/documents/ubicacion-cliente/preview?clientId=...`.
2. The server page keeps the existing auth and client loading flow:
   - `requireRole(["admin"])`
   - `getClientById(clientId)`
   - `process.env.GOOGLE_MAPS_API_KEY ?? null`
3. The page renders `AppShell`, screen navigation actions, `PrintButton`, and `UbicacionClientePreview`.
4. `UbicacionClientePreview` formats identity fields and coordinates exactly as it does today.
5. If valid coordinates and an API key exist, the component renders the static map image.
6. Clicking the print button invokes `window.print()`.
7. During print rendering, Tailwind print styles hide admin chrome/actions and simplify the document layout.

## File-level plan

### `src/app/admin/documents/ubicacion-cliente/preview/page.tsx`

- Import `PrintButton` from `@/features/documents/print-button`.
- In the valid-client branch, add `<PrintButton />` next to the existing action links.
- Add `print:hidden` to the action-link container so navigation and print action do not appear in the PDF.
- Do not add the print action to missing-client or load-error states; those states are not valid printable documents.

### `src/features/documents/ubicacion-cliente-preview.tsx`

- Add print-focused classes to the root `<article>` and document sections:
  - center and constrain document width for screen and print,
  - remove shadows/rounded visual chrome in print,
  - reduce spacing/padding for single-page fit,
  - keep text dark and readable in print.
- Ensure section blocks avoid awkward splitting where possible with print utilities such as `print:break-inside-avoid`.
- Tune the map wrapper and image for print:
  - use `max-width: 100%`, fixed/aspect-safe printed height constraints via utility classes,
  - avoid cropping/distortion,
  - switch map image loading from `lazy` to `eager`.
- Preserve existing placeholders (`Sin dato`, `Sin coordenadas guardadas...`) and fallback behavior.

### `src/components/app-shell.tsx`

- Add print utilities only to generic shell chrome and containers:
  - hide the sidebar in print,
  - hide the main page header/title chrome in print if it is not part of the ubicacion-cliente document content,
  - remove outer shell padding, borders, shadows, backdrop blur, and max-width constraints in print so the child document is the printable page.
- Keep changes generic and additive so existing screen layouts are unaffected.
- Verify the existing carta-poder print output still benefits from the same shell print behavior.

### `src/app/globals.css`

- Avoid global print CSS unless component utilities are insufficient.
- If needed, keep it minimal, for example:
  - `@page { size: auto; margin: 12mm; }`
  - print-only body background reset.
- Do not add a document-template system or broad print framework.

## Print layout behavior

The printed output should contain only the ubicacion-cliente document content:

- client identity fields,
- latitude and longitude text,
- static map image or the existing fallback message.

The printed output should exclude:

- sidebar,
- top/header chrome from `AppShell`,
- preview navigation links,
- print button,
- footer/auth/admin controls,
- decorative screen backgrounds and shadows.

For fit, prefer a compact single-column print layout. The screen can remain a card-based responsive layout, but print should reduce spacing enough for A4/Letter without horizontal overflow.

## Contracts

### UI contract

- Button label: keep Spanish user-facing copy. Prefer aligning with the new requirement: `Guardar como PDF`.
- Button behavior: `onClick={() => window.print()}` only.
- Button visibility: visible on screen, hidden in print.

### Rendering contract

- Screen rendering of the preview remains unchanged except for the new print button.
- Print rendering uses CSS only; no alternate server route or data-fetching branch.
- Null/empty fields keep the same screen placeholders in print.
- The map fallback remains visible in print when coordinates or map rendering are unavailable.

### Dependency contract

- No new runtime dependency.
- No server-side PDF pipeline.
- No storage, audit trail, or generated PDF download endpoint.

## Testing and verification

Manual verification is appropriate for this first slice because browser print dialogs are not reliably assertable in unit tests.

- Open `/admin/documents/ubicacion-cliente/preview?clientId=<valid-id>`.
- Confirm `Guardar como PDF` is visible on screen.
- Click it and confirm the native print dialog opens.
- In print preview, confirm admin shell chrome and navigation actions are hidden.
- Confirm identity fields, coordinates, and map/fallback are visible and legible.
- Confirm A4/Letter preview has no horizontal overflow and the map is not clipped or distorted.
- Regression-check `/admin/documents/carta-poder/preview?clientId=<valid-id>` because shell print changes are shared.

## Rollout and rollback

Rollout is a normal frontend deploy. The change is additive and affects only print styling plus one print action on the valid ubicacion-cliente preview.

Rollback is a simple revert of the touched frontend files. There are no migrations, persisted PDFs, queues, or external service changes.

## Non-goals preserved

- No server-side PDF generation.
- No PDF storage or history.
- No dedicated print route in the first slice.
- No new generalized printable-document abstraction.
- No changes to client selection or data fetching.
