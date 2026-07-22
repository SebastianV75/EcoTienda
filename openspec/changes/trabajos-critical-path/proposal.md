# Proposal: Trabajos Section with Critical Path

## 1. Problem Statement

The data model for the `Agenda → Visita Técnica → Cotización → Venta` critical path is fully in place — the `trabajos` table, per-stage tables, stage ordering rules, and completion validators all exist — but the UI is fragmented and incomplete:

- No centralized "Trabajos" view. Trabajos are scattered across Agenda (new), `/admin/visits` (in-progress), `/admin/quotations` (separate procurement flow), and `/admin` dashboard (limited active list). Users must hop between modules to track one job.
- Only the `agenda → visita` transition has a server action (`saveTrabajoVisitaAction`). The `visita → cotización` and `cotización → venta` transitions have NO server actions.
- The `venta` stage has ZERO UI — no form, no page, no route — even though `trabajo_sale_stage` and `TrabajoSaleStage` exist. It is impossible to complete a trabajo end-to-end today.
- No unified detail view exists where a user can see ALL stages of a single trabajo (agenda data + visita responses + cotización + venta + documents + timeline) on one screen.
- Quotations live in two disconnected tables: `quotations` (procurement) and `trabajo_quotation_stage` (workflow stage). Nothing links them in the UI.

The result: admins cannot operate the critical path as a single workflow, cannot view a job's full history, and cannot close a sale.

## 2. Proposed Solution

Introduce a first-class **"Trabajos"** section that becomes the operational home for the critical path, delivered in two incremental waves:

- **Wave 1 — Navigation + list**: add a "Trabajos" entry to the sidebar and mobile nav, plus a card-based `/admin/trabajos` list showing every trabajo with status, current stage, client, and a brief description. Each card links to the relevant current-stage page. Immediate value, minimal disruption.
- **Wave 2 — Unified detail + missing transitions**: add `/admin/trabajos/[id]` showing every stage's data, a stage timeline, downloadable documents, and the missing `visita → cotización` and `cotización → venta` server actions and forms — including the venta UI that does not exist today. Link `quotations` to `trabajo_quotation_stage`.

The strict stage ordering is already enforced by `rules.ts` and the DB schema; this change exposes it in the UI and fills the action gaps.

## 3. Scope

### In scope
- Add "Trabajos" entry to sidebar (`src/components/app-shell.tsx`) and mobile bottom nav / "Más" sheet.
- New `/admin/trabajos` route — card-based list of all trabajos (status, current_stage, client, brief description, progress indicator).
- New `/admin/trabajos/[id]` route — unified detail view with per-stage data, timeline, and document downloads.
- New server action for `visita → cotización` advancement (mirrors `saveTrabajoVisitaAction`).
- New server action for `cotización → venta` advancement.
- New venta form UI (the stage currently has no UI at all).
- Link existing `quotations` records into the cotización stage view.
- TrabajoCard component for the list.

### Out of scope
- Merging `quotations` and `trabajo_quotation_stage` into one table (keep parallel, link in UI).
- Rebuilding existing agenda, visita, or quotations pages — this change links to them, it does not replace them.
- New document generation logic — only surfaces existing `/admin/documents/trabajos` output in the detail view.
- Redesigning the technician-facing area beyond workflow forms they already use.
- The `descargables` stage workflow logic (clarify in open questions; for now it is a document download view only).
- Reworking `rules.ts` stage ordering or completion validators — they are correct and reused as-is.

## 4. Success Criteria

- [ ] "Trabajos" is reachable from sidebar on desktop and from nav on mobile.
- [ ] `/admin/trabajos` lists every trabajo in the DB as a card with status, current stage, client, and a brief description.
- [ ] Clicking a card opens `/admin/trabajos/[id]` showing agenda, visita, cotización, and venta data together with a stage timeline.
- [ ] A trabajo in the `visita` stage can be advanced to `cotización` via a server action that enforces `canAdvanceTrabajoStage` and `isTrabajoVisitaStageComplete`.
- [ ] A trabajo in the `cotización` stage can be advanced to `venta` via a server action that enforces `canAdvanceTrabajoStage` and `isTrabajoQuotationStageComplete`.
- [ ] The `venta` stage has a working form that persists to `trabajo_sale_stage` and marks the stage complete via `isTrabajoSaleStageComplete`.
- [ ] Stage ordering cannot be bypassed — a trabajo cannot skip or revert stages through any new UI.
- [ ] Downloadable documents generated for the trabajo are accessible from the detail view.

## 5. User Stories

