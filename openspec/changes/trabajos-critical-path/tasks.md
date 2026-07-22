# Tasks: Trabajos Section with Critical Path

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,210 (range 1,100–1,400) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Wave 1) → PR 2 (Wave 2a) → PR 3 (Wave 2b) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending (awaiting user decision) |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

**Per-wave lines**

| Wave | Scope | Estimated lines | PR |
|------|-------|-----------------|-----|
| Wave 1 | Navigation + list | ~360 | PR 1 |
| Wave 2a | Detail view + timeline (display-only) | ~395 | PR 2 |
| Wave 2b | Stage actions + venta form + wiring | ~455 | PR 3 |

> Note: PR 3 (~455 lines) is slightly over the 400-line guard. Maintainer may approve `size:exception` or split PR 3 into PR 3a (advanceTrabajoStage + cotización action) / PR 3b (venta action + VentaForm + wiring). This is a team decision — surfaced by the `ask-on-risk` delivery strategy.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Nav entries + filterable `/admin/trabajos` list | PR 1 | `npm test` (parses list-filter params) | `npm run dev` → open `/admin/trabajos`, toggle filters/search | Remove 2 nav entries + delete list page, TrabajoCard, TrabajoListFilters; data.ts additions are isolated exported functions |
| 2 | `/admin/trabajos/[id]` unified detail + timeline (read-only) | PR 2 | `npm test` (stage completion states) | `npm run dev` → open `/admin/trabajos/[id]` mid-flow | Delete detail page + TrabajoTimeline + TrabajoStageSection + getTrabajoDetailById (isolated exports) |
| 3 | advanceTrabajoStage helper + cotización/venta actions + VentaForm | PR 3 | `npm test` (cotización + venta payload validators) | `npm run dev` → submit cotización advance + venta form on detail page | Delete saveTrabajoCotizacion/venta actions + VentaForm + wiring; advanceTrabajoStage refactor preserved (existing visita action still uses it) |

**Test runner note**: The project uses Node's built-in runner (`node --test` on `tests/**/*.test.mjs`, pure-function unit tests only — see existing `visit-order.test.mjs`). There is **no Vitest, RTL, or Playwright** in this repo. The design doc's "Vitest with mocked Supabase" strategy is aspirational and NOT applied here. Feasible tests are pure-helper unit tests (folded into the relevant tasks below); async server actions and React Server Component pages are verified manually via `npm run dev`. Adding an action-level test harness is out of scope.

---

## Wave 1 — Navigation + List

## Task 1: Add Trabajos navigation entries (sidebar + mobile)

**Wave**: 1
**Depends on**: —
**Estimated lines**: 45
**Files**: `src/components/app-shell.tsx` (modify), `src/components/mobile-bottom-navigation.tsx` (modify)

### Description
Add a "Trabajos" entry to the desktop sidebar (`workflowNavigation`, after Visitas) and to the mobile bottom nav (`primaryMobileNavigationByRole.admin`, after Visitas).

### Acceptance Criteria
- [x] Sidebar renders "Trabajos" between Visitas and Cotizaciones on desktop (lg+).
- [x] Mobile bottom bar renders "Trabajos" and tapping it navigates to `/admin/trabajos`.
- [x] "Trabajos" is visually highlighted on `/admin/trabajos` and any `/admin/trabajos/*` subroute.
- [x] Existing nav entries (Agenda, Visitas, Cotizaciones, etc.) are preserved unchanged.

### Implementation Notes
- ImplementsREQ "Trabajos Sidebar Entry", REQ "Mobile Bottom Navigation Bar", REQ "Trabajos Active Route Indicator" (navigation spec).
- Import `Briefcase` from `reicon-react`; if unavailable, fall back to `Clipboard` (already imported) and raise in review.
- `isActive()` already prefix-matches — no detection logic change needed.
- Keep legacy entries (per proposal: Trabajos is the hub, legacy entries stay as filtered shortcuts).

## Task 2: `getTrabajosForList()` data function + types

**Wave**: 1
**Depends on**: —
**Estimated lines**: 95
**Files**: `src/features/trabajos/data.ts` (modify)

### Description
Add a lightweight list query joining agenda stage (work_type) + client, with server-side filtering by stage/status/date/search, ordered newest-first.

