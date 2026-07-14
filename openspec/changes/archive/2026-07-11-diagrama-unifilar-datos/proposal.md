# Diagrama unifilar — data panel (first slice)

Build the fixed/autofilled data panel for the unifilar electrical diagram document, using existing client data to prefill service and solar installation equipment information. The actual diagram drawing is intentionally deferred to a later slice.

## Business problem

EcoTienda's solar installation workflow requires a unifilar (single-line electrical) diagram as part of the CFE interconnection paperwork. Today this diagram is prepared manually or not at all, which slows down the technical visit and CFE submission process. The data portion of the diagram — client identity, CFE service number, and solar equipment specifications — is repetitive and can be autofilled from the client record already in the system.

The client has not yet delivered the reference diagrams needed to build the graphical portion. Blocking the entire feature on diagram delivery would delay the data automation that is already possible today.

## Target users and situations

- **Who:** Mexican internal users (admin role) who prepare CFE interconnection documents for solar installation clients.
- **When:** During the document preparation workflow, after the client has been registered with identity data and service point (RPU).
- **Urgency:** The data panel is immediately useful — it eliminates manual transcription of client and equipment data into the diagram format. The graphical diagram cannot proceed until the client delivers reference assets.

## Product outcome

After this change, a user can:

1. Navigate to a new "Diagrama unifilar" template entry in the documents index.
2. Select a client from the existing client list.
3. See a preview page that displays the data panel — a structured read-only view of all the information that will accompany the diagram: client identity, CFE service number, and solar equipment details.
4. The data panel is autofilled from the client record and any additional solar equipment fields stored for that client.

The output is a data-only preview — no graphical diagram rendering in this slice.

## Current-state gap

- No "Diagrama unifilar" template exists in the documents index (`/admin/documents`).
- No route, client selector, or preview page exists for this document.
- The client data model (`ClientRecord`) already contains the core identity and service fields (`full_name`, `address`, `neighborhood`, `rfc`, `rpu`, `phone`, `coordinates`). Solar equipment fields (panel count, panel power, inverter, installed capacity, estimated monthly generation) need to be added.
- The existing document flow pattern (Carta Poder, Ubicación del cliente) provides a proven template: client selector → preview route → data display component.

## Scope (first slice)

1. **Documents index entry:** Add a "Diagrama unifilar" template card to `/admin/documents` with status "Activo" and route `/admin/documents/diagrama-unifilar`.
2. **Client selector page:** Build `/admin/documents/diagrama-unifilar` following the same interaction pattern as Carta Poder and Ubicación del cliente (AppShell layout, rounded card, select dropdown, Link-based navigation to preview).
3. **Data panel preview:** Build `/admin/documents/diagrama-unifilar/preview?clientId=<id>` that displays a structured data panel containing:
   - Client identity: full name, RFC, phone, address, neighborhood.
   - CFE service number: RPU displayed as "Número de servicio".
   - Solar equipment: panel quantity, panel power, inverter, installed capacity, estimated average monthly generation.
4. **Data model extensions:** Add 5 new nullable solar equipment fields to the database schema (`panel_count`, `panel_power`, `inverter`, `installed_capacity`, `estimated_monthly_generation`). No new UI for editing them in this slice — data can be populated via Supabase directly or in a follow-up change.
5. **Graceful error handling:** Missing `clientId` or invalid client ID redirects or shows a recovery card, matching the existing pattern.

## Non-goals

- **No graphical diagram rendering.** The actual unifilar single-line diagram (boxes, lines, electrical symbols) is NOT part of this slice. The client has not delivered the reference diagrams, so the visual layout cannot be finalized.
- **No print/PDF export.** Printing and PDF generation are deferred. The preview is screen-only for now.
- **No new equipment data entry UI.** New fields are added to the schema but not exposed in the client create/edit form in this slice. Data can be populated via Supabase dashboard or a future form enhancement.
- **No diagram template image or SVG.** No placeholder diagram, no canvas, no drawing library integration.
- **No changes to existing document flows.** Carta Poder and Ubicación del cliente remain untouched.

## Constraints

- Mobile-first product, Spanish UI for Mexican internal users.
- Must follow the established document flow pattern (AppShell → client selector → preview route).
- Technical artifacts (code, comments, identifiers) in English.
- Must not break existing documents index or preview functionality.
- New database fields must be additive — no schema migrations that affect existing client records.
- The data panel should be structured to make it easy to embed inside a diagram layout in a future slice.

## Affected areas

| Area | Impact |
|------|--------|
| `src/app/admin/documents/page.tsx` | New template entry for "Diagrama unifilar" |
| `src/app/admin/documents/diagrama-unifilar/page.tsx` | New client selector page |
| `src/app/admin/documents/diagrama-unifilar/preview/page.tsx` | New preview route with data panel |
| `src/features/documents/diagrama-unifilar-preview.tsx` | New data panel presentation component |
| `src/types/client.ts` | 5 new nullable solar equipment fields |
| Database schema (Supabase) | 5 new nullable columns on clients table |

## Risks

| Risk | Mitigation |
|------|------------|
| Solar equipment fields are not yet populated for most clients | All 5 new fields are nullable; preview displays "—" for missing values |
| Data panel fields don't match what the future diagram expects | Keep the data panel modular — each section (client, service, equipment) is independent and can be repositioned when the diagram layout is finalized |
| Client delivers diagrams much later, causing the data panel to sit unused | The data panel has standalone value: it serves as a structured summary of installation data for internal review, even without the diagram |
| New database columns require migration | Use additive `ALTER TABLE ADD COLUMN` with nullable defaults; no breaking changes to existing records |

## Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| Data panel only vs. full diagram | Ships value now without blocking on diagram delivery. The diagram slice can be added independently when assets arrive. |
| No equipment data entry UI | Reduces scope significantly. Users populate new fields via Supabase for now. A form UI can follow as a separate change. |
| Follow existing document pattern exactly | Consistent UX across all document templates. Limits design freedom but reduces cognitive load for users already familiar with Carta Poder and Ubicación flows. |
| Additive schema changes only | Safe for existing data. May result in sparse records until fields are populated, but no migration risk. |

## Rollback

All changes are additive: new routes, new component, new template card, and 5 new nullable database columns. Rollback is a simple revert of the affected files and an optional `DROP COLUMN` if schema changes were made. No data migration, no API contract changes.

## Success criteria

- [ ] "Diagrama unifilar" template card appears in `/admin/documents` with status "Activo".
- [ ] Client selector page at `/admin/documents/diagrama-unifilar` lists clients and navigates to preview on selection.
- [ ] Preview page at `/admin/documents/diagrama-unifilar/preview?clientId=<id>` displays a structured data panel with client identity, CFE service number, and solar equipment fields.
- [ ] Data panel autofills from the client record — no manual data entry required.
- [ ] Missing or invalid `clientId` shows a recovery card or redirects gracefully.
- [ ] Existing document flows (Carta Poder, Ubicación del cliente) are unaffected.
- [ ] `npm run lint` and `npm run build` pass with no new errors.
