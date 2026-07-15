# Agenda v1 Specification

## Purpose

Define the internal operational agenda for EcoTienda staff with a monthly calendar as the main planning view and a pending-by-date list as a secondary view, without introducing duplicate operational records or non-real placeholder content.

## Requirements

### Requirement: Internal-only access

The system MUST expose Agenda v1 only to authenticated internal EcoTienda staff and MUST NOT expose any client-facing scheduling or booking flow.

#### Scenario: Internal staff can access Agenda

- GIVEN an authenticated internal EcoTienda staff member
- WHEN the user navigates to Agenda
- THEN the system allows access to Agenda v1

#### Scenario: Client-facing scheduling is excluded

- GIVEN a non-staff or client-facing context
- WHEN Agenda-related functionality is evaluated
- THEN the system does not expose Agenda v1 as a client scheduling surface

### Requirement: Primary monthly calendar view

The system MUST present a monthly calendar as the default Agenda view and MUST show real persisted agenda items in their scheduled date context.

#### Scenario: Agenda opens in monthly view

- GIVEN a staff user opens Agenda
- WHEN the initial view is rendered
- THEN the monthly calendar is shown as the default view

#### Scenario: Calendar shows persisted items only

- GIVEN agenda items exist for dates in the selected month
- WHEN the monthly calendar is displayed
- THEN the calendar shows those real persisted items
- AND the calendar does not show fake, demo, or placeholder records

### Requirement: Secondary pending list

The system MUST provide a secondary pending list view ordered by scheduled date and limited to items in the `pendiente` state.

#### Scenario: Pending list is ordered by date

- GIVEN multiple pending agenda items with different scheduled dates
- WHEN the staff user opens the pending list
- THEN the items are shown ordered by scheduled date

#### Scenario: Non-pending items are excluded from pending list

- GIVEN agenda items in `pendiente`, `en proceso`, and `finalizado` states
- WHEN the staff user opens the pending list
- THEN only items in `pendiente` are included

### Requirement: Supported item types

The system MUST support agenda items of type `cita`, `visita técnica`, `instalación`, and `recordatorio interno`.

#### Scenario: Supported types are represented consistently

- GIVEN agenda items of each supported type exist
- WHEN they are shown in Agenda views
- THEN each item displays its configured type consistently in the monthly calendar and pending list

### Requirement: Minimum required fields

Each agenda item MUST require `fecha`, `título`, and `tipo` to be considered valid.

#### Scenario: Item with minimum fields is valid

- GIVEN an agenda item has `fecha`, `título`, and `tipo`
- WHEN the item is created or edited
- THEN the system accepts it as meeting the minimum required data

#### Scenario: Missing required field is rejected

- GIVEN an agenda item is missing `fecha`, `título`, or `tipo`
- WHEN the item is created or edited
- THEN the system does not accept it as valid

### Requirement: Agenda item lifecycle states

The system MUST support the states `pendiente`, `en proceso`, and `finalizado` for agenda items.

#### Scenario: Agenda item state is represented

- GIVEN an agenda item exists in one of the supported states
- WHEN the item is shown or updated in Agenda
- THEN the state remains one of `pendiente`, `en proceso`, or `finalizado`

### Requirement: Admin-only editing in v1

The system MUST allow viewing by internal staff, but MUST restrict Agenda item editing in v1 to admin users only.

#### Scenario: Admin can edit an agenda item

- GIVEN an admin user opens an existing agenda item
- WHEN the admin updates allowed agenda data
- THEN the system accepts the edit

#### Scenario: Non-admin cannot edit an agenda item

- GIVEN a non-admin staff user opens an existing agenda item
- WHEN the user attempts to edit the item
- THEN the system does not allow the edit

### Requirement: Visits remain linked, not duplicated

The system MUST keep Agenda and visits connected such that Agenda references or summarizes visit information when relevant, and MUST NOT create a duplicate operational record solely because the item appears in Agenda.

#### Scenario: Visit-linked agenda item avoids duplicate records

- GIVEN a scheduled visit is represented in Agenda
- WHEN staff view the agenda entry
- THEN Agenda references or summarizes the visit context
- AND the system does not treat Agenda as a separate duplicate operational record for the same work

### Requirement: No meta or fake-content UI

The system MUST NOT present fake/demo data, meta/system/project-note UI, or other non-operational placeholder content within Agenda v1.

#### Scenario: Agenda renders only operational content

- GIVEN Agenda v1 is displayed
- WHEN staff review the available items and views
- THEN the visible content is limited to real operational agenda data and relevant Agenda controls
- AND no fake data or meta/system/project-note UI is shown