### Acceptance Criteria
- [x] Exports `TrabajoListFilters`, `TrabajoListItem` types matching the design contract.
- [x] `getTrabajosForList(filters)` returns `TrabajoListItem[]` ordered by `created_at` descending.
- [x] Filters combine with AND semantics: `stage`, `status`, `from`/`to` (creation date), `q` (client name OR address, case-insensitive).
- [x] Missing/optional filters are no-ops (not appended to the query).
- [x] No new DB tables; reuses existing Supabase client + normalize patterns from `data.ts`.

### Implementation Notes
- Implements REQ "Trabajos List Page", REQ "List Filters", REQ "List Search" (trabajos-list spec).
- Lightweight select — do NOT join all stage tables; only `agenda_stage.work_type` + client name.
- Do not unit-test the Supabase query directly (no mocking infra); filter correctness is covered indirectly by Task 3's pure param parser + manual list-page checks.

## Task 3: `parseTrabajoListFilters` pure helper + unit test

**Wave**: 1
**Depends on**: —
**Estimated lines**: 40
**Files**: `src/features/trabajos/list-filters.ts` (create), `tests/trabajo-list-filters.test.mjs` (create)

### Description
Extract a pure function that converts `URLSearchParams` into a validated `TrabajoListFilters` object, plus a Node `node:test` unit test.

### Acceptance Criteria
- [x] `parseTrabajoListFilters(params)` validates `stage`/`status` against the known enums (invalid → undefined).
- [x] Parses `from`/`to` as ISO date strings (invalid/empty → undefined).
- [x] Trims `q`; empty → undefined.
- [x] `tests/trabajo-list-filters.test.mjs` covers valid, invalid, empty, and combined cases and passes `npm test`.

### Implementation Notes
- Pure function so it can be tested with `node:test` (matches `visit-order.test.mjs` pattern).
- Consumed by both the server list page (reads `searchParams`) and the `TrabajoListFilters` client component (reads `useSearchParams`).

## Task 4: `TrabajoListFilters` client component

**Wave**: 1
**Depends on**: 3
**Estimated lines**: 65
**Files**: `src/features/trabajos/components/trabajo-list-filters.tsx` (create)

### Description
Client filter bar: stage select, status select, date range (from/to), and search input — all synced to URL search params.

### Acceptance Criteria
- [x] Renders stage dropdown (agenda/visita/cotizacion/venta/descargables), status dropdown (open/won/lost/archived), `from`/`to` date inputs, and search input.
- [x] Changing any control updates the URL search params without losing the others.
- [x] Initial values come from `initialFilters` prop (from `parseTrabajoListFilters`).
- [x] `"use client"` directive present.

### Implementation Notes
- Implements REQ "List Filters", REQ "List Search" UI.
- Use `useSearchParams()` + `useRouter().replace`; merge with existing params.
- Optional: debounce the search input.

## Task 5: `TrabajoCard` component

**Wave**: 1
**Depends on**: 2
**Estimated lines**: 60
**Files**: `src/features/trabajos/components/trabajo-card.tsx` (create)

### Description
List item card showing client name, status badge, current stage, brief description, and creation date; whole card is a link to `/admin/trabajos/[id]`.

