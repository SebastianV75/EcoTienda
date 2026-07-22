# Design: Workflow Core Redesign

## Technical Approach

Reshape the workflow-core surfaces around one admin mental model: active `Trabajo` records move through visible stages, each screen clarifies what is happening now, and the most useful unblock action is easy to reach. The redesign stays inside the existing workflow model and business rules. It changes hierarchy, navigation emphasis, component structure, and page density rather than introducing a new domain model.

The design direction is operational and sober:

- fewer competing cards and boxed sections
- one dominant purpose per screen
- workflow continuity across Admin, Agenda, and Visits
- secondary modules remain accessible but visually subordinate
- anti-slop rules apply to every workflow-core screen

## Architecture Decisions

| Decision | Options | Choice | Rationale |
| --- | --- | --- | --- |
| Workflow framing | Keep module-first home vs workflow-first board | Workflow-first board | The admin's primary need is active work and unblock actions, not module browsing. |
| Redesign scope | Cosmetic polish vs structural hierarchy change | Structural hierarchy change | The current pain is fragmentation and unclear next steps, not only styling. |
| Shared visual system | Independent page styling vs one workflow-core system | One workflow-core system | Admin, Agenda, and Visits must feel like one tool. |
| Navigation emphasis | Equal-weight modules vs workflow-priority routes | Workflow-priority routes | Navigation should reinforce continuity from intake to next stage. |
| Implementation strategy | One large pass vs staged slices | Staged slices | Keeps review size under control and lets hierarchy improve incrementally. |
| UI expression | Marketing-style premium vs sober operational | Sober operational | Matches the user's stated direction and avoids anti-slop violations. |

## Screen Model

### `/admin`

Role: operational board.

Primary content:

1. active work queue
2. current stage visibility
3. unblock / continue actions

Secondary content:

1. compact workflow summary
2. compact route/module access
3. low-priority informational content

Remove or reduce:

- large equal-weight section stacking
- decorative cards that compete with active work
- repeated headings that restate obvious structure

### `/agenda`

Role: intake and first-stage work management.

Primary content:

1. work entries in agenda stage
2. clear stage/status cues
3. next-step path toward visit capture

Secondary content:

1. legacy compatibility hints only where needed
2. low-noise supporting metadata

### `/agenda/new` and `/agenda/[id]/edit`

Role: start or adjust a work intake.

Primary content:

1. the intake form itself
2. generated/editable work title
3. concise explanation of what this creates or updates

Design rule:

- forms should read as one task surface, not a stack of unrelated form cards
- supporting text must explain workflow consequence, not generic prose

### `/agenda/[id]`

Role: current-stage detail with next-step clarity.

Primary content:

1. work identity
2. current stage state
3. next operational action

Secondary content:

1. intake details
2. legacy or supporting context

### `/admin/visits`

Role: visit-stage worklist.

Primary content:

1. visit-ready or visit-in-progress work
2. stage progress cues
3. direct path into the selected visit record

### `/admin/visits/[trabajoId]`

Role: focused visit completion surface.

Primary content:

1. visit form
2. blocking/completion conditions
3. next stage after successful visit

Design rule:

- form completion logic is more important than decorative grouping

## Shared UX Rules

### Hierarchy

Every workflow-core screen must answer, in this order:

1. what work is this?
2. what stage is it in?
3. what should the admin do next?
4. what context supports that action?

### Navigation

Shared navigation must make these routes feel connected:

- `/admin`
- `/agenda`
- `/admin/visits`

The system should emphasize workflow surfaces before secondary module destinations. The active state must confirm the current workflow surface clearly.

### Visual Weight

Use a three-level weight model only:

1. primary workflow block
2. supporting context
3. background utility/navigation

If two sections compete for level 1 on the same screen, the screen is overbuilt.

### Anti-Slop Rules Applied

For workflow-core surfaces:

- avoid generic SaaS block stacking
- avoid equal-weight card grids as the default page structure
- avoid decorative pills, glows, fake product-marketing patterns, and filler CTA pairings
- avoid excess headings, labels, and section wrappers that only add noise
- keep text close to action and keep each page's first screenful composed around one purpose

## Component Strategy

