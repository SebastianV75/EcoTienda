# Internal Panel Foundation Redesign Design

This design corrects the direction for the authenticated internal shell and `/admin` home. The shell owns navigation. The home is a minimal operational dashboard focused on pending/follow-up, upcoming work, and recent operational activity. Existing authentication, permissions, routes, data reads, and business workflows remain unchanged.

## Decision summary

| Area | Decision |
| --- | --- |
| Scope | Limit changes to the shared authenticated shell, mobile navigation, `/admin` home composition, and small presentation primitives needed by those surfaces. |
| Navigation model | Sidebar and mobile bottom bar own navigation. The home must not duplicate navigation with module-description cards. |
| Home model | Treat `/admin` as a minimal operational dashboard, not a module-first entry grid. |
| Home priorities | Show pending/follow-up, upcoming work, and recent operational activity. |
| Agenda direction | Upcoming work should anticipate Agenda as the future center for appointments such as technical visits, installations, and other appointment types. Until implemented, use elegant empty states only. |
| Existing behavior | Keep current auth guards, role behavior, existing module routes, and business workflows unchanged. |
| Product copy | Remove project-note, system-note, implementation-status, and meta explanatory copy from shell/home UI. |

## Current implementation context

Relevant existing areas:

- `src/components/app-shell.tsx` owns the shared authenticated shell, sidebar navigation, page header, role panel, and mobile navigation mount.
- `src/components/mobile-bottom-navigation.tsx` owns mobile primary and secondary authenticated navigation.
- `src/app/admin/page.tsx` owns the admin home entry and is the primary correction target.
- Existing business routes such as `/admin/documents`, `/admin/quotations`, `/admin/visits`, `/admin/clients`, and `/admin/settings` must remain available through shell navigation.
- `src/features/auth/session.ts` and `src/features/auth/roles.ts` define auth/role behavior and should not be changed for this slice.
- `src/app/globals.css` may receive only minimal visual-support changes if required.

## UX structure

### Authenticated shell

The shell should reinforce that the user is inside EcoTienda's internal workspace and provide stable navigation.

Required shell qualities:

- Clear internal workspace identity in the desktop sidebar and page header.
- Stable access to broader authenticated modules through sidebar/mobile bottom bar.
- Premium operational feel through spacing, hierarchy, surface treatment, and restrained brand color usage.
- No project-status, implementation-phase, or system-note copy.
- Mobile navigation remains clear and route-preserving.

### Internal home dashboard

The `/admin` home should answer: what needs attention, what is coming, and what happened recently. It should not answer: what modules exist? Navigation already answers that.

Recommended home hierarchy:

1. **Operational summary header**
   - Short, user-facing orientation.
   - Avoid explanatory project/system copy.
   - Do not include broad module descriptions.

2. **Pending and follow-up**
   - Shows real pending/follow-up items only if already available from existing behavior.
   - If no source exists, show an elegant empty state.
   - Do not invent counters, tasks, or workflow state.

3. **Upcoming work**
   - Frames future operational scheduling around appointments: technical visits, installations, and other appointment types.
   - Anticipates Agenda as a future operational center.
   - Until Agenda exists, use an empty/unavailable state with no booking/calendar controls.

4. **Recent operational activity**
   - Shows only meaningful operational/customer activity if grounded in existing data.
   - If no reliable source exists, show an empty state or omit the section.
   - Do not include generic system activity or implementation/meta notes.

5. **Contextual actions only**
   - Links may appear when they are contextual to a section, for example a follow-up item leading to its existing route.
   - Do not recreate a navigation card grid for Documents, Quotations, Visits, Clients, Settings, or Agenda.

## Home content rules

### Pending/follow-up

- Prefer honest empty state over fake content.
- Copy should speak about operational follow-up, not implementation status.
- Do not introduce new task management, notifications, permissions, database tables, or background jobs.

### Upcoming work / Agenda anticipation

- Use appointment-oriented language: technical visits, installations, appointments, scheduled operational work.
- Agenda must not appear as an actionable booking/calendar workflow in this slice.
- Do not add a fake Agenda route, fake calendar, fake appointments, technician assignment UI, or request-interest flow.
- If an unavailable state is present, it must be accessible and must not be rendered as an enabled fake link/button.

### Recent activity

- Activity must be operational, not generic system activity.
- Acceptable activity, if already available, should relate to real customers, quotes, visits, documents, or operational work.
- If the existing code does not expose trustworthy activity data, use a concise empty state instead.

## Product copy constraints

Use concise product-facing copy in the existing app language. The copy should feel like an operational tool, not a delivery note.

Disallowed in shell/home product-facing copy:

