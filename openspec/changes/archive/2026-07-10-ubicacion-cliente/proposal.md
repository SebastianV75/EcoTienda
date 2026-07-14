# Ubicación cliente — Preview-only first slice

Enable EcoTienda staff to preview a client's location document showing saved client data, coordinates, and an embedded map — without generating a printable document yet. This is the first slice of the "Ubicación del cliente" template listed as _Pendiente_ on the documents index page.

## Business problem

Field technicians and admin staff need to verify a client's exact location before a technical visit. Today the only way to see the map is through an external Google Maps link on the client card. There is no consolidated view that combines client identity data (name, RPU, address) with a visual map confirmation inside the documents workflow. This forces staff to context-switch between the client detail page and an external tab, increasing the chance of visiting the wrong location.

## Target users and situations

| Who | When | Urgency |
|-----|------|---------|
| Admin staff | Before scheduling a technical visit, to confirm the service address matches the pin on the map | Medium — part of visit preparation |
| Field technicians (via shared screen or printout later) | On-site, to confirm they are at the right location | High — but this slice is internal preview only |

## Current-state gap

- The documents index (`/admin/documents`) already lists "Ubicación del cliente" as a pending template with `href: "#"`.
- Clients already store `latitude`, `longitude`, `full_name`, `address`, `neighborhood`, `rpu`, and `rfc`.
- The only map interaction is an external `window.open` link in `ClientActions` — no embedded map exists anywhere in the app.
- No route structure exists under `/admin/documents/ubicacion-cliente/`.

## Product outcome

After this slice, an admin can:

1. Navigate from the documents index to the "Ubicación del cliente" template.
2. Select a client from the dropdown (same pattern as Carta Poder).
3. See a preview page showing:
   - Client identity data: full name, address, neighborhood, RPU, RFC.
   - Saved coordinates displayed as text.
   - An embedded map centered on the client's coordinates.
4. Navigate back to change the client or return to documents.

This slice does **not** produce a printable or downloadable document.

## Scope

### In scope (first slice)

| Area | Detail |
|------|--------|
| Route: template selection | `/admin/documents/ubicacion-cliente` — client selector, same pattern as Carta Poder |
| Route: preview | `/admin/documents/ubicacion-cliente/preview?clientId=<id>` — data + map preview |
| Documents index | Activate the "Ubicación del cliente" card: change status from "Pendiente" to "Activo", update `href` |
| Map rendering | Embedded map using Google Maps (static map image or iframe embed via the existing `GOOGLE_MAPS_API_KEY` env var) |
| Client data display | Show full_name, address, neighborhood, RPU, RFC, latitude, longitude |
| Mobile-first layout | Stacked layout on small screens; map takes full width |

### Out of scope (later slices)

- Printable / downloadable PDF document.
- `PrintButton` integration.
- Interactive map (drag, zoom, re-pin).
- Map screenshot or snapshot capture.
- CFE format template.
- Any changes to client creation/edit flows.

## Affected areas

| File / area | Change type |
|-------------|-------------|
| `src/app/admin/documents/page.tsx` | Update template entry: status → "Activo", href → `/admin/documents/ubicacion-cliente` |
| `src/app/admin/documents/ubicacion-cliente/page.tsx` | **New** — client selector page |
| `src/app/admin/documents/ubicacion-cliente/preview/page.tsx` | **New** — preview page with data + map |
| `src/features/documents/ubicacion-cliente-preview.tsx` | **New** — preview component (client data + map) |

## Constraints

- **Mobile-first**: the preview must be fully usable on a phone screen.
- **Existing patterns**: follow the Carta Poder route structure and component conventions (AppShell, rounded card styles, select dropdown, Link-based navigation).
- **Google Maps API**: the `GOOGLE_MAPS_API_KEY` env var already exists. Prefer a static map image (`MapsStaticAPI`) or a simple iframe embed to avoid pulling in a heavy JS map library for a preview-only slice.
- **No new dependencies** unless the map approach requires it (e.g., `@react-google-maps/api`). A static image or iframe is preferred to keep the slice lightweight.
- **Auth**: admin role required, same as all document routes.

## Risks and tradeoffs

| Risk | Mitigation |
|------|------------|
| Google Maps Static API may not be enabled on the existing API key | Fall back to an iframe embed (`google.com/maps/embed`) which requires no API key, or verify the key has Static Maps access before implementation |
| Static map image won't be interactive (no zoom/pan) | Acceptable for preview-only slice; interactivity is a later-slice concern |
| Preview looks too similar to client detail page | Differentiate with document-style layout (like Carta Poder preview) and prominent map placement |
| Later slices need to retrofit print/PDF support | Keep the preview component pure (data in, visual out) so it can be wrapped in a print layout later |

## Rollback

- Revert the documents index template entry back to status "Pendiente" and `href: "#"`.
- Remove the two new route directories and the preview component.
- No database or data model changes — zero migration risk.

## Success criteria

1. Admin navigates to `/admin/documents` and sees "Ubicación del cliente" with status "Activo" and a working link.
2. Admin selects a client and reaches the preview page.
3. Preview page displays all client identity fields and an embedded map centered on the client's coordinates.
4. Preview page is usable on a mobile viewport (map visible, data readable without horizontal scroll).
5. No print/download functionality exists (scope boundary respected).
6. `npm run lint` and `npm run build` pass with zero errors.