### Acceptance Criteria
- [x] Displays `client_name` (or "Sin cliente"), `current_stage` as a badge, `status` badge, brief description, and `created_at` (formatted).
- [x] Clicking anywhere on the card navigates to `/admin/trabajos/[id]`.
- [x] Brief description derived from `intake_name` / agenda `work_type` (per open question #5 — default: client name + work type).

### Implementation Notes
- Implements REQ "Trabajos List Page" card rendering, REQ "Trabajo Card Navigation".
- Use Next `Link`; `clsx` for badge classes; reuse existing badge styling conventions.

## Task 6: `/admin/trabajos` list page

**Wave**: 1
**Depends on**: 2, 3, 4, 5
**Estimated lines**: 55
**Files**: `src/app/admin/trabajos/page.tsx` (create)

### Description
Server page that reads `searchParams`, calls `getTrabajosForList`, and renders the filter bar + card grid with an empty state.

### Acceptance Criteria
- [x] Reads `searchParams`, calls `parseTrabajoListFilters`, then `getTrabajosForList(filters)`.
- [x] Renders `TrabajoListFilters` + responsive card grid (grid on desktop, stacked on mobile).
- [x] Shows an empty-state message with "clear filters" guidance when no trabajos match.
- [x] Cards ordered newest-first by creation date.

### Implementation Notes
- Implements REQ "Trabajos List Page" (route + ordering + empty state).
- Verify manually via `npm run dev` → `/admin/trabajos` (no RTL infra).

---

## Wave 2a — Detail View + Timeline (display-only)

## Task 7: `getTrabajoDetailById()` data function + types

**Wave**: 2a
**Depends on**: —
**Estimated lines**: 90
**Files**: `src/features/trabajos/data.ts` (modify)

### Description
Extend the `trabajoDocumentSelect` pattern into a new detail query that left-joins `quotations` (linked by `trabajo_id`) and returns the full `TrabajoDetailRecord`.

### Acceptance Criteria
- [ ] Exports `TrabajoDetailRecord` (and `LinkedQuotation`) types per the design contract.
- [ ] `getTrabajoDetailById(id)` returns agenda, visita, cotización, venta, client, media_assets, and `linked_quotations`.
- [ ] Returns the document-select-style normalized shape; `quotations` rows are read-only reference (source of truth is `trabajo_quotation_stage`).
- [ ] Returns `null`/not-found handling delegated to the page.

### Implementation Notes
- Reuse existing `trabajoDocumentSelect` join set; add only the `quotations` left-join.
- Need not be unit-tested directly (async + Supabase); normalize logic that is pure may be split out if feasible.

## Task 8: `TrabajoTimeline` component

**Wave**: 2a
**Depends on**: 11
**Estimated lines**: 55
**Files**: `src/features/trabajos/components/trabajo-timeline.tsx` (create)

### Description
5-stage progress indicator (agenda → visita → cotización → venta → descargables) highlighting the current stage and marking completed stages.

### Acceptance Criteria
- [ ] Renders all five stages in order.
- [ ] Highlights `currentStage`; marks completed stages distinctly from pending.
- [ ] Pure presentational — driven by `TrabajoTimelineProps` (`currentStage`, `completedStages`).

### Implementation Notes
- Implements REQ "Unified Trabajo Detail View" (timeline part).
- Consumes the `completedStages` map produced by Task 11's `computeStageCompletionStates`.

## Task 9: `TrabajoStageSection` component

**Wave**: 2a
**Depends on**: 7
**Estimated lines**: 120
**Files**: `src/features/trabajos/components/trabajo-stage-section.tsx` (create)

### Description
Collapsible section that renders one stage's data (or "Pendiente" placeholder) with a `children` slot reserved for advancement forms (used in Wave 2b).

### Acceptance Criteria
- [ ] Renders a collapsible header (stage label + status chip) and body.
- [ ] Shows the stage's field data when present; shows "Pendiente" when the stage data is null.
- [ ] Agenda section: appointment date, work type, assignee, contact, address, map link.
- [ ] Visita section: all form responses (whichever visita form was filled).
- [ ] Cotización section: scope, amount, terms, outcome, quotation type + read-only linked `quotations`.
- [ ] Venta section: confirmed date, agreed amount, notes (empty until Wave 2b).
- [ ] Descargables section: lists downloadable documents with links.
- [ ] Accepts a `children` prop (rendered only when `isCurrent`).
- [ ] **Split if this file exceeds 200 lines** — extract per-stage render helpers into separate files.

### Implementation Notes
- Implements REQ "Stage Section Contents", REQ "Unified Trabajo Detail View" (sections).
- Descargables links point at existing `/admin/documents/trabajos` output (no new generation logic).
- Keep wave-2b advancement wiring out of this task (slot stays empty for now).

## Task 10: `/admin/trabajos/[id]` detail page (display-only)

**Wave**: 2a
**Depends on**: 7, 8, 9, 11
**Estimated lines**: 85
**Files**: `src/app/admin/trabajos/[id]/page.tsx` (create)

### Description
Server page that calls `getTrabajoDetailById`, renders `TrabajoTimeline` + five `TrabajoStageSection`s, and a "Volver a Trabajos" back link. Display-only — no advancement buttons yet.

### Acceptance Criteria
- [ ] Calls `getTrabajoDetailById(params.id)`; renders Not Found when missing.
- [ ] Renders `TrabajoTimeline` + one `TrabajoStageSection` per stage (agenda, visita, cotización, venta, descargables).
- [ ] Each non-current completed stage shows its data; incomplete stages show "Pendiente".
- [ ] Renders a "Volver a Trabajos" link to `/admin/trabajos`.
- [ ] No stage-advancement UI in this wave (children slot unused).

### Implementation Notes
- Implements REQ "Unified Trabajo Detail View", REQ "Stage Section Contents", REQ "Return to List Navigation".
- Verify manually via `npm run dev` → open a mid-flow trabajo.

## Task 11: `computeStageCompletionStates` helper + unit test

**Wave**: 2a
**Depends on**: —
**Estimated lines**: 45
**Files**: `src/features/trabajos/stage-states.ts` (create), `tests/stage-states.test.mjs` (create)

### Description
Pure function deriving per-stage completion + current-stage flag from a detail record, plus a `node:test` unit test.

### Acceptance Criteria
- [ ] `computeStageCompletionStates(detail)` returns `[{ stage, completed, completedAt }]` for all 5 stages in order.
- [ ] Flags the current stage; orders completion via `rules.ts` `is*StageComplete` validators.
- [ ] `tests/stage-states.test.mjs` covers mid-flow (current=visita), all-complete, and not-started cases; passes `npm test`.

### Implementation Notes
- Keeps `TrabajoTimeline` (Task 8) purely presentational.
- Reuses `isTrabajoAgendaStageComplete`, `isTrabajoVisitaStageComplete`, `isTrabajoQuotationStageComplete`, `isTrabajoSaleStageComplete` from `rules.ts` unchanged.

---

## Wave 2b — Stage Actions + Venta Form

## Task 12: Extract `advanceTrabajoStage()` shared helper

**Wave**: 2b
**Depends on**: —
**Estimated lines**: 80
**Files**: `src/features/trabajos/actions.ts` (modify — refactor existing)

### Description
Extract the snapshot → validate → upsert → advance → set completion timestamp → revalidate pattern from `saveTrabajoVisitaAction` into a shared `advanceTrabajoStage()` helper, then refactor the existing visita action to use it (no behavior change).

### Acceptance Criteria
- [ ] `advanceTrabajoStage({ supabase, trabajoId, currentStage, nextStage, completionField, stagePayload, revalidatePaths })` exists.
- [ ] `saveTrabajoVisitaAction` is refactored to call it; existing visita→visita flow still advances correctly.
- [ ] `canAdvanceTrabajoStage` is enforced inside the helper.
- [ ] No new external behavior introduced (pure refactor).

### Implementation Notes
- Foundation for Tasks 13–16; DRYs the three-stage advancement pattern.
- Refactor risk: verify the existing visita path still works manually before building new actions.

## Task 13: `validateCotizacionPayload` helper + unit test

**Wave**: 2b
**Depends on**: —
**Estimated lines**: 50
**Files**: `src/features/trabajos/cotizacion-payload.ts` (create), `tests/cotizacion-payload.test.mjs` (create)

### Description
Pure validator for cotización form fields returning `{ errors, values }`, plus a `node:test` unit test. This is the RED-first test surface for the cotización action.

### Acceptance Criteria
- [ ] Validates `trabajo_id`, `scope_summary`, `amount` (positive number), `terms_and_conditions`, `outcome`, `quotation_type`.
- [ ] Returns field-level errors for missing/invalid input; returns parsed values on success.
- [ ] `tests/cotizacion-payload.test.mjs` covers missing fields, negative amount, valid payload; passes `npm test`.

### Implementation Notes
- Pure function → testable with `node:test` (project has no action mocking infra).
- Called by `saveTrabajoCotizacionAction` (Task 14).

## Task 14: `saveTrabajoCotizacionAction` server action

**Wave**: 2b
**Depends on**: 12, 13
**Estimated lines**: 55
**Files**: `src/features/trabajos/actions.ts` (modify)

### Description
Server action advancing a trabajo `visita → cotizacion` using the shared helper and the cotización payload validator.

### Acceptance Criteria
- [ ] Calls `requireRole(["admin"])`; rejects non-admins.
- [ ] Validates form fields via `validateCotizacionPayload`; returns validation error state on failure.
- [ ] Verifies `canAdvanceTrabajoStage(current, "cotizacion", isTrabajoVisitaStageComplete(visita))`.
- [ ] On success: upserts `trabajo_quotation_stage`, sets `current_stage="cotizacion"`, sets `visita_completed_at`, revalidates `/admin/trabajos` and `/admin/trabajos/[id]`.
- [ ] Rejects when current stage is not `visita` (no skipping/reverting).

### Implementation Notes
- Implements REQ "Visita to Cotizacion Transition Action", REQ "Stage Ordering Enforcement", REQ "Admin Only Authorization" (stage-transitions spec).
- Verify manually via `npm run dev` (no action unit-test infra).

## Task 15: `validateVentaPayload` helper + unit test

**Wave**: 2b
**Depends on**: —
**Estimated lines**: 50
**Files**: `src/features/trabajos/venta-payload.ts` (create), `tests/venta-payload.test.mjs` (create)

### Description
Pure validator for venta form fields returning `{ errors, values }`, plus a `node:test` unit test.

### Acceptance Criteria
- [ ] Validates `trabajo_id`, `quotation_trabajo_id`, `confirmed_on` (ISO date), `agreed_amount` (positive), `notes`.
- [ ] Returns field-level errors for missing/invalid input; returns parsed values on success.
- [ ] `tests/venta-payload.test.mjs` covers missing fields, bad date, negative amount, valid payload; passes `npm test`.

### Implementation Notes
- Venta schema stays at the 4 fields per proposal open-question #4 (no payment/installer/warranty additions).
- Pure function → `node:test`.

## Task 16: `saveTrabajoVentaAction` server action

**Wave**: 2b
**Depends on**: 12, 15
**Estimated lines**: 55
**Files**: `src/features/trabajos/actions.ts` (modify)

### Description
Server action advancing a trabajo `cotizacion → venta` using the shared helper and the venta payload validator.

### Acceptance Criteria
- [ ] Calls `requireRole(["admin"])`; rejects non-admins.
- [ ] Validates form fields via `validateVentaPayload`; returns validation error state on failure.
- [ ] Verifies `canAdvanceTrabajoStage(current, "venta", isTrabajoQuotationStageComplete(cotizacion))`.
- [ ] On success: upserts `trabajo_sale_stage`, sets `current_stage="venta"`, sets `cotizacion_completed_at`, revalidates `/admin/trabajos` and `/admin/trabajos/[id]`.
- [ ] Rejects when current stage is not `cotizacion` (no skipping/reverting).

### Implementation Notes
- Implements REQ "Cotizacion to Venta Transition Action", REQ "Stage Ordering Enforcement", REQ "Admin Only Authorization".
- Verify manually via `npm run dev`.

## Task 17: `VentaForm` client component

**Wave**: 2b
**Depends on**: 16
**Estimated lines**: 90
**Files**: `src/features/trabajos/components/venta-form.tsx` (create)

### Description
Client form for the venta stage using `useActionState(saveTrabajoVentaAction, …)` with the four venta fields and validation feedback.

### Acceptance Criteria
- [ ] `"use client"`; uses `useActionState` bound to `saveTrabajoVentaAction`.
- [ ] Renders `quotation_trabajo_id`, `confirmed_on`, `agreed_amount`, `notes` inputs.
- [ ] Shows server-returned per-field errors and a success indicator.
- [ ] Disables submit while pending; calls `revalidatePath` on success (via action).

### Implementation Notes
- Implements REQ "Stage Advancement Actions" (venta form UI).
- No payment-method/installer/warranty fields (out of scope per open question #4).

## Task 18: Wire advancement actions + forms into detail view

**Wave**: 2b
**Depends on**: 9, 10, 14, 16, 17
**Estimated lines**: 75
**Files**: `src/app/admin/trabajos/[id]/page.tsx` (modify), `src/features/trabajos/components/trabajo-stage-section.tsx` (modify — consume children)

### Description
Wire stage-advancement controls into the detail page: render cotización advance (when visita complete) and the `VentaForm` (when cotización complete) inside the `TrabajoStageSection` children slot, gated by `canAdvanceTrabajoStage`.

### Acceptance Criteria
- [ ] Cotización advancement button/form renders in the visita section only when `isTrabajoVisitaStageComplete` + `canAdvanceTrabajoStage(visita, cotizacion)` both pass.
- [ ] `VentaForm` renders in the cotización section only when `isTrabajoQuotationStageComplete` + `canAdvanceTrabajoStage(cotizacion, venta)` both pass.
- [ ] No advancement UI shown for stages that do not meet prerequisites.
- [ ] After successful action, the timeline + sections update (revalidated).

### Implementation Notes
- Completes REQ "Stage Advancement Actions" (trabajo-detail spec).
- Keeps all 5 spec scenarios reachable: visita→cotización advance, cotización→venta advance, incomplete-visita block, incomplete-cotización block, skip-stage block.
- Manual end-to-end verify via `npm run dev`: create agenda → visita → cotización → venta.