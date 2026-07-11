# PDF export for client location document (browser print)

Enable internal users to produce a PDF of the client location sheet ("ubicación del cliente") using the browser's native print-to-PDF capability, without introducing a server-side PDF generation pipeline.

## Business problem

Field and office staff need a portable, shareable record of a client's location — identity data, coordinates, and map — for route planning and service visits. Today the preview page displays all the information on screen but offers no way to export it. Users resort to screenshots or manual note-taking, which are inconsistent, incomplete, and hard to file.

## Target users and situations

- **Who:** Mexican internal users (admin role) who manage client documents.
- **When:** After reviewing a client's location preview, when they need to share or archive the information offline or via messaging apps (WhatsApp, email).
- **Urgency:** Immediate — the data is already on screen; the gap is purely an export action.

## Product outcome

After this change, a user can open the client location preview and trigger a single action (browser print dialog) that produces a clean, single-page PDF containing all the information shown on screen: client identity fields, saved coordinates, and the static map image. The output should look intentional — not a raw browser dump of the admin shell.

## Current-state gap

- The preview page (`/admin/documents/ubicacion-cliente/preview?clientId=...`) renders client data inside `AppShell` with admin navigation, sidebar, and page chrome that should NOT appear in the printed output.
- No print-specific styles or print button exist.
- The static map image already uses Google Maps Static API, which is print-friendly (raster image, no JS dependency at print time).

## Scope (first slice)

1. **Print-friendly layout:** Add CSS `@media print` rules (or Tailwind `print:` utilities) that hide the `AppShell` chrome (sidebar, top bar, navigation buttons, footer) and keep only the document content — identity fields, coordinates, and map.
2. **Print trigger:** Add a "Guardar como PDF" / "Imprimir" button on the preview page that calls `window.print()`. The button itself should be hidden in print output.
3. **Print layout tuning:** Ensure the printed content fits well on a standard page (A4/Letter), with readable font sizes, proper page breaks, and the map image sized to fit without overflow.
4. **Route-level consideration:** The print view may reuse the existing preview route with print CSS, or introduce a dedicated `?print=true` query parameter that renders a stripped-down layout server-side. The approach should be decided in the design phase.

## Non-goals

- **No server-side PDF generation** (Puppeteer, Playwright, wkhtmltopdf, etc.). This is intentionally deferred to a future slice if higher fidelity or batch generation is needed.
- **No new document template engine.** We are not building a general-purpose printable document system — this is scoped to the ubicacion-cliente sheet.
- **No changes to data fetching or client selection flow.** The existing preview route and client picker remain unchanged.
- **No PDF storage or download history.** The PDF lives only in the user's browser print dialog — we do not save it server-side.

## Constraints

- Mobile-first product, but print/PDF is primarily a desktop/laptop action. The print button should be accessible on mobile but the printed output targets standard paper sizes.
- Spanish UI for Mexican internal users — all user-facing strings in Spanish.
- Must not break existing preview functionality or add regressions to the client selection flow.
- Static map image depends on `GOOGLE_MAPS_API_KEY` env var — if unavailable, the map section shows a fallback message (already handled). Print should preserve this behavior.

## Affected areas

| Area | Impact |
|------|--------|
| `src/features/documents/ubicacion-cliente-preview.tsx` | Print styles, possible layout adjustments for print |
| `src/app/admin/documents/ubicacion-cliente/preview/page.tsx` | Print button, possible print-mode query param handling |
| `src/components/app-shell` | Print CSS to hide shell chrome (or print-specific wrapper) |
| Global/print CSS | New `@media print` rules |

## Risks

| Risk | Mitigation |
|------|------------|
| Map image doesn't render in print (CORS, lazy loading) | Static map is a standard `<img>` with `loading="lazy"` — verify browsers include it in print; consider `loading="eager"` for print context |
| AppShell chrome leaks into print output | Explicit `print:hidden` on shell elements; test on Chrome and Firefox |
| Content overflows single page | Print-specific font sizing and map height constraints in `@media print` |
| Browser print dialog UX varies | Keep it simple — `window.print()` is universal; avoid custom print previews |

## Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| Browser print vs. server-side PDF | Faster to ship, zero infrastructure cost, but output quality depends on browser. Acceptable for first slice; revisit if users need consistent branding or batch generation. |
| Reuse existing preview route + print CSS vs. dedicated print route | Reusing is simpler and avoids duplication. A dedicated route gives full control but adds maintenance. Start with print CSS on existing route. |
| No PDF storage | Zero backend complexity. Users must save the PDF themselves. If audit trail is needed later, add storage as a separate slice. |

## Rollback

All changes are additive CSS and a print button. Rollback is a simple revert of the affected files — no data migration, no API changes.

## Success criteria

- [ ] User can open the client location preview and see a "Guardar como PDF" / "Imprimir" button.
- [ ] Clicking the button opens the browser print dialog.
- [ ] The printed output shows only the document content (identity, coordinates, map) — no admin shell chrome.
- [ ] The map image renders correctly in the print output.
- [ ] The printed layout fits well on A4/Letter paper without horizontal overflow.
- [ ] Existing preview functionality (client selection, navigation) is unaffected.
