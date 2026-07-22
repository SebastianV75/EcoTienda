# Design: Worker Management Foundation

## Technical Approach

Introduce a real internal `workers` model alongside the existing client-backed system, then switch workflow assignment at the Agenda/Trabajo start from free-text `assignee_name` to worker selection. Keep legacy `clients` and client-heavy document/project flows intact for now so the migration stays additive and reviewable.

This slice does not rebuild the technician app yet. It creates the worker records, optional auth linkage, and assignment persistence the next slice will need to show “assigned jobs” in `/technician`.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|---|---|---|---|
| Worker scope | Technicians only vs all internal staff | All internal staff | The user wants one company worker catalog, not a technician-only list. |
| Auth linkage | Required vs optional vs deferred | Optional | Admin setup must not block on user provisioning; later technician slices can consume linked records when present. |
| Assignment source | `trabajos` root vs Agenda stage vs both | Agenda stage for first slice | Current workflow already starts in Agenda and validates assignment there; smallest safe change is replacing that source instead of inventing a second assignment authority. |
| Legacy compatibility | Remove `clients` now vs parallel model | Parallel model | Documents, quotations, and legacy areas still depend on clients. Parallel migration avoids repo-wide blast radius. |
| Existing text assignments | Hard migration vs mixed readability | Mixed readability | New/edited workflow records should use workers, but old text-only records must remain understandable. |
| Technician app readiness | Build now vs prepare data only | Prepare data only | This slice is foundation. The next slice can render assigned jobs once worker-linked assignments exist. |

## Data Model

Create a new internal worker model.

```ts
type WorkerRole = "admin" | "technician" | "staff";

type Worker = {
  id: string;
  full_name: string;
  phone: string | null;
  role: WorkerRole;
  auth_user_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};
```

Notes:
- `auth_user_id` links to auth only when available.
- `active` supports soft deactivation without breaking historical assignments.
- `staff` is the minimal catch-all for non-admin/non-technician internal workers.

## Assignment Persistence

For this slice, keep Agenda-stage assignment as the operational source.

### Current state
- `trabajo_agenda_stage.assignee_name` is free text.
- `agenda_items.assignee_name` mirrors free text for the bridge/list UI.
- validation only checks non-empty text.

### New state
- add worker reference at the Agenda-backed workflow start
- preserve readable name snapshots for legacy/mixed records where useful

Recommended persisted shape:

```ts
type AgendaWorkerAssignment = {
  assignee_worker_id: string | null;
  assignee_name: string | null;
};
```

Rules:
- New or edited workflow-backed Agenda records use `assignee_worker_id` as the real assignment.
- `assignee_name` may remain as a readable snapshot/bridge field during migration.
- Legacy records without a worker link remain readable through `assignee_name`.

## Data Flow

### Worker admin management

`/admin/workers`
-> list internal workers
-> create/edit worker
-> persist into `workers`
-> optional auth link stored as `auth_user_id`

### Agenda-backed work creation/editing

`/agenda/new` or `/agenda/[id]/edit`
-> load active workers
-> admin selects assigned worker
-> `createAgendaItemAction` / `updateAgendaItemAction`
-> write assignment into Agenda-stage workflow source
-> keep bridge/list/detail surfaces able to render assigned worker name

### Future technician resolution

future `/technician`
-> current auth user id
-> find worker where `auth_user_id = current user`
-> query assigned workflow records from Agenda-stage assignment
-> show assigned jobs first

This slice prepares that path but does not build the screen yet.

## File Changes

