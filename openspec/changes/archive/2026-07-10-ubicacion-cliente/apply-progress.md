# Apply Progress — Ubicación del cliente

## Slice scope

Preview-only first slice. Activate the "Ubicación del cliente" template on the documents index, add a client selector and preview route under `/admin/documents/ubicacion-cliente/`, and render a non-interactive Google Static Maps preview. No print, PDF, or download UI in this slice.

## Completed tasks

| # | Task | Persisted checkbox | Files |
|---|------|-------------------|-------|
| 1 | Activate the template entry on the documents index | `- [x]` | `src/app/admin/documents/page.tsx` |
| 2 | Add the client selector route for the preview-only flow | `- [x]` | `src/app/admin/documents/ubicacion-cliente/page.tsx` |
| 3 | Build the preview presentation component with field and map fallbacks | `- [x]` | `src/features/documents/ubicacion-cliente-preview.tsx` |
| 4 | Add the admin preview route with graceful error handling | `- [x]` | `src/app/admin/documents/ubicacion-cliente/preview/page.tsx` |
| 5 | Run project safety-net validation for the narrow slice | `- [x]` | n/a |

## Files changed

| File | Change |
|------|--------|
| `src/app/admin/documents/page.tsx` | `templates[ubicacion-cliente]`: `status: "Activo"`, `href: /admin/documents/ubicacion-cliente`; description updated to reflect preview-only scope. |
| `src/app/admin/documents/ubicacion-cliente/page.tsx` | **New** — admin selector page mirroring `carta-poder/page.tsx`. Uses `requireRole(["admin"])`, `getClients()`, and shows the preview CTA only after a client is selected. |
| `src/app/admin/documents/ubicacion-cliente/preview/page.tsx` | **New** — admin preview route. Renders a recovery card when `clientId` is missing; wraps `getClientById` in try/catch and renders a friendly error card on lookup failure. No `PrintButton`. |
| `src/features/documents/ubicacion-cliente-preview.tsx` | **New** — presentational component. Renders identity fields, coordinates, and a Google Static Maps `<img>` when `GOOGLE_MAPS_API_KEY` is set; otherwise a graceful empty state. |

`src/types/client.ts` was not modified — `ClientRecord` already exposes the required fields, and defensive `toFiniteNumber` handles real-world nullish/zero/NaN values from the DB.

## Reuse and patterns

- Auth: `requireRole(["admin"])` on both routes, matching every other document route.
- Layout: `AppShell` with the same rounded card / `border-[var(--border-soft)]` / `[var(--brand)]` button classes used in Carta Poder.
- Selector: form with `<select name="clientId">` + submit, same as Carta Poder. The preview CTA only renders when `searchParams.clientId` is present.
- Data: `getClients()` for the selector; `getClientById(id)` for the preview. No new server actions.
- Navigation links: rounded outlined `Link` components, same as Carta Poder's "Volver a descargables".

## Map rendering

Google Maps Static API via a plain `<img>`:

- URL built from `process.env.GOOGLE_MAPS_API_KEY`, `URLSearchParams` for safe escaping.
- Centered on `latitude,longitude`, `zoom=17`, `size=800x420`, `scale=2`, green marker.
- If the env var is missing OR coordinates are nullish/non-finite/both zero, the `<img>` is replaced with a centered message inside the same map container. No crash, no fallback dependency.
- Used `<img>` (not `next/image`) intentionally per the design to skip image-domain configuration for `maps.googleapis.com`. This produces one ESLint `@next/next/no-img-element` warning, which is an accepted trade-off documented in the design.

## Empty and error states

| State | Behavior |
|-------|----------|
| Missing `clientId` on preview | Recovery card with a link back to the selector. |
| `getClientById` throws / returns nothing | Caught locally; friendly card with two links: "Elegir otro cliente" and "Volver a descargables". |
| Empty/null identity field (e.g., `rfc`) | Renders `Sin dato` in-place. The row is never omitted. |
| Nullish / non-finite / both-zero coordinates | Map area shows `Sin coordenadas guardadas`; lat/lng text fields show `Sin dato`. |
| Missing `GOOGLE_MAPS_API_KEY` | Map area shows `Vista de mapa no disponible: falta la clave de Google Maps en la configuración del servidor.`; identity and coordinate sections remain usable. |
| No print / download UI | Confirmed — `PrintButton` is not imported anywhere in the new files. |

## Mobile-first layout

- Identity fields: stacked rows on mobile, two-column `sm:grid-cols-2` from small breakpoint up.
- Coordinates section: same stacked/two-column behavior.
- Map: full-width block, fixed aspect ratio from the static image dimensions, no fixed width that could overflow a 320px viewport.
- No horizontal scroll on a 375px viewport.

## Validation evidence

| Command | Result |
|---------|--------|
| `npm run lint` | 0 errors, 1 warning (intentional `<img>` vs `next/image` per design) |
| `npm run build` | ✓ Compiled successfully; both new routes registered: `/admin/documents/ubicacion-cliente` and `/admin/documents/ubicacion-cliente/preview` (dynamic, server-rendered on demand) |

Build output route table excerpt:

```text
├ ƒ /admin/documents
├ ƒ /admin/documents/carta-poder
├ ƒ /admin/documents/carta-poder/preview
├ ƒ /admin/documents/ubicacion-cliente
├ ƒ /admin/documents/ubicacion-cliente/preview
```

## Deviations from design

None. Implementation follows the design document section by section:

- Route structure, auth, data access, layout shell, and component boundaries match exactly.
- Static Maps URL uses the recommended `size=800x420`, `scale=2`, `zoom=17`, green marker.
- Error and empty states match the table in the design.
- The `PrintButton` is intentionally not imported.

## Workload / PR boundary

- Estimated changed lines (after implementation): ~210 across 4 files (well under 400).
- 400-line budget risk: Low (confirmed by the task forecast).
- Delivery: single PR. No chaining.
- Rollback: revert the documents index entry to `status: "Pendiente"`, `href: "#"`; delete the two route directories and the preview component. No data changes.

## Remaining work (out of scope for this slice)

- Printable / downloadable PDF document.
- `PrintButton` integration in the preview route.
- Interactive map (drag, zoom, re-pin).
- Map screenshot or snapshot capture.
- CFE format template.
- Any changes to client create/edit flows.
