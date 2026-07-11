# Apply progress: PDF export for client location sheet

## Outcome

Implemented browser-print PDF export for the `ubicacion-cliente` preview by reusing the existing `carta-poder` print pattern: a single `Guardar como PDF` button on the preview page, Tailwind `print:` utilities on the document and shell, and a minimal `@media print` block in global CSS. No new dependencies, no server-side PDF pipeline. Lint and build pass.

## Completed tasks

| # | Task | Result |
|---|------|--------|
| 1 | Add screen-only print action on `src/app/admin/documents/ubicacion-cliente/preview/page.tsx` | Done |
| 2 | Tune shared print button copy in `src/features/documents/print-button.tsx` | Done |
| 3 | Make location document print-friendly in `src/features/documents/ubicacion-cliente-preview.tsx` | Done |
| 4 | Hide shared admin shell chrome during printing in `src/components/app-shell.tsx` | Done |
| 5 | Add minimal global print CSS in `src/app/globals.css` | Done |
| 6 | Run `npm run lint` and `npm run build` | Done |

## Files changed

| File | Change |
|------|--------|
| `src/features/documents/print-button.tsx` | Label updated to `Guardar como PDF` |
| `src/app/admin/documents/ubicacion-cliente/preview/page.tsx` | Imported `PrintButton`, added it to the valid-client action row, wrapped the row with `print:hidden` |
| `src/features/documents/ubicacion-cliente-preview.tsx` | Added `print:` utilities to article, sections, and map container; switched map `<img>` to `loading="eager"`; added print-safe sizing; preserved placeholders and fallback; hid Google Maps external link in print |
| `src/components/app-shell.tsx` | Added `print:hidden` to sidebar and main header chrome; flattened shell padding, borders, shadows, and backdrop blur in print; collapsed grid to one column in print |
| `src/app/globals.css` | Added minimal `@media print` block: `@page { size: auto; margin: 12mm; }`, body background reset to white, and `body::before` hidden |
| `openspec/changes/pdf-ubicacion-cliente/tasks.md` | Marked implementation and validation-lint/build tasks complete |

## Print behavior

| Element | Screen | Print |
|---------|--------|-------|
| Sidebar (`AppShell` aside) | Visible | Hidden (`print:hidden`) |
| Page header chrome (title/description) | Visible | Hidden (`print:hidden`) |
| Action row (`Cambiar cliente`, `Volver a descargables`, `Guardar como PDF`) | Visible | Hidden (`print:hidden` on container) |
| Document sections | Card with border, shadow, rounded corners, padding | Flat (`print:border-0 print:shadow-none print:rounded-none print:p-0`) |
| Identity + coordinates sections | Two-column on `sm+` | Same, with tighter gap and `print:break-inside-avoid` |
| Map image | `loading="lazy"`, free height up to 420px | `loading="eager"`, capped at 320px for A4/Letter fit |
| Map fallback message | Centered, padded card | Tighter padding, no border, no Google Maps link |
| `Abrir en Google Maps` link | Visible | Hidden (`print:hidden`) |
| Body background | Green gradient with pattern overlay | Plain white (`@media print` reset) |
| Page margin | Browser default | 12mm (`@page`) |

## Validation

- `npm run lint` — 0 errors, 1 warning (pre-existing `@next/next/no-img-element` on the static map `<img>`; not introduced by this change).
- `npm run build` — `Compiled successfully`, all 18 routes generated without issues.

## Deviations from design

- None. The implementation follows the file-level plan in `design.md` and reuses the `carta-poder` pattern as specified.

## Remaining tasks

- [ ] 7. Manual print verification (`/admin/documents/ubicacion-cliente/preview?clientId=<valid-id>` and carta-poder regression). Browser print dialogs are not assertable in unit tests, so this step is a manual QA gate.

## PR boundary

- Single PR. The change is in the `Low` 400-line risk band (well under 80-160 estimated lines touched). `decision_needed_before_apply: No`, `chained_prs_recommended: No`. Recommended commit message: `feat(documents): enable browser-print PDF for ubicacion-cliente preview`.

## Structured status

| Field | Value |
|-------|-------|
| `status` | `success` |
| `next_recommended` | `verify` |
| `skill_resolution` | `paths-injected` |
| `risks` | None at code level. Manual print verification still required. |