- Project or system notes, for example `project note`, `system note`, `internal note`, `this area is reserved`.
- Implementation status, for example `pending implementation`, `future module`, `route already exists`, `phase 2`, `phase 3`.
- Redundant module descriptions that explain navigation cards already present in the sidebar/mobile bottom bar.
- Generic system activity feed wording.

Allowed copy direction:

- Operational empty states.
- Pending/follow-up language.
- Appointment and upcoming-work language.
- Recent customer/work activity when real data exists.
- Clear unavailable state for not-yet-implemented Agenda behavior, without meta delivery language.

## Component boundaries

Recommended implementation boundaries:

- Keep `AppShell` as the shared authenticated layout component.
- Keep shell navigation metadata route-preserving.
- Rework `src/app/admin/page.tsx` as the operational-dashboard surface.
- Use local presentation structures for dashboard sections if useful; do not persist them or connect them to new business state.
- Avoid touching auth/session modules, data modules, documents templates, quotation internals, or visit/agenda workflow internals.

Suggested local UI shape:

```ts
type HomeDashboardSection = {
  title: string;
  description?: string;
  emptyState?: string;
  actionHref?: string;
  actionLabel?: string;
};
```

Use this only for presentation. Do not introduce new persisted data or workflow state.

## Data and interaction constraints

- No new database reads or writes unless the data is already safely used by the existing home and remains operationally meaningful.
- No auth or permission changes.
- No change to `requireRole`, `getCurrentUser`, role metadata behavior, or default routes.
- No new Agenda workflow, route, booking action, appointment management, technician assignment, calendar state, notification, or support/request flow.
- No fake counters, fake tasks, fake appointments, or fake recent activity.
- Contextual links must use existing routes and preserve current route behavior.
- Empty and unavailable states must be accessible to keyboard and screen-reader users.
- Keep print-specific behavior unaffected by shell changes.

## Likely file changes

Expected implementation files:

- `src/app/admin/page.tsx` — replace redundant module-first cards with pending/follow-up, upcoming work, and recent operational activity sections using honest empty states where needed.
- `src/components/app-shell.tsx` — preserve already-correct shell/navigation direction and remove any remaining project/system/meta copy if present.
- `src/components/mobile-bottom-navigation.tsx` — adjust only if needed to keep mobile navigation route-preserving and clearly separate from home content.
- `src/app/globals.css` — optional, only for minimal visual support required by shell/home surfaces.

Files to avoid unless a task later proves a narrow need:

- `src/features/auth/session.ts`
- `src/features/auth/roles.ts`
- document preview/generation feature files
- quotation implementation internals
- visit/agenda workflow internals
- new Agenda data/workflow files

## Testing and verification strategy

Available project scripts currently include `npm run lint`; no dedicated unit, component, or E2E test script is present in `package.json`.

Implementation should verify:

- `npm run lint` passes.
- `/admin` renders for the existing authenticated admin path without changing auth behavior.
- The shell/sidebar/mobile bottom bar remain the primary navigation mechanisms.
- The home does not contain a redundant module navigation grid or repeated module-description cards.
- The home presents pending/follow-up, upcoming work, and recent operational activity or honest empty states.
- Upcoming work anticipates Agenda appointment types without exposing booking/calendar functionality.
- Recent activity, if shown, is operational and not generic system activity.
- Product-facing shell/home copy contains no project-note, system-note, implementation-status, or meta explanatory wording.
- Existing routes and business behavior remain unchanged.

## Rollout and rollback

Rollout should be one bounded UI correction touching only the authenticated shell/navigation surfaces and `/admin` home. It can be released without data migration because it changes presentation and hierarchy only.

Rollback is straightforward:

- Revert the shell/home UI files from the implementation PR.
- Existing module routes, auth behavior, data access, and business workflows should continue to work.
- Agenda-aware empty states can be removed without affecting any unimplemented workflow.

## Requirement traceability

| Requirement | Design coverage |
| --- | --- |
| Authenticated foundation scope | Limits changes to shell, mobile navigation, `/admin` home, and minimal styling primitives. |
| Shell-owned navigation | Keeps navigation in sidebar/mobile bottom bar and prohibits home navigation duplication. |
| Minimal operational dashboard home | Defines dashboard sections instead of module cards. |
| Pending and follow-up section | Requires real data or honest empty state. |
| Upcoming work anticipates Agenda | Frames appointment-oriented empty state without implementing Agenda. |
| Recent operational activity only | Allows real operational activity only; rejects generic system activity. |
| Product-facing copy discipline | Defines disallowed meta/system/project copy and allowed operational copy direction. |
| Existing business behavior preserved | Prohibits auth, permission, database, and workflow changes. |
