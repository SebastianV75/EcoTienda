# Apply Progress: workflow-model

## Status

Phase 1 foundation is implemented. Phase 2 added the Agenda shell, workflow-backed agenda reads, and the first real Visita capture route. Phase 3 now links quotations to `Trabajo`, adds dual-mode document previews, and re-centers the admin UI around workflow work.

## Completed work

- [x] Added `docs/sql/create-trabajos-tables.sql` with `trabajos`, stage tables, media assets, document overrides, indexes, updated-at triggers, and RLS policies.
- [x] Added `src/types/trabajo.ts` with workflow enums, aggregate contracts, stage payload types, media kinds, and document override shapes.
- [x] Added `src/features/trabajos/data.ts` with stage ordering, snapshot container types, and grouping/sorting helpers.
- [x] Added `src/features/trabajos/rules.ts` with stage validation, advancement gating, and completion checks.
- [x] Added `src/features/trabajos/defaults.ts` with work-owned document default composition.
- [x] Updated Phase 1 task checkboxes in `openspec/changes/workflow-model/tasks.md` and left the build-gated verification task open.
- [x] Ran `npm run lint`.
- [x] `npm run build` now passes after Phase 2 fixed the client-bundle import chain.

## Phase 2 work

- [x] Reworked `src/features/agenda/actions.ts` so Agenda creates a workflow `Trabajo` shell plus the legacy `agenda_items` bridge from free-text intake.
- [x] Expanded `src/features/agenda/data.ts`, `src/features/agenda/agenda-item-detail.tsx`, and `src/features/agenda/agenda-item-card.tsx` to read workflow-backed rows while keeping legacy agenda records visible.
- [x] Rebuilt `src/features/agenda/agenda-item-form.tsx` and the Agenda create/edit pages around free-text intake, optional client linkage, and workflow defaults.
- [x] Added `src/features/trabajos/actions.ts`, `src/features/trabajos/visita-form.tsx`, and `src/app/admin/visits/[trabajoId]/page.tsx` for the first Visita capture flow.
- [x] Updated `src/features/trabajos/data.ts` and `src/features/trabajos/rules.ts` to support the new visit page without leaking server-only imports into the client bundle.
- [x] Marked the Phase 2 implementation checkboxes in `openspec/changes/workflow-model/tasks.md`.
- [x] Ran `npm run lint` and `npm run build` successfully.

## Work Unit Evidence

| Evidence | Result |
|----------|--------|
| Focused validation command | `npm run lint` — pass; `npm run build` — pass |
| Runtime harness command/scenario | N/A — no live Supabase/runtime exercise was available in this session |
| Rollback boundary | `src/features/agenda/*`, `src/app/agenda/*`, `src/app/admin/visits/*`, `src/features/trabajos/*`, `openspec/changes/workflow-model/tasks.md`, `openspec/changes/workflow-model/apply-progress.md` |

## Files changed

| File | Change |
|------|--------|
| `docs/sql/create-trabajos-tables.sql` | Added the workflow-first database schema and policies. |
| `src/types/trabajo.ts` | Added the shared workflow model types and labels. |
| `src/features/trabajos/data.ts` | Added stage ordering and snapshot helpers. |
| `src/features/trabajos/rules.ts` | Added pure completion and advancement rules. |
| `src/features/trabajos/defaults.ts` | Added document default composition helpers. |
| `openspec/changes/workflow-model/tasks.md` | Marked Phase 1 foundation tasks complete. |
| `openspec/changes/workflow-model/apply-progress.md` | Recorded cumulative progress and evidence. |

| `src/features/agenda/actions.ts` | Added workflow shell creation, legacy bridge writes, and compatibility updates. |
| `src/features/agenda/data.ts` | Reads workflow agenda rows plus legacy records with dedupe/fallback. |
| `src/types/agenda.ts` | Expanded agenda projections with workflow fields and intake form values. |
| `src/features/agenda/agenda-item-form.tsx` | Rebuilt the agenda form around free-text intake and optional client linking. |
| `src/features/agenda/agenda-item-detail.tsx` | Shows workflow contact/visit details and links to visit capture when pending. |
| `src/features/agenda/agenda-item-card.tsx` | Displays appointment time for workflow-backed agenda items. |
| `src/app/agenda/new/page.tsx` | Defaults Agenda to workflow-style work intake. |
| `src/app/agenda/[id]/page.tsx` | Updated the detail page copy for the workflow-first agenda flow. |
| `src/app/agenda/[id]/edit/page.tsx` | Updated form defaults and copy for workflow-aware editing. |
| `src/app/admin/visits/page.tsx` | Points to the visit capture route for workflow-backed agenda items. |
| `src/app/admin/visits/[trabajoId]/page.tsx` | New visit capture page with legacy fallback handling. |
| `src/features/trabajos/actions.ts` | Saves and validates the first visit capture flow. |
| `src/features/trabajos/visita-form.tsx` | Client form for conditional visit capture. |

