# Delta for Agenda

## MODIFIED Requirements

### Requirement: Agenda Is the Workflow Entry Surface

The system MUST present Agenda as the operational intake surface for new `Trabajo` records. Creating or editing Agenda items MUST feel like managing the first stage of a workflow, not a disconnected calendar entry.

#### Scenario: Admin starts work from Agenda

- GIVEN an admin opens `/agenda/new`
- WHEN the create form renders
- THEN the page frames the action as starting a work record
- AND the required fields support the first workflow stage

#### Scenario: Admin edits the intake title

- GIVEN Agenda generates a default work title from intake fields
- WHEN the admin changes intake fields before manually overriding the title
- THEN the generated title updates to match the current intake data
- AND once the admin customizes the title manually, later intake edits do not overwrite that custom title

### Requirement: Agenda Clarifies What Happens Next

Agenda list, detail, and edit surfaces MUST clarify the relationship between intake data, current stage, and the next operational step.

#### Scenario: Admin reviews an Agenda detail

- GIVEN a workflow-backed Agenda item exists
- WHEN the admin opens `/agenda/[id]`
- THEN the screen shows the work as an active stage in the workflow
- AND it clarifies the next operational step after Agenda

#### Scenario: Legacy and workflow-backed items remain understandable

- GIVEN Agenda contains a mix of legacy and workflow-backed items
- WHEN the admin scans the list or opens a detail page
- THEN both record types remain usable
- AND workflow-backed items expose their stage continuity more clearly than legacy records
