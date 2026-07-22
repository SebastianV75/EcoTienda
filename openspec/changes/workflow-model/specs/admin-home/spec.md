# Delta for Admin Home

## MODIFIED Requirements

### Requirement: Activity Summary with Workflow Progress

The system MUST display an activity summary derived from available `Trabajo` data. It MUST include work counts or progress grouped by current workflow stage and MAY include client counts as secondary context.

(Previously: activity summary used Client data only and excluded Quotations and Technical Visits.)

#### Scenario: Workflow activity renders

- GIVEN an authenticated admin and available `Trabajo` records
- WHEN the Home page loads
- THEN the activity summary shows work progress grouped by stage

#### Scenario: Empty workflow is graceful

- GIVEN no `Trabajo` records exist
- WHEN the Home page loads
- THEN the activity summary renders zero workflow values without errors

## MODIFIED Requirements

### Requirement: Quick Module Card Set

The Home page MUST display Agenda as a primary workflow module and MUST prioritize it ahead of Clientes. The page MAY retain other operational module cards when they link to their corresponding admin routes.

(Previously: exactly four cards were limited to Clientes, Descargables, Cotizaciones, and Visitas tecnicas.)

#### Scenario: Agenda is prioritized

- GIVEN an admin is on the Home page
- WHEN quick module cards render
- THEN Agenda is present and appears before Clientes when Clientes is shown
