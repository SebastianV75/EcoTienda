# Ubicación del Cliente Preview Design

This slice activates the "Ubicación del cliente" document template and adds a minimal admin-only preview flow: choose a client, review saved identity/location data, and see a non-interactive Google Maps static preview centered on the saved coordinates. It intentionally avoids print/PDF behavior and new dependencies.

## Decisions

| Area | Decision |
|------|----------|
| Route structure | Mirror Carta Poder: selector at `/admin/documents/ubicacion-cliente`, preview at `/admin/documents/ubicacion-cliente/preview?clientId=<id>`. |
| Authentication | Each route calls `requireRole(["admin"])`, matching existing document routes. |
| Data access | Reuse `getClients()` for selector options and `getClientById(clientId)` for preview data. No schema or query expansion is needed. |
| Layout shell | Use `AppShell` with existing rounded card/button styles and mobile-first Tailwind classes. |
| Preview component | Add `src/features/documents/ubicacion-cliente-preview.tsx` as a presentational component that receives a `ClientRecord`. |
| Map rendering | Use a plain `<img>` with Google Maps Static API URL built from `GOOGLE_MAPS_API_KEY`; no JS map library, no interactive iframe. |
| Scope boundary | Do not import or render `PrintButton`; do not add download, PDF, or print-specific UI. |

## Route wiring

### Documents index

File: `src/app/admin/documents/page.tsx`

Update only the "Ubicación del cliente" template entry:

- `href`: `/admin/documents/ubicacion-cliente`
- `status`: `Activo`
- copy may remain lightweight but should no longer say it is pending.

Existing card rendering already makes active templates navigable, so no new card logic is needed.

### Selector route

File: `src/app/admin/documents/ubicacion-cliente/page.tsx`

Use the Carta Poder selector page as the implementation pattern:

1. Call `requireRole(["admin"])`.
2. Read optional `searchParams.clientId`.
3. Load clients with `getClients()`.
4. Render `AppShell` with a back link to `/admin/documents`.
5. Render a rounded card containing a `<form>` with a `select name="clientId"`.
6. Let form submission update the same page query string.
7. When `selectedClientId` exists, show a CTA link to `/admin/documents/ubicacion-cliente/preview?clientId=<id>`.
8. When no client is selected, hide the preview CTA.

This preserves the current no-client-selected behavior from Carta Poder and avoids adding client-side routing state.

### Preview route

File: `src/app/admin/documents/ubicacion-cliente/preview/page.tsx`

Implementation flow:

1. Call `requireRole(["admin"])`.
2. Resolve `searchParams.clientId`.
3. If missing, render a graceful card with a link back to `/admin/documents/ubicacion-cliente`.
4. If present, call `getClientById(clientId)`.
5. If the client lookup fails, render a graceful error card with the same back link.
6. Render navigation links: change client and return to documents.
7. Render `<UbicacionClientePreview client={client} />`.

The existing `getClientById` throws on missing/invalid IDs, so the preview route should catch that error locally instead of allowing a Next.js error boundary for this expected user path.

## Component boundaries

### `UbicacionClientePreview`

File: `src/features/documents/ubicacion-cliente-preview.tsx`

Responsibilities:

- Present client identity fields.
- Present coordinates as text.
- Render the map area when coordinates are valid.
- Render a clear empty state when coordinates are missing, non-finite, or both zero.

Inputs:

```ts
type UbicacionClientePreviewProps = {
  client: ClientRecord;
};
```

Internal helpers:

- `formatField(value)` returns the value or `"Sin dato"` for empty/nullish values.
- `hasValidCoordinates(client)` returns true only when latitude and longitude are finite numbers and not both `0`.
- `buildStaticMapUrl(latitude, longitude)` returns a Google Static Maps URL when `process.env.GOOGLE_MAPS_API_KEY` is available.

Keep the component server-compatible. Use a regular `<img>` instead of `next/image` to avoid image domain configuration for `maps.googleapis.com`.

## Data flow

```text
/admin/documents
  -> active template link
/admin/documents/ubicacion-cliente
  -> require admin
  -> getClients()
  -> select client
  -> preview CTA with clientId
/admin/documents/ubicacion-cliente/preview?clientId=<id>
  -> require admin
  -> getClientById(id)
  -> UbicacionClientePreview(client)
```

No data is mutated. No new server actions are required.

## Map rendering approach

Use Google Maps Static API because it best satisfies the preview-only and non-interactive requirements.

Recommended URL shape:

```text
https://maps.googleapis.com/maps/api/staticmap
  ?center=<lat>,<lng>
  &zoom=17
  &size=800x420
  &scale=2
  &markers=color:green|<lat>,<lng>
  &key=<GOOGLE_MAPS_API_KEY>
```

Notes:

- The key is necessarily visible in the image URL; this is normal for browser-rendered Google Maps assets. The key should be restricted by HTTP referrer in Google Cloud.
- If `GOOGLE_MAPS_API_KEY` is missing, render the map empty state instead of adding a new dependency or an interactive fallback.
- Do not use an iframe for this slice because typical Google Maps embeds allow interaction, which conflicts with the spec's non-interactive requirement.

## Empty and error states

| State | UI behavior |
|-------|-------------|
| No client selected on selector | Do not show the preview CTA. |
| Missing `clientId` on preview | Show a rounded card explaining that a client must be selected, with a link to the selector. |
| Invalid `clientId` / missing client | Show a rounded card explaining the client could not be loaded, with a link to the selector. |
| Empty/null identity field | Show `Sin dato`; never omit the field row. |
| Missing, invalid, or zero coordinates | Show `Sin coordenadas guardadas` in the map area and still display coordinate fields with placeholders. |
| Missing map API key | Show a map-unavailable message in the map area; keep the rest of the preview usable. |

## Mobile-first layout

Use a single-column default layout:

- Outer preview article: full width, rounded card, comfortable padding.
- Identity fields: stacked rows on mobile; optional two-column grid at `md` and up.
- Map: full-width block with fixed minimum height/aspect ratio.
- Desktop may use `lg:grid-cols-[0.9fr_1.1fr]` for identity and map, but mobile remains the source layout.

Avoid any fixed width that can overflow a 320px viewport.

## Validation strategy

Primary commands:

```bash
npm run lint
npm run build
```

Manual checks:

- `/admin/documents` shows "Ubicación del cliente" as `Activo` and links to `/admin/documents/ubicacion-cliente`.
- Selector route lists clients and only shows the preview CTA after a client is selected.
- Preview route displays full name, address, neighborhood, RPU, RFC, latitude, and longitude.
- Null/empty fields show `Sin dato`.
- Missing or invalid `clientId` does not crash the page.
- Valid coordinates render a static Google map image centered on the client coordinates.
- Missing/zero coordinates show `Sin coordenadas guardadas`.
- No `PrintButton`, download link, or PDF/print action appears.
- At 375px width, the preview stacks vertically without horizontal scroll.

## Rollout and rollback

Rollout is code-only: route files, one preview component, and one template entry update. There are no migrations and no data writes.

Rollback:

1. Set the documents index template entry back to `status: "Pendiente"` and `href: "#"`.
2. Remove `src/app/admin/documents/ubicacion-cliente/`.
3. Remove `src/features/documents/ubicacion-cliente-preview.tsx`.

## Out of scope

- Print/download/PDF generation.
- `PrintButton` integration.
- Interactive map controls.
- Re-pinning coordinates.
- Client create/edit changes.
- New dependencies.
