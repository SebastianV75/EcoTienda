# Delta for Clients

## ADDED Requirements

### Requirement: Optional Master Client for Trabajo Intake

The system MUST NOT require a master client to create or progress a `Trabajo`. A master client MAY be associated later without changing the work's original free-text intake data.

#### Scenario: Work starts without a client record

- GIVEN staff have only free-text contact information
- WHEN they create Agenda work
- THEN no client record is required

#### Scenario: Client association is later optional

- GIVEN a `Trabajo` started without a master client
- WHEN staff later associate one
- THEN the original intake data remains available
