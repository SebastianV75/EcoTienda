# Apply Progress: Workflow Core Redesign

## Slice 1 complete

### Completed tasks

- [x] 1.1 Restructure `src/app/admin/page.tsx` so the first screenful is dominated by active work and unblock actions, with summaries and module access clearly secondary.
- [x] 1.2 Update `src/features/trabajos/dashboard-active-list.tsx` to strengthen operational hierarchy, keep item content compact, and expose the most useful next-step affordance without adding noisy payload details.
- [x] 1.3 Tune `src/features/trabajos/dashboard-route-line.tsx` so route context stays visually subordinate to the current stage/action.
- [x] 1.4 Adjust `src/components/app-shell.tsx` and `src/components/mobile-bottom-navigation.tsx` so workflow surfaces are emphasized over secondary modules and active state continuity is clear.

### Files changed

- `src/app/admin/page.tsx`
- `src/components/app-shell.tsx`
- `src/components/mobile-bottom-navigation.tsx`
- `src/features/trabajos/dashboard-active-list.tsx`
- `src/features/trabajos/dashboard-route-line.tsx`
- `openspec/changes/workflow-core-redesign/tasks.md`

### Key hierarchy decisions

- `/admin` now opens on the active-work board, with supporting stats and secondary links pushed below it.
- Active work rows now expose a compact next-step action, while the stage route line stays visually quiet.
- Shared navigation now leads with workflow surfaces: Tablero, Agenda, Visitas.
- Secondary modules remain available, but they are grouped separately and visually subdued.

### Test commands run

- `npm run lint`
- `npm run build`

### Test results

- Lint passed.
- Build passed.
- Next.js production build completed successfully and preserved existing routes.

### Deviations from design

- Desktop shell navigation remains route-order based rather than path-highlighted, to keep the slice small and avoid widening scope.
- `/admin` secondary context is now compact, but still intentionally present to preserve existing module access.

## Slice 2 complete

### Completed tasks

- [x] 2.1 Update `src/app/agenda/page.tsx` so workflow-backed agenda work reads as intake-stage work management rather than a disconnected module list.
- [x] 2.2 Update `src/app/agenda/new/page.tsx` and `src/features/agenda/agenda-item-form.tsx` so the create flow reads as starting a `Trabajo`, keeps one sober task surface, and preserves the reactive title behavior.
- [x] 2.3 Update `src/app/agenda/[id]/page.tsx` to clarify current stage, next action, and workflow continuity for workflow-backed records while keeping legacy records understandable.
- [x] 2.4 Update `src/app/agenda/[id]/edit/page.tsx` so edit framing matches the intake-stage mental model instead of a generic record editor.

### Files changed

- `src/app/agenda/page.tsx`
- `src/app/agenda/new/page.tsx`
- `src/app/agenda/[id]/page.tsx`
- `src/app/agenda/[id]/edit/page.tsx`
- `src/features/agenda/agenda-item-form.tsx`
- `src/features/agenda/actions.ts`
- `src/features/agenda/agenda-calendar.tsx`
- `src/features/agenda/agenda-calendar-section.tsx`
- `src/features/agenda/agenda-delete-button.tsx`
- `src/features/agenda/agenda-item-peek.tsx`
- `src/features/agenda/agenda-pending-list.tsx`
- `openspec/changes/workflow-core-redesign/tasks.md`

### Key hierarchy decisions

- `/agenda` shifted to a calendar-first workflow view with lighter supporting structure.
- The mobile calendar now uses square day cells with dot-based workload signaling and day-level preview.
- Agenda detail/edit/create continue to frame records as Trabajo intake while preserving legacy readability.
- Desktop agenda selection now opens a right-side panel instead of redirecting immediately to detail.

### Test commands run

- `npm run lint`
- `npm run build`

### Test results

- Lint passed.
- Build passed.
- Next.js production build completed successfully and preserved existing routes.

### Deviations from design

- The detail page keeps the existing lower-level agenda detail component in place and adds stage framing above it instead of redesigning that component.
- Agenda accumulated more polish work than originally forecast because mobile and desktop calendar behavior needed correction after initial slice delivery.

## Slice 3 complete

### Completed tasks

- [x] 3.1 Update `src/app/admin/visits/page.tsx` so visit-stage work is organized around operational progress and visually matches the workflow-first hierarchy used on `/admin`.
- [x] 3.2 Update `src/app/admin/visits/[trabajoId]/page.tsx` so the visit page frames the form as the current work stage and makes the post-visit next step understandable.
- [x] 3.3 Reduce ornamental layout and supporting noise around visit completion so field requirements and blocking conditions stay primary.

### Files changed

- `src/app/admin/visits/page.tsx`
- `src/app/admin/visits/[trabajoId]/page.tsx`
- `src/features/trabajos/visita-form.tsx`

### Key hierarchy decisions

- Visits now reads as the next operational stage after Agenda instead of a detached module.
- The current stage, next step, and capture blockers are surfaced before the form body.
- Visit work is ordered by operational progress so in-flight work stays first.

### Test commands run

- `npm run lint`
- `npm run build`

### Test results

- Lint passed.
- Build passed.
- Next.js production build completed successfully and preserved existing routes.

## Slice 4 complete

### Completed tasks

- [x] 4.1 Align workflow-core spacing, titles, labels, button language, and support copy so Admin, Agenda, and Visits read as one product surface.
- [x] 4.2 Remove leftover equal-weight cards, repeated headings, or modular wrappers that survived earlier slices and still violate the anti-slop direction.
- [x] 4.3 Re-check every changed workflow-core screen against `slop.md` and fix any remaining UI patterns that conflict with the sober operational direction.

### Files changed

- `src/app/admin/page.tsx`
- `src/app/agenda/page.tsx`
- `src/app/admin/visits/page.tsx`

### Key hierarchy decisions

- Admin summary cards were replaced with a compact status strip so the board reads as one operational block.
- Agenda, Admin, and Visits now share tighter spacing, shorter operational copy, and consistent button language.
- Remaining workflow-core wrappers were reduced where they competed with the primary work surface.

### Test commands run

- `npm run lint`
- `npm run build`

### Test results

- Lint passed.
- Build passed.
- Next.js production build completed successfully and preserved existing routes.

## Final verification complete

### Completed tasks

- [x] 5.1 Run `npm run lint` and `npm run build` after each slice; fix regressions before starting the next slice.
- [x] 5.2 Manual `/admin` check on mobile and desktop: active work dominates the first screenful, secondary modules feel subordinate, and workflow navigation priority is clear.
- [x] 5.3 Manual Agenda check: list/create/detail/edit all read as stage-one workflow surfaces, and next-step continuity toward Visits is understandable.
- [x] 5.4 Manual Visits check: the worklist and detail page read as continuation from Agenda, and completion requirements are clearer than decorative structure.
- [x] 5.5 Manual cross-surface check: Admin -> Agenda -> Visits feels like one tool instead of separate modules.

### Verification evidence

- `npm run lint` passed on the final integrated state.
- `npm run build` passed on the final integrated state.
- User-reviewed visual passes drove the final Admin and Agenda polish loops, including sidebar motion, agenda density, mobile calendar behavior, and desktop side-panel behavior.
- Final user confirmation: the desktop agenda side panel layout and mobile calendar interaction were accepted as complete.

### Residual risks

- No blocking implementation risks remain for `workflow-core-redesign`.
- The next OpenSpec lifecycle step is archival/sync closure, not more UI implementation.
