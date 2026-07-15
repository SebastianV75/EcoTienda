# Tasks: EcoTienda Agenda v1

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500-900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 schema/data → PR 2 routes/navigation/calendar → PR 3 detail/edit/verify |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

## Implementation Tasks

- [x] 1. Establish Agenda persistence and shared types.
  - Files: `docs/sql/create-agenda-items-table.sql`, `src/types/agenda.ts`, discovery target: existing client CRUD types/patterns under `src/features/clients/**`.
  - Define `agenda_items` schema, indexes, and RLS for staff read/admin update.
  - Encode allowed `tipo`/`estado` values for app usage without storing display labels in SQL.
  - Confirm visits stay linked through Agenda fields only; do not create a separate scheduled visits record.
  - Validation: SQL reviewed against spec fields (`fecha`, `titulo`, `tipo`, `estado`) and RLS matches staff read/admin update.

- [x] 2. Add Agenda data access and validation layer.
  - Files: `src/features/agenda/data.ts`, `src/features/agenda/actions.ts`, `src/features/agenda/calendar-utils.ts`.
  - Implement month-range query, pending-only query, item-by-id query, and update action.
  - Keep pending list filtered to `estado = 'pendiente'` and ordered by `fecha`.
  - Keep update validation strict for required fields; no fake/default demo values.
  - Validation: tests for month boundaries/grouping and server-side validation for required fields/enums.

- [x] 3. Add Agenda routes and internal navigation entry.
  - Files: `src/app/agenda/page.tsx`, `src/components/app-shell.tsx`, `src/components/mobile-bottom-navigation.tsx`, discovery target: current access guard usage for internal staff routes.
  - Create `/agenda` as the shared internal entry with calendar as default view.
  - Add Agenda to desktop/mobile navigation using existing shell patterns.
  - Keep access internal-only; do not expose a client-facing scheduling entry.
  - Validation: manual check that staff can reach `/agenda` from both navigations and unauthorized/client-facing contexts cannot.

- [x] 4. Build the lightweight monthly calendar and pending list views.
  - Files: `src/features/agenda/agenda-calendar.tsx`, `src/features/agenda/agenda-month-controls.tsx`, `src/features/agenda/agenda-pending-list.tsx`, `src/features/agenda/agenda-item-card.tsx`, `src/app/agenda/page.tsx`.
  - Render a hand-rolled month grid driven by `?month=YYYY-MM`; no heavy calendar dependency.
  - Show only persisted items grouped by scheduled day.
  - Add the secondary pending list ordered by scheduled date and limited to `pendiente`.
  - Make visit-type items visible through Agenda instead of duplicating them elsewhere.
  - Validation: verify month navigation, empty/overflow days, real-data-only rendering, and pending filter/order behavior.

- [x] 5. Add item detail and admin-only edit flow.
  - Files: `src/app/agenda/[id]/page.tsx`, `src/app/agenda/[id]/edit/page.tsx`, `src/features/agenda/agenda-item-detail.tsx`, `src/features/agenda/agenda-item-form.tsx`, `src/features/agenda/actions.ts`.
  - Show read-only detail for internal staff.
  - Restrict edit route and edit action to admins only.
  - Preserve selected `tipo` and scheduled `fecha` on edit; support optional `descripcion` and `client_id` without inventing missing linked data.
  - Validation: admin can edit, technician can view but not edit, updated item appears correctly in detail and agenda views.

- [x] 6. Keep legacy Visits connected without duplicate scheduling.
  - File: `src/app/admin/visits/page.tsx`.
  - Repoint Visits to Agenda-filtered visit items or a clear redirect/summary backed by the same Agenda data.
  - Ensure no parallel scheduling workflow or duplicate operational record is introduced.
  - Validation: open legacy Visits entry and confirm it resolves to Agenda-backed visit data only.

- [x] 7. Final verification and cleanup.
  - Files: all touched Agenda files above.
  - Run targeted tests first, then full project validation command(s) used by the repo.
  - Confirm no create/delete UI, no fake/demo/meta content, and no heavy calendar package was added.
  - Validation: test results recorded for calendar utils, validation rules, access control, pending ordering, and edit flow.