- **As an admin**, I want a single "Trabajos" page listing every job as a card with its current stage and client, so that I do not have to jump between Agenda, Visits, and Quotations to know what is in flight.
- **As an admin**, I want to open one trabajo and see its agenda appointment, visita técnica responses, cotización amount and terms, and venta confirmation on a single screen with a timeline, so that I can review the full history of a job without navigating multiple modules.
- **As an admin**, I want to advance a trabajo from cotización to venta and record the sale confirmation, so that a job can actually be closed end-to-end instead of stalling at the cotización stage.

## 6. Technical Approach

- **Routes**
  - New: `/admin/trabajos` (list), `/admin/trabajos/[id]` (unified detail).
  - Existing routes (`/agenda/[id]`, `/admin/visits/[trabajoId]`, `/admin/quotations`, `/admin/documents/trabajos`) remain and are linked from the detail view as per-stage deep links where appropriate.
- **Components**
  - `TrabajoCard` — list item showing client, status badge, current stage, brief description, progress.
  - `TrabajoTimeline` — stage progress indicator (agenda → visita → cotización → venta → descargables).
  - `TrabajoStageSection` — reusable block rendering one stage's data in the detail view.
  - `VentaForm` — new form for the `venta` stage (no UI exists today).
  - Reuse existing stage forms where possible; do not duplicate.
- **Data / DB**
  - No new tables. Schema is already sufficient (`trabajos`, `trabajo_*_stage`, `trabajo_media_assets`).
  - Link `quotations` rows to `trabajo_quotation_stage` by `trabajo_id` for display (no migration, just a query join).
- **Server actions**
  - New `saveTrabajoCotizacionAction` — advance `visita → cotización`.
  - New `saveTrabajoVentaAction` — advance `cotización → venta`.
  - Both reuse `requireRole` admin guard, `canAdvanceTrabajoStage`, and the corresponding `is*StageComplete` validators from `rules.ts`.
- **Permissions**
  - Stage-advancement actions are admin-only (existing `requireRole` pattern).
- **Stage ordering**
  - Enforced by existing `rules.ts`; UI only exposes actions that `canAdvanceTrabajoStage` permits.

## 7. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Sidebar redundancy with existing Agenda / Visits / Cotizaciones entries confuses users | Medium | Keep legacy entries for now; "Trabajos" is the hub, legacy entries are filtered views. Add an info note on `/admin/trabajos`. Plan a later change to consolidate. |
| Mobile bottom nav cannot cleanly hold a 4th primary tab | Medium | Add "Trabajos" to the primary trio and push the least-used entry into the "Más" sheet; verify on-device before shipping. |
| Duplicate logic when building cotización/venta actions | Medium | Extract a shared stage-advancement helper from `saveTrabajoVisitaAction`; reuse in both new actions. |
| `quotations` vs `trabajo_quotation_stage` drift causes wrong amounts to show | Medium | Cotización stage view reads `trabajo_quotation_stage` as the source of truth; link `quotations` rows read-only for reference. |
| Wave 2 detail view grows too large for a single review | Medium | Split Wave 2 into two PRs: (a) detail view + timeline, (b) missing actions + venta form. |
| Breaking existing `/admin/visits/[trabajoId]` hub by overlapping with new detail view | Low | New `/admin/trabajos/[id]` is additive; existing visit hub keeps working. Migrate later. |

## 8. Open Questions

1. **Descargables stage**: is it purely a document download view, or does it need workflow/completion logic? `rules.ts` has no completion check for it today.
2. **Quotations relationship**: should `quotations` records be promoted into `trabajo_quotation_stage` automatically, or only linked for display? (Out of scope for this change, but affects the cotización view design.)
3. **Legacy nav consolidation**: do we remove Agenda / Visits / Cotizaciones sidebar entries once "Trabajos" ships, or keep them as filtered shortcuts? Affects Wave 1 scope.
4. **Venta data fields**: the `trabajo_sale_stage` schema defines `quotation_trabajo_id, confirmed_on, agreed_amount, notes`. Are these sufficient, or does the user expect additional sale fields (payment method, installer assignment, warranty start)?
5. **Card "brief description"**: which field drives the card summary — `intake` notes from the agenda stage, the client name + work type, or a new derived field?
6. **Lost / archived statuses**: should the list default to `open` trabajos only, with a filter for `won/lost/archived`, or show all by default?

## Delivery Strategy

Ship in two waves as described in §2:
- **Wave 1** (low risk, fast): sidebar + mobile nav entry, `/admin/trabajos` card list, `TrabajoCard`, deep links to current-stage pages.
- **Wave 2** (split into two PRs): (2a) `/admin/trabajos/[id]` unified detail + timeline + document links; (2b) `visita → cotización` and `cotización → venta` actions, `VentaForm`, cotización/quotations link.