| File | Action | Description |
|---|---|---|
| `openspec/changes/worker-management-foundation/design.md` | Create | This design artifact. |
| `src/types/worker.ts` | Create | Worker types, role union, and small admin/assignment summaries. |
| `src/features/workers/data.ts` | Create | Worker queries for admin CRUD, active-worker selector data, and future auth-linked lookup. |
| `src/features/workers/actions.ts` | Create | Create/update worker server actions. |
| `src/features/workers/worker-form.tsx` | Create | Admin form for worker create/edit. |
| `src/features/workers/worker-card.tsx` or list component | Create | Compact admin list rendering for workers. |
| `src/app/admin/workers/page.tsx` | Create | Worker list/landing page. |
| `src/app/admin/workers/new/page.tsx` | Create | New worker page. |
| `src/app/admin/workers/[id]/edit/page.tsx` | Create | Edit worker page. |
| `src/types/agenda.ts` | Modify | Add worker summary/reference fields to agenda records and form values while keeping legacy client fields intact. |
| `src/features/agenda/data.ts` | Modify | Load worker assignment display data for workflow-backed agenda records. |
| `src/features/agenda/agenda-item-form.tsx` | Modify | Replace free-text assignee input with worker selection for workflow-backed create/edit flow. |
| `src/features/agenda/actions.ts` | Modify | Validate worker selection, persist assignment reference, and keep readable legacy bridge data where needed. |
| `src/app/agenda/new/page.tsx` | Modify | Load active workers for assignment selection. |
| `src/app/agenda/[id]/edit/page.tsx` | Modify | Load workers and prefill selected assignment. |
| `src/types/trabajo.ts` | Modify | Add worker reference fields needed for Agenda-stage assignment continuity. |
| `src/features/trabajos/data.ts` | Modify | Surface assigned worker context from Agenda stage for workflow-backed reads. |
| `src/features/trabajos/defaults.ts` | Modify | Prefer worker-backed assignment defaults where relevant. |
| `src/features/trabajos/rules.ts` | Modify | Replace non-empty free-text assignment validation with worker-backed assignment validation for new/edited workflow records. |
| `src/components/app-shell.tsx` | Modify | Add admin navigation entry for workers if needed. |
| `src/components/mobile-bottom-navigation.tsx` | Modify | Replace/remove client-focused admin shortcut with workers where appropriate for the new operational model. |

## Interfaces / Contracts

### Worker selector summary

```ts
type WorkerSummary = {
  id: string;
  full_name: string;
  role: "admin" | "technician" | "staff";
  active: boolean;
};
```

Used by Agenda/Trabajo assignment UI and later technician ownership lookup.

### Agenda form contract

The Agenda workflow form should move from:

```ts
assignee_name: string
```

toward:

```ts
assignee_worker_id: string
assignee_name: string // legacy/readable bridge during migration
```

Behavior:
- new/edited workflow records require `assignee_worker_id`
- readable assigned name can be derived from the selected worker
- old records without worker id remain readable but are not the target model

## Migration / Rollout

No repo-wide client removal in this slice.

Rollout order:
1. create workers model and admin CRUD
2. switch Agenda create/edit assignment to worker selection
3. persist worker-backed assignment in Agenda/Trabajo workflow path
4. keep legacy client-backed and text-only records readable

If schema changes are needed, prefer additive columns/relationships over destructive replacement in this slice.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Worker role normalization and assignment validation helpers | Small pure helper tests if a runner is introduced during apply; otherwise focused manual validation. |
| Integration | Worker create/edit persists and loads correctly in admin | Manual Supabase-backed CRUD smoke path. |
| Integration | Agenda create/edit requires worker selection and stores the assigned worker | Manual workflow creation/edit smoke path plus direct UI confirmation. |
| Integration | Existing legacy records without worker link remain readable | Manual review of one old record in Agenda/detail/edit surfaces. |
| E2E | Admin can create worker -> assign worker to work start -> see assignment reflected in workflow-backed Agenda/Trabajo surfaces | Manual walkthrough plus `npm run lint` and `npm run build`. |

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Worker model leaks into client-heavy areas too early | Keep documents, quotations, and projects explicitly out of scope for this slice. |
| Auth linkage becomes a blocker for assignment | Make `auth_user_id` optional and separate worker CRUD from invite/auth flows. |
| Mixed records become confusing during migration | Preserve readable `assignee_name` for legacy context while making worker selection authoritative for new edits. |
| Assignment ends up duplicated and diverges | Treat Agenda-stage assignment as the first-slice source of truth and mirror only what the workflow already depends on. |

## Open Questions

- [ ] Exact schema shape for worker reference fields (`assignee_worker_id` on `agenda_items`, `trabajo_agenda_stage`, or both) should be chosen in apply based on the current Supabase schema and the smallest additive migration.
