# Apply Progress: EcoTienda Agenda v1

## Status

Slices 1, 2, and 3 are now implemented. Agenda already has persistence/data, route/navigation, monthly calendar + pending list, detail view, admin-only edit flow, and a visits page backed by the same Agenda data. Focused tests and final verification evidence still remain pending.

## Completed work

- [x] Established `agenda_items` SQL schema with indexes, update timestamp trigger, and RLS for staff read/admin update.
- [x] Added shared Agenda TypeScript types and UI label maps.
- [x] Added calendar utility functions for month parsing, month range calculation, 42-cell month grid generation, month heading/shift helpers, and grouping agenda items by date.
- [x] Added server-side data queries for monthly items, pending items, single-item lookup, and visit-type lookups.
- [x] Added admin-only update action with required-field validation, role enforcement, and route revalidation.
- [x] Added `/agenda` route with internal-staff access.
- [x] Added Agenda to desktop and mobile navigation with role-aware behavior.
- [x] Added the first monthly calendar UI and pending list UI with real persisted data only.
- [x] Added agenda detail page for internal staff.
- [x] Added agenda edit page and form restricted to admins.
- [x] Repointed legacy visits page to Agenda-backed visit records without creating a duplicate scheduling flow.
- [x] Ran `npm run lint`.

## Work Unit Evidence

| Evidence | Result |
|----------|--------|
| Detail route | `src/app/agenda/[id]/page.tsx` created |
| Edit route | `src/app/agenda/[id]/edit/page.tsx` created |
| Detail component | `src/features/agenda/agenda-item-detail.tsx` created |
| Edit form | `src/features/agenda/agenda-item-form.tsx` created |
| Visits linkage | `src/app/admin/visits/page.tsx` now reads Agenda-backed visit items |
| Security hardening | `updateAgendaItemAction` now enforces admin role before update |
| Validation command | `npm run lint` — pass |

## Files changed

| File | Change |
|------|--------|
| `src/app/agenda/[id]/page.tsx` | Added Agenda item detail route for internal staff. |
| `src/app/agenda/[id]/edit/page.tsx` | Added admin-only Agenda edit route. |
| `src/features/agenda/agenda-item-detail.tsx` | Added detailed operational item view. |
| `src/features/agenda/agenda-item-form.tsx` | Added Agenda edit form backed by server action. |
| `src/features/agenda/actions.ts` | Added admin role enforcement for updates. |
| `src/features/agenda/data.ts` | Added Agenda query by type for visits linkage. |
| `src/features/agenda/agenda-item-card.tsx` | Added navigable Agenda cards. |
| `src/features/agenda/agenda-calendar.tsx` | Reused detail links from desktop calendar cards and mobile-optimized month view. |
| `src/features/agenda/agenda-pending-list.tsx` | Linked pending items to detail pages. |
| `src/app/admin/visits/page.tsx` | Replaced placeholder with Agenda-backed visits summary/list. |
| `openspec/changes/agenda-v1/tasks.md` | Recorded completion of tasks 5 and 6. |
| `openspec/changes/agenda-v1/apply-progress.md` | Updated progress and evidence. |

## Notes

- `openspec/changes/agenda-v1/verify-report.md` now records final manual acceptance backed by `npm run lint` and `npm run build`.
- Focused automated checks for date helpers and validation behavior remain recommended future hardening work, but they are no longer blockers for Agenda v1 closure.
- The visits page now depends on Agenda as the single source of truth instead of a parallel placeholder workflow.

## Remaining tasks

- None for Agenda v1. Future hardening can add focused automated tests for calendar/data validation if the module grows.
