# Internal panel foundation redesign — authenticated shell and operational home

Redesign the authenticated internal panel foundation so the shell owns navigation and the `/admin` home becomes a minimal operational dashboard. This is a bounded post-login slice: it improves orientation, removes redundant explanatory/module cards, and keeps existing auth, routes, permissions, and business behavior unchanged.

## Business problem

The current internal home repeats navigation that already belongs to the sidebar and mobile bottom bar. It also contains explanatory/project-style blocks and repeated module descriptions that make the product feel like a system note instead of a working operational surface.

Authenticated users need the opposite: a simple home that helps them understand what needs attention now, what is coming next, and what changed recently, without pretending future workflows already exist.

## Confirmed product direction

- The shell/sidebar/mobile bottom bar own navigation.
- The home MUST NOT duplicate the navigation hierarchy with repeated module-description cards.
- Product-facing UI MUST remove project-note, system-note, implementation-status, and meta explanatory copy.
- The home should be useful, simple, minimal, and operational.
- Priority home information is pending/follow-up work, upcoming work, and recent operational activity.
- Upcoming/pending work should anticipate Agenda as a future operational center for appointments such as technical visits, installations, and other appointment types.
- Because Agenda is not implemented yet, the home should use elegant empty states instead of fake functionality.
- Existing business behavior, auth, routes, and permissions remain unchanged.

## Target users and situations

- Authenticated operational users arriving after sign-in and needing a quick read of current work.
- Teams tracking pending follow-up, upcoming appointments, and recent operational movement.
- Users who rely on the sidebar or mobile bottom bar to move to Documents/Downloads, Quotations, Visits, Clients, Settings, and future Agenda workflows.
- Stakeholders expecting the internal product to feel like an operational tool, not a project status board.

## Current-state gap

- The home repeats navigation that already exists in shell-level navigation.
- Explanatory cards and module descriptions create noise rather than operational value.
- Project/system/meta copy appears in product-facing surfaces and must be removed.
- Agenda-related future work needs to be acknowledged through empty states, not simulated controls or fake scheduling behavior.

## Product outcome

After this slice, authenticated users should enter a calm operational dashboard. The shell provides orientation and navigation; the home provides a concise operational snapshot:

1. **Pending and follow-up** — what needs attention, or an elegant empty state when no source exists yet.
2. **Upcoming work** — future appointments and scheduled operational work, explicitly shaped for Agenda's eventual role.
3. **Recent operational activity** — recent customer/work changes only when grounded in existing operational data; no generic system activity feed.

The dashboard may link to existing modules only when the link is a contextual action for the operational section. It must not become another navigation grid.

## In scope

- Authenticated shell/sidebar/mobile navigation clarity and visual refinement, preserving existing destinations.
- `/admin` home redesign from module-first entry surface to minimal operational dashboard.
- Removal of redundant home navigation cards and repeated module descriptions.
- Removal of project-note, system-note, meta, and implementation-status copy from shell/home UI.
- Operational dashboard sections for pending/follow-up, upcoming work, and recent operational activity.
- Agenda-aware empty states for future appointments such as technical visits, installations, and other appointment types.
- Minimal visual adjustments directly needed by the shell and home.

## Non-goals

- No landing page or sign-in redesign.
- No end-to-end redesign of every internal module or workflow.
- No change to auth, roles, permissions, data models, or existing business behavior.
- No implementation of Agenda calendar, booking, technical-visit, installation, appointment, or technician-assignment workflows.
- No fake activity, fake appointments, placeholder counters, or simulated functionality.
- No generic system activity feed.
- No duplicated navigation grid on the home.

## Affected areas

Implementation should remain focused on authenticated entry surfaces:

- Shared authenticated layout/shell, including sidebar and page frame.
- Mobile bottom navigation, only to preserve route clarity and avoid duplication with home content.
- `/admin` home composition.
- Small shared styling primitives only if required by these surfaces.

## Business rules and constraints

- Preserve existing business flows and access behavior.
- Keep navigation in shell/sidebar/mobile bottom bar, not repeated as home content.
- Use home content only for operational status, not module advertising.
- If operational data is unavailable, show polished empty states rather than fake values.
- Upcoming work must anticipate Agenda without presenting Agenda as implemented.
- Recent activity must be operationally meaningful; do not include generic system/meta activity.
- Keep the slice small and reviewer-friendly.

## Risks and tradeoffs

- Without real Agenda data, empty states can feel too sparse; the copy and layout must make the absence useful and honest.
- Removing module cards may reduce perceived shortcuts, so shell navigation must remain clear and reliable.
- Recent activity can become generic noise if not grounded in operational data; prefer empty state or omission over fake/system activity.
- Visual polish can drift into decoration; operational usefulness remains the governing priority.

## Rollback

Rollback is straightforward because this slice is presentation/navigation-surface only:

- Revert the shell/home UI files from the implementation PR.
- Existing module routes, auth behavior, data access, and business workflows should continue to work.
- Remove Agenda-aware empty states without affecting any unimplemented workflow.

## Success criteria

- [ ] The proposal confines work to the authenticated shell and `/admin` home.
- [ ] The shell/sidebar/mobile bottom bar own navigation.
- [ ] The home does not repeat navigation or show module-description card grids.
- [ ] The home focuses on pending/follow-up, upcoming work, and recent operational activity.
- [ ] Agenda is anticipated through appointment-oriented empty states without fake functionality.
- [ ] Product-facing copy contains no project-note, system-note, implementation-status, or meta explanatory language.
- [ ] Existing business behavior, auth, routes, and permissions remain unchanged.
