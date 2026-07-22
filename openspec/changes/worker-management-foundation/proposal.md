# Worker management foundation

Replace free-text technician assignment with a real internal worker model, while keeping legacy client-backed document flows intact for now.

## Intent

The current workflow already depends on assigning technical work to someone, but that assignment is still stored as plain text (`assignee_name`). That breaks the operational path we actually need: admins should assign visits and installations to real internal workers, and technicians should later see only the work assigned to them in their app.

This change creates the foundation for that flow by introducing internal worker management and making assignment real at the Agenda/Trabajo start of the workflow.

## Scope

- Add an internal worker model for company staff.
- Support worker records for admins, technicians, and other internal roles.
- Allow optional linking between a worker and an auth user.
- Replace free-text technical assignment in the workflow start with real worker selection.
- Make the assignment live at the Agenda stage as the operational source for the first slice.
- Prepare the data model needed for the technician app to later show assigned work.

## Out of scope

- Rebuilding the full technician app in this slice.
- Removing legacy `clients` from documents or older flows.
- Refactoring legacy `projects` and other client-coupled areas.
- Migrating all quotation or document workflows to workers.
- Advanced scheduling, dispatch, routing, or availability logic.

## Product rules

| Rule | Decision |
| --- | --- |
| Worker catalog | Store all internal staff, not only technicians. |
| Roles | Workers may represent `admin`, `technician`, or other internal roles. |
| Auth link | A worker may exist without a linked login at first. |
| Assignment source | Real assignment lives in the Agenda-stage start of the workflow for this slice. |
| Technician app direction | The next slice should open with assigned jobs first, not a calendar-heavy view. |
| Legacy safety | `clients` remain available for document/legacy areas until a later migration. |

## Problem

Today the app can capture that a job was assigned, but only as a manually typed name. That causes several product problems:

1. admins cannot reliably assign work to a real internal person
2. names can drift, duplicate, or be misspelled
3. there is no trustworthy link from assigned work to a technician login
4. the technician app cannot safely show “my assigned jobs” from a text field
5. future reporting and operational follow-up stay fragile

## Users and timing

### Admins
Need to manage internal workers and assign technical work during work creation/editing.

### Technicians
Will need the resulting assignments in the next slice so they can open only the jobs/forms assigned to them.

### When this matters
Immediately when a new `Trabajo` is created and a technical visit or later installation needs an owner.

## First slice

The first deliverable should focus on the smallest useful foundation:

1. internal worker records exist
2. admins can manage them
3. Agenda/Trabajo assignment uses worker selection instead of free text
4. the resulting data is ready for technician-facing “assigned jobs” later

## Affected areas

- Worker data model and admin CRUD.
- Agenda create/edit assignment flow.
- Trabajo agenda-stage assignment persistence.
- Workflow validation rules that currently require only a free-text assignee.
- Future technician-app assignment lookup path.

## Non-goals for this slice

- Do not remove `clients` from documents yet.
- Do not migrate legacy `projects`.
- Do not redesign the whole technician UX yet.
- Do not add route optimization or dispatch planning.
- Do not require every worker to have auth from day one.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Refactor grows into a repo-wide client removal | Keep `clients` for documents and legacy flows; scope only Agenda/Trabajo worker assignment now. |
| Worker/auth linking blocks operations | Make auth linking optional in this slice so admin setup can start immediately. |
| Assignment data ends up duplicated across too many tables | Keep Agenda-stage assignment as the operational source for the first slice. |
| Technician app expectations creep into this slice | Limit this change to the worker foundation and assignment replacement only. |
| Existing free-text records become ambiguous | Preserve legacy readability while using real worker assignment for new or edited workflow records. |

## Rollback

The change can be rolled back by hiding worker-management entry points and restoring free-text assignment in the Agenda/Trabajo start flow. Legacy client-backed and text-based records remain understandable during rollback because this slice is additive in intent.

## Success criteria

- Admins can create and manage internal workers.
- Workers can represent technicians and other internal roles.
- Worker records may optionally link to auth users.
- New or edited workflow assignments use a real worker selection instead of free text.
- The stored assignment is ready to power a later technician “assigned jobs” view.
- Legacy client/document flows continue working during this phase.

## Next step

Translate this proposal into requirements for worker records, assignment behavior, and the first admin-facing management slice.