## Notes

- No dedicated test runner exists in this repo, so scenario verification is limited to static code paths plus the build/lint safety net.
- The client bundle initially broke because `src/features/trabajos/rules.ts` imported server-only data; making the stage order local fixed the build.
- Agenda-visible behavior now uses workflow rows first, but legacy `agenda_items` still render if no workflow row exists.

## Phase 3 work

- [x] Linked quotations to `trabajo_id` in the type layer, data access layer, create/update actions, quotation detail page, edit form, and the SQL schema reference.
- [x] Added dual-mode document selection and preview support for `clientId` and `trabajoId`, including work-selection entry points and work-backed preview subject composition.
- [x] Reworked the admin dashboard, shell navigation, mobile navigation, and documents hub to prioritize workflow actions and show workflow counts.
- [ ] Full runtime proof of every requested scenario is still incomplete; build/lint are green, but the sale-block-without-quotation case was not exercised end-to-end in a live runtime.

## Visit save truthfulness fix

- [x] Removed the fake manual asset-ID requirement from the Visita save flow so visits can save with the fields the product can actually satisfy today.
- [x] Kept the minisplit conditional branch intact.
- [x] Updated the Visita form copy to say file and signature capture is still deferred instead of asking for invented identifiers.

### Work Unit Evidence

| Evidence | Result |
|----------|--------|
| Focused validation command | `npm run lint` — pass; `npm run build` — pass |
| Runtime harness command/scenario | N/A — no live Supabase/runtime exercise was available in this session |
| Rollback boundary | `src/features/trabajos/actions.ts`, `src/features/trabajos/rules.ts`, `src/features/trabajos/visita-form.tsx`, `openspec/changes/workflow-model/apply-progress.md` |

### Work Unit Evidence

| Evidence | Result |
|----------|--------|
| Focused validation command | `npm run lint` — pass; `npm run build` — pass |
| Runtime harness command/scenario | N/A — no live Supabase/runtime exercise was available in this session |
| Rollback boundary | `src/types/quotation.ts`, `src/features/quotations/{actions,data,quotation-card,quotation-form}.ts*`, `src/app/admin/quotations/**`, `docs/quotations-schema.sql`, `src/features/documents/*`, `src/app/admin/documents/**`, `src/app/admin/page.tsx`, `src/components/app-shell.tsx`, `src/components/mobile-bottom-navigation.tsx`, `src/features/trabajos/{data,defaults}.ts`, `src/app/admin/documents/trabajos/page.tsx` |

### Files changed

| File | Change |
|------|--------|
| `docs/quotations-schema.sql` | Added `trabajo_id` to `quotations` and indexed it. |
| `src/types/quotation.ts` | Added the `trabajo_id` field to the quotation shape. |
| `src/features/quotations/{actions,data,quotation-card,quotation-form}.ts*` | Persisted and surfaced `trabajo_id` in quotation flows. |
| `src/app/admin/quotations/**` | Kept quotation details/edit/new screens compatible with work-linked quotations. |
| `src/features/documents/*` | Added dual-mode selectors and work-backed preview subject composition. |
| `src/app/admin/documents/**` | Added work-selection entry point and work-aware document previews. |
| `src/app/admin/page.tsx` | Added workflow counts and Agenda/document CTAs. |
| `src/components/app-shell.tsx`, `src/components/mobile-bottom-navigation.tsx` | Re-ordered and renamed workflow-priority navigation labels. |
| `src/features/trabajos/{data,defaults}.ts` | Added document source loading, selection helpers, and work-default fallbacks. |

## Remaining tasks

- [ ] Decide whether to add runtime fixtures for the remaining scenario proofs, especially the sale-block-without-quotation path.
