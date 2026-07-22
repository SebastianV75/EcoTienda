# Workflow Model Specification

## Requirements

### Requirement: Trabajo Lifecycle

`Trabajo` MUST be the durable record for one engagement. It MUST accumulate stage data in this order: Agenda, Visita, Cotización, Venta, Descargables. Installation MUST NOT be a stage.

#### Scenario: New work starts in Agenda

- GIVEN staff need to schedule work
- WHEN they create an Agenda entry
- THEN the system creates a `Trabajo` at the Agenda stage

#### Scenario: Installation is unavailable

- GIVEN a `Trabajo` is in any supported stage
- WHEN staff view available next stages
- THEN Installation is not offered

### Requirement: Agenda Intake Shell

Agenda MUST create an appointment shell, not a master-client record. It MUST require hour, georeferenced address, work type, assignee, note, and phone. Client/contact MUST be free text and MUST NOT require a master client.

#### Scenario: Intake without a master client

- GIVEN required Agenda values and free-text contact details
- WHEN they save the appointment
- THEN a `Trabajo` is created without a master-client requirement

#### Scenario: Missing required Agenda data

- GIVEN a required Agenda value is omitted
- WHEN they attempt to save
- THEN creation is rejected and the missing value is identified

### Requirement: Ordered Stage Advancement

The system MUST prevent advancement until the current stage is complete. A stage is complete only when its required data is recorded; later data MUST NOT satisfy it.

#### Scenario: Advance after completion

- GIVEN a complete Visita
- WHEN staff advance it
- THEN Cotización is available

#### Scenario: Advance is blocked

- GIVEN an incomplete Visita
- WHEN staff attempt to start Cotización
- THEN advancement is blocked and Visita is identified as incomplete

### Requirement: Technical Visit Survey

Visita MUST own field evidence that validates and enriches Agenda. It MUST record the execution date and these groups:

| Group | Required captured subject |
|---|---|
| Contact/location | contact basics; confirmed location |
| Energy/proposal | utility bill; interest package; quotation type |
| Minisplit | conditional data for minisplit quotation types |
| Site evidence | house, electrical, roof attributes and media |
| Closure | notes; client signature |

#### Scenario: Complete non-minisplit visit

- GIVEN a non-minisplit quotation type
- WHEN staff provide every applicable survey group
- THEN Visita is complete without minisplit fields

#### Scenario: Minisplit visit requires branch data

- GIVEN a minisplit quotation type
- WHEN staff attempt to complete Visita without its conditional fields
- THEN Visita remains incomplete and identifies missing branch data

### Requirement: Quotation and Sale Records

Cotización MUST record work-specific scope, amount, terms, and outcome. Venta MUST record the accepted quotation plus confirmation date and agreed amount. Both MUST remain associated with the original `Trabajo`.

#### Scenario: Quotation enables sale

- GIVEN complete Visita and Cotización records
- WHEN the quotation is accepted and sale confirmation is recorded
- THEN Venta is complete

#### Scenario: Sale without quotation is blocked

- GIVEN no complete quotation
- WHEN staff attempt to record a sale
- THEN Venta is blocked

### Requirement: Work-Owned Downloadables

Descargables MUST belong to the original `Trabajo`. Before export, they MUST autofill applicable accumulated stage data; staff MAY override fields. Overrides MUST affect only that document instance, never stage data.

#### Scenario: Export with accumulated defaults

- GIVEN accumulated `Trabajo` data
- WHEN staff open a downloadable
- THEN applicable fields are prefilled

#### Scenario: Document override is isolated

- GIVEN staff override a prefilled document field
- WHEN they export the document
- THEN the export uses the override and the `Trabajo` data remains unchanged

### Requirement: First-Slice Boundaries

The system MUST NOT add CRM, recurrence, notifications, portal, accounting, mandatory client promotion, or full template redesign.

#### Scenario: Free-text intake remains supported

- GIVEN staff create Agenda work
- WHEN no master client is known
- THEN the workflow remains completable through free-text contact data
