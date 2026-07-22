# Tasks: Worker Management Foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 420-650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 worker model + admin CRUD, PR 2 Agenda/Trabajo assignment foundation |
| Delivery strategy | ask-always |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes - implementation is likely to exceed the 400-line review budget unless split.
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Add worker model and admin worker management UI | PR 1 (base `worker-management-foundation`) | `npm run lint && npm run build` | Admin can create/edit/list workers | Revert worker types/data/actions/pages without touching Agenda assignment |
| 2 | Replace free-text Agenda assignment with worker selection | PR 2 (base PR 1 branch) | `npm run lint && npm run build` | New/edit Agenda workflow record stores selected worker assignment | Revert Agenda/Trabajo assignment changes without removing worker admin CRUD |
| 3 | Keep workflow-backed reads readable and technician-ready | PR 2 or PR 3 depending on diff size | `npm run lint && npm run build` | Agenda/detail/trabajo reads show assigned worker correctly; legacy records remain readable | Revert read/default/rule/nav adjustments only |

## Phase 1: Worker Model and Admin CRUD

- [x] 1.1 Create `src/types/worker.ts` with worker record, role, summary, and form-value types.
- [x] 1.2 Add `src/features/workers/data.ts` with worker queries for list, detail, active selector data, and future auth-linked lookup.
- [x] 1.3 Add `src/features/workers/actions.ts` for create/update worker flows with optional auth link support.
- [x] 1.4 Create admin worker UI (`worker-form.tsx`, list/card component as needed) and routes under `src/app/admin/workers/` for list, new, and edit.
- [x] 1.5 Add worker-management navigation entry in admin shell/mobile admin shortcuts where it improves discoverability without overloading the UI.

## Phase 2: Agenda Assignment Foundation

- [x] 2.1 Update `src/types/agenda.ts` to support worker-backed assignment fields while keeping legacy client fields readable.
- [x] 2.2 Update `src/features/agenda/agenda-item-form.tsx` to replace free-text `assignee_name` entry with worker selection for workflow-backed creation/editing.
- [x] 2.3 Update `src/app/agenda/new/page.tsx` and `src/app/agenda/[id]/edit/page.tsx` to load active workers and prefill selected assignment.
- [x] 2.4 Update `src/features/agenda/actions.ts` validation and persistence so new/edited workflow records require a selected worker and store worker-backed assignment data.

## Phase 3: Workflow Read Path and Validation

- [x] 3.1 Update `src/types/trabajo.ts` and `src/features/trabajos/data.ts` to surface Agenda-stage worker assignment through workflow-backed reads.
- [x] 3.2 Update `src/features/trabajos/defaults.ts` to prefer worker-backed assignment context where relevant.
- [x] 3.3 Update `src/features/trabajos/rules.ts` so assignment validation for new/edited workflow records is worker-backed instead of free-text-only.
- [x] 3.4 Update Agenda/detail/list read surfaces to show assigned worker names while preserving readability for legacy text-only records.

## Phase 4: Technician-Ready Foundation

- [x] 4.1 Ensure worker records can optionally link to auth users without blocking worker creation.
- [x] 4.2 Keep assignment data shaped so a later technician app can resolve “my assigned jobs” from worker linkage without reworking Agenda assignment again.
- [x] 4.3 Do not rebuild `/technician` yet; only preserve the future lookup path in data and schema choices.

## Phase 5: Verification

- [x] 5.1 Run `npm run lint` and `npm run build` after each work unit; fix regressions before moving on.
- [ ] 5.2 Manual admin CRUD check: create a worker, edit it, and confirm it appears in the worker list.
- [ ] 5.3 Manual Agenda check: create a workflow-backed work item, assign a worker, save, reopen, and confirm the assignment persists.
- [ ] 5.4 Manual legacy check: open an older text-assigned Agenda/Trabajo record and confirm it remains readable.
- [ ] 5.5 Manual scope check: client-backed documents and legacy project areas still load unchanged in this slice.
