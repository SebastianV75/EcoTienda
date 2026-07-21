# Tasks: Workflow Dashboard

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 340-460 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 dashboard data/UI → PR 2 Agenda title/create wiring |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Ship active-work query, route line, and `/admin` mobile hierarchy | PR 1 (base `workflow-dashboard`) | `npm run lint && npm run build` | Mobile `/admin`: active list > summary > grid; empty state keeps CTA | Revert `src/app/admin/page.tsx`, `src/features/trabajos/data.ts`, `src/features/trabajos/dashboard-*` |
| 2 | Reuse Agenda create/edit flow for generated editable titles and dashboard CTA | PR 2 (base PR 1 branch) | `npm run lint && npm run build` | `/agenda/new?source=admin-dashboard` creates work, redirects, title visible on `/admin` | Revert Agenda form/action/page changes without touching PR 1 list UI |

## Phase 1: Foundation

- [x] 1.1 Add `ActiveTrabajoDashboardItem` query/normalizer in `src/features/trabajos/data.ts`, reading open `trabajos`, merging `agenda_items.titulo`, and ordering by `updated_at desc`.
- [x] 1.2 Create `src/features/trabajos/dashboard-route-line.tsx` from `trabajoStages`/`trabajoStageLabels`, highlighting only the current stage without changing route order.
- [x] 1.3 Create `src/features/trabajos/dashboard-active-list.tsx` with compact item and empty state showing title, current stage, route line, and quick-create CTA only.

## Phase 2: Admin Home Wiring

- [x] 2.1 Update `src/app/admin/page.tsx` to fetch active items plus client summary, then render mobile order: active work, secondary summary, module grid, remaining content.
- [x] 2.2 Reduce admin summary cards to client-only secondary context; remove quotation/visit placeholders from the activity summary section.
- [x] 2.3 Keep module cards tappable at `min-h-[44px]` and simplify mobile descriptions while preserving existing routes.

## Phase 3: Agenda-backed Creation and Title Editing

- [x] 3.1 Extend `src/types/agenda.ts` and `src/features/agenda/agenda-item-form.tsx` with a generated editable `title` field; do not add project-note/meta copy.
- [x] 3.2 Update `src/features/agenda/actions.ts` so create/update persist edited `title` into `agenda_items.titulo` while keeping `trabajos` + `trabajo_agenda_stage` invariants unchanged.
- [x] 3.3 Update `src/app/agenda/new/page.tsx` to support `?source=admin-dashboard`, seed the generated title from Agenda defaults, and preserve normal create flow.
- [x] 3.4 Update `src/app/agenda/[id]/edit/page.tsx` to preload the editable title from existing Agenda data for workflow-backed records.

## Phase 4: Verification

- [x] 4.1 Run `npm run lint` and `npm run build` after each work unit; fix any type or route regressions before the next slice.
- [ ] 4.2 Manual mobile check on `/admin`: active list above metrics, compact item UI, 2x2 module grid, and zero-client / zero-active-work states render cleanly.
- [ ] 4.3 Manual Agenda flow check: open `/agenda/new?source=admin-dashboard`, edit generated title, save, confirm redirect to `/agenda/[id]`, then verify the edited title appears on the next `/admin` load.
