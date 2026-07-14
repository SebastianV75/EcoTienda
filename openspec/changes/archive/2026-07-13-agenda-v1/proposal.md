# Proposal: EcoTienda Agenda v1

## Intent
Provide EcoTienda staff with a single internal operational agenda to plan and maintain scheduled work without turning the product into a client portal or introducing placeholder content.

## Scope
- Add an internal-only Agenda module.
- Make a hand-rolled monthly calendar the primary view.
- Provide a secondary pending list, ordered by scheduled date.
- Support these item types: `cita`, `visita técnica`, `instalación`, and `recordatorio interno`.
- Allow staff to view agenda items and edit them in v1.
- Persist items in a new `agenda_items` SQL schema/migration file.

## Non-goals
- Client-facing scheduling, booking, or portal access.
- Create/delete workflows beyond what is necessary to establish records outside this first slice.
- Fake/demo records, meta/system/project-note UI, reminders/notifications, recurrence, or a third-party calendar dependency by default.

## Affected areas
- Application shell and mobile navigation: navigation ownership must remain with the existing shell/mobile-nav patterns.
- Agenda route and views: monthly calendar plus pending-by-date list.
- Data access and CRUD conventions: follow the reusable pattern established by the clients module.
- Database: add `agenda_items` persistence.
- Product/route boundary: determine whether the existing `visits` concept remains separate, is surfaced through Agenda, or is progressively consolidated. This decision must prevent duplicate operational records and unclear navigation.

## Product rules
- Agenda is accessible only to EcoTienda staff.
- The calendar is the default entry view; the pending list is secondary.
- Items must expose their type and scheduled date consistently in both views.
- V1 editing must preserve the selected item type and scheduled date without inventing data.

## Risks and mitigations
- **Visits overlap:** unclear ownership could produce duplicate records. Define the relationship and route behavior before implementation.
- **Calendar complexity:** month boundaries, empty days, and mobile layout can create UX defects. Keep the calendar dependency-free and scope interactions to view/edit.
- **Data-model mismatch:** agenda fields may not map cleanly to current visit data. Validate the schema and migration approach against the established client CRUD pattern before coding.

## Rollback
Ship the module as an isolated route and database migration. Rollback removes/hides the Agenda navigation entry and route; database rollback must preserve or safely migrate any operational records according to the project migration policy.

## Success criteria
- Staff can open Agenda from the existing application navigation.
- The default view renders a monthly calendar with real persisted agenda items only.
- Staff can switch to a pending list ordered by scheduled date.
- Staff can view and edit each supported item type.
- Agenda respects internal-only access and does not expose a client scheduling flow.
- The `visits` relationship is explicitly decided and documented before implementation.

## Proposal question round
This lightweight proposal uses the confirmed product direction. Before final implementation planning, validate these business decisions if they remain open:
1. Should an existing `visit` become an Agenda item, remain a linked but separate record, or stay entirely independent?
2. Which staff roles may edit all agenda items, and are there any ownership restrictions?
3. What fields are mandatory for each item type besides date (for example time, client, assignee, address, or notes)?
4. Does “pending” exclude completed/cancelled work, and how are those states recorded in v1?
