# Tasks: Workflow Core Redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 700-1100 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 admin+nav -> PR 2 agenda -> PR 3 visits -> PR 4 consistency |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Make `/admin` and shared navigation read as one workflow-first operational board | PR 1 (base `workflow-core-redesign`) | `npm run lint && npm run build` | Mobile/desktop `/admin`: active work dominates, nav emphasizes workflow surfaces | Revert `src/app/admin/page.tsx`, `src/components/app-shell.tsx`, `src/components/mobile-bottom-navigation.tsx`, `src/features/trabajos/dashboard-*` |
| 2 | Reframe Agenda list/create/detail/edit as the intake stage of `Trabajo` | PR 2 (base PR 1 branch) | `npm run lint && npm run build` | `/agenda`, `/agenda/new`, `/agenda/[id]`, `/agenda/[id]/edit`: intake reads as stage one and next step is clear | Revert `src/app/agenda/**`, `src/features/agenda/agenda-item-form.tsx` |
| 3 | Reframe Visits as the next operational stage with lower-noise completion surfaces | PR 3 (base PR 2 branch) | `npm run lint && npm run build` | `/admin/visits` and `/admin/visits/[trabajoId]`: visit flow reads as continuation from Agenda | Revert `src/app/admin/visits/**` |
| 4 | Remove remaining workflow-core visual fragmentation and align copy/hierarchy across slices | PR 4 (base PR 3 branch) | `npm run lint && npm run build` | Manual workflow-core walkthrough: Admin -> Agenda -> Visit continuity feels like one tool | Revert only touched workflow-core files from earlier slices |

## Phase 1: Admin Board and Shared Navigation

- [x] 1.1 Restructure `src/app/admin/page.tsx` so the first screenful is dominated by active work and unblock actions, with summaries and module access clearly secondary.
- [x] 1.2 Update `src/features/trabajos/dashboard-active-list.tsx` to strengthen operational hierarchy, keep item content compact, and expose the most useful next-step affordance without adding noisy payload details.
- [x] 1.3 Tune `src/features/trabajos/dashboard-route-line.tsx` so route context stays visually subordinate to the current stage/action.
- [x] 1.4 Adjust `src/components/app-shell.tsx` and `src/components/mobile-bottom-navigation.tsx` so workflow surfaces are emphasized over secondary modules and active state continuity is clear.

## Phase 2: Agenda as Workflow Intake

- [x] 2.1 Update `src/app/agenda/page.tsx` so workflow-backed agenda work reads as intake-stage work management rather than a disconnected module list.
- [x] 2.2 Update `src/app/agenda/new/page.tsx` and `src/features/agenda/agenda-item-form.tsx` so the create flow reads as starting a `Trabajo`, keeps one sober task surface, and preserves the reactive title behavior.
- [x] 2.3 Update `src/app/agenda/[id]/page.tsx` to clarify current stage, next action, and workflow continuity for workflow-backed records while keeping legacy records understandable.
- [x] 2.4 Update `src/app/agenda/[id]/edit/page.tsx` so edit framing matches the intake-stage mental model instead of a generic record editor.

## Phase 3: Visits as Workflow Continuation

- [x] 3.1 Update `src/app/admin/visits/page.tsx` so visit-stage work is organized around operational progress and visually matches the workflow-first hierarchy used on `/admin`.
- [x] 3.2 Update `src/app/admin/visits/[trabajoId]/page.tsx` so the visit page frames the form as the current work stage and makes the post-visit next step understandable.
- [x] 3.3 Reduce ornamental layout and supporting noise around visit completion so field requirements and blocking conditions stay primary.

## Phase 4: Cross-Surface Consistency Pass

- [x] 4.1 Align workflow-core spacing, titles, labels, button language, and support copy so Admin, Agenda, and Visits read as one product surface.
- [x] 4.2 Remove leftover equal-weight cards, repeated headings, or modular wrappers that survived earlier slices and still violate the anti-slop direction.
- [x] 4.3 Re-check every changed workflow-core screen against `slop.md` and fix any remaining UI patterns that conflict with the sober operational direction.

## Phase 5: Verification

- [x] 5.1 Run `npm run lint` and `npm run build` after each slice; fix regressions before starting the next slice.
- [x] 5.2 Manual `/admin` check on mobile and desktop: active work dominates the first screenful, secondary modules feel subordinate, and workflow navigation priority is clear.
- [x] 5.3 Manual Agenda check: list/create/detail/edit all read as stage-one workflow surfaces, and next-step continuity toward Visits is understandable.
- [x] 5.4 Manual Visits check: the worklist and detail page read as continuation from Agenda, and completion requirements are clearer than decorative structure.
- [x] 5.5 Manual cross-surface check: Admin -> Agenda -> Visits feels like one tool instead of separate modules.