| Component | Direction |
| --- | --- |
| `AppShell` | Keep as shell foundation, but tune workflow pages so navigation and page titles support workflow continuity. |
| Dashboard active list | Evolve into the dominant board element on `/admin`; add clearer next-step affordances without expanding into noisy detail cards. |
| Workflow summary blocks | Compress them into secondary context instead of hero-level sections. |
| Agenda forms | Keep one continuous task surface with concise stage-aware copy. |
| Visit form | Keep as a focused data-entry surface with explicit completion and blocking cues. |
| Shared stage cues | Reuse one restrained visual language for stage and progress context across Admin, Agenda, and Visits. |

## File Changes

| File | Action | Description |
| --- | --- | --- |
| `openspec/changes/workflow-core-redesign/design.md` | Create | This design artifact. |
| `src/app/admin/page.tsx` | Modify | Rebuild hierarchy so active work and unblock actions dominate the first screenful. |
| `src/components/app-shell.tsx` | Modify | Tighten workflow-page framing and page-title/navigation behavior where needed. |
| `src/components/mobile-bottom-navigation.tsx` | Modify | Reorder/emphasize workflow routes so mobile navigation reinforces continuity. |
| `src/app/agenda/page.tsx` | Modify | Reframe Agenda list as workflow intake and stage management. |
| `src/app/agenda/new/page.tsx` | Modify | Make intake creation read as starting work, with cleaner workflow-focused framing. |
| `src/app/agenda/[id]/page.tsx` | Modify | Clarify current stage and next action. |
| `src/app/agenda/[id]/edit/page.tsx` | Modify | Keep edit flow aligned with intake-stage mental model. |
| `src/features/agenda/agenda-item-form.tsx` | Modify | Keep a single sober form surface, remove extra visual noise, and preserve reactive title behavior. |
| `src/app/admin/visits/page.tsx` | Modify | Present visit-stage work as workflow continuation, not a detached list module. |
| `src/app/admin/visits/[trabajoId]/page.tsx` | Modify | Make the visit page a focused stage-completion surface. |
| `src/features/trabajos/dashboard-active-list.tsx` | Modify | Strengthen operational hierarchy and next-step clarity without adding noisy detail. |
| `src/features/trabajos/dashboard-route-line.tsx` | Modify | Keep route context restrained and subordinate to the current stage/action. |

## Implementation Slices

### Slice 1: Admin board + shared navigation

Files:

- `src/app/admin/page.tsx`
- `src/components/app-shell.tsx`
- `src/components/mobile-bottom-navigation.tsx`
- `src/features/trabajos/dashboard-active-list.tsx`
- `src/features/trabajos/dashboard-route-line.tsx`

Goal:

- make `/admin` unmistakably operational
- reduce modular noise
- align shared navigation with workflow-first behavior

### Slice 2: Agenda surfaces

Files:

- `src/app/agenda/page.tsx`
- `src/app/agenda/new/page.tsx`
- `src/app/agenda/[id]/page.tsx`
- `src/app/agenda/[id]/edit/page.tsx`
- `src/features/agenda/agenda-item-form.tsx`

Goal:

- make Agenda the intake stage of a work record
- clarify what happens next after intake
- keep create/edit/detail visually and conceptually aligned

### Slice 3: Visits continuity

Files:

- `src/app/admin/visits/page.tsx`
- `src/app/admin/visits/[trabajoId]/page.tsx`

Goal:

- make Visits read as the next stage of the same work
- reduce noise around the form and completion logic

### Slice 4: Cross-surface consistency pass

Files:

- only workflow-core files changed in earlier slices

Goal:

- align spacing, hierarchy, stage cues, button language, and supporting copy
- remove leftover modular artifacts that survived the earlier slices

## Testing Strategy

| Layer | What to Test | Approach |
| --- | --- | --- |
| Static | Layout hierarchy, route emphasis, copy purpose, component simplification | Code review against spec/design plus `npm run lint` and `npm run build`. |
| Runtime manual | Admin-first scan flow, active-work priority, Agenda intake clarity, Visits continuation, mobile navigation emphasis | Manual walkthrough on workflow-core routes with mobile and desktop checks. |
| Regression | Existing workflow behavior and stage progression still function | Focused smoke checks on create/edit/detail flows and visit progression routes. |

## Review Workload Forecast

This redesign is too large for one review-safe change. Plan for chained slices under the 400-line review budget, starting with Admin + navigation, then Agenda, then Visits.

## Open Questions

- [ ] None blocking for design. The remaining work is to translate this hierarchy into tasks and implementation slices.
