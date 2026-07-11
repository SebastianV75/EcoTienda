# Tasks: PDF export for client location sheet

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 80-160 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Implementation tasks

- [x] 1. Add the screen-only print action on `src/app/admin/documents/ubicacion-cliente/preview/page.tsx`.
  - Reuse `src/features/documents/print-button.tsx` in the valid-client branch only.
  - Wrap the action row with `print:hidden` so `Cambiar cliente`, `Volver a descargables`, and the print action do not appear in print output.
  - Keep missing-client and load-error states unchanged except for any print-safe class alignment that is strictly necessary.
  - Verify on screen that the new action is visible and uses Spanish copy.

- [x] 2. Tune the shared print button copy in `src/features/documents/print-button.tsx`.
  - Update the label to align with this slice's approved wording (`Guardar como PDF`).
  - Keep behavior limited to `window.print()`.
  - Verify the button still works for both `ubicacion-cliente` and existing `carta-poder` preview usage.

- [x] 3. Make the location document print-friendly in `src/features/documents/ubicacion-cliente-preview.tsx`.
  - Add `print:` utilities to the root article and each section to remove decorative screen chrome, tighten spacing, and keep a single-column printable layout.
  - Add print-safe sizing to the map container/image so it fits A4/Letter without overflow or distortion.
  - Change the static map image from `loading="lazy"` to `loading="eager"`.
  - Preserve existing placeholders and fallback messages for missing fields, missing coordinates, and map load failure.
  - Add `print:break-inside-avoid` where useful so sections do not split awkwardly.

- [x] 4. Hide shared admin shell chrome during printing in `src/components/app-shell.tsx`.
  - Add print utilities to hide the sidebar and header chrome.
  - Remove outer shell padding/container constraints in print so the document content can occupy the page cleanly.
  - Keep screen rendering unchanged.
  - Regression-check that `src/app/admin/documents/carta-poder/preview/page.tsx` still prints without shell chrome after the shared shell update.

- [x] 5. Add minimal global print CSS only if component-level Tailwind utilities are insufficient.
  - Discovery target: inspect `src/app/globals.css` and only add narrow print rules such as page margin or body background reset if the layout still wastes space or prints extra chrome.
  - Do not introduce a generic print framework or route-specific CSS system.

## Validation

- [x] 6. Run the current safety net.
  - Execute `npm run lint`.
  - Execute `npm run build`.

- [x] 7. Perform manual print verification.
  - Open `/admin/documents/ubicacion-cliente/preview?clientId=<valid-id>`.
  - Confirm `Guardar como PDF` is visible on screen and opens the native print dialog.
  - In print preview, confirm only document content appears: identity fields, coordinates, and map or fallback message.
  - Confirm there is no sidebar, top header chrome, navigation action row, or print button in the printed output.
  - Confirm the layout fits A4/Letter without horizontal overflow and the map is not clipped.
  - Regression-check `/admin/documents/carta-poder/preview?clientId=<valid-id>` print preview because `PrintButton` and `AppShell` are shared.
