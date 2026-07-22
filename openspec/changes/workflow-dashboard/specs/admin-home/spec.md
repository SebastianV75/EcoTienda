# Delta for Admin Home

## MODIFIED Requirements

### Requirement: Compact Module Grid on Mobile

The system MUST render the four quick module cards (Clientes, Descargables, Cotizaciones, Visitas tecnicas) in a 2x2 grid layout on mobile viewports (below 768px). Each card MUST remain a tappable navigation element linking to its respective module route. The grid MUST follow the active-work list and secondary summary context.
(Previously: the grid was required within the first viewport alongside the activity summary.)

#### Scenario: Mobile operator reaches module navigation

- GIVEN a mobile viewport width of 375px
- WHEN the operator navigates to `/admin`
- THEN the active-work list appears before the module grid

#### Scenario: Module cards maintain adequate tap targets on mobile

- GIVEN a mobile viewport
- WHEN the module grid renders
- THEN each card's interactive area is at least 44px in minimum dimension

#### Scenario: Module card descriptions are reduced on mobile

- GIVEN a mobile viewport
- WHEN the module cards render
- THEN card descriptions are shortened or omitted while the module title and navigation CTA remain visible

### Requirement: Activity Summary with Client Data Only

The system MUST display an activity summary section that shows operational counts derived exclusively from currently available Client data. The activity summary MUST include at minimum the total client count and recently created client count, and MUST appear as secondary context after the active-work list on mobile.
(Previously: the activity summary was primary mobile context.)

#### Scenario: Activity summary renders real Client counts

- GIVEN the admin user is authenticated and Supabase is available
- WHEN the Home page loads
- THEN the activity summary displays the total number of clients and the count of recently created clients

#### Scenario: Quotations and Technical Visits do not appear in activity summary

- GIVEN the Home page renders the activity summary
- WHEN the activity summary content is evaluated
- THEN no counts, rows, cards, or placeholders for Quotations or Technical Visits are present

#### Scenario: Activity summary handles zero clients gracefully

- GIVEN the clients table is empty
- WHEN the Home page loads
- THEN the activity summary renders with zero values without errors or broken layout

### Requirement: Content Hierarchy Order

The system MUST render content in this mobile order: active-work list, secondary activity summary or minimal greeting, module grid, then remaining informational content.
(Previously: activity summary or minimal greeting preceded the module grid, with no active-work priority.)

#### Scenario: Mobile content hierarchy puts workflow first

- GIVEN a mobile viewport with active work
- WHEN the Home page renders
- THEN the active-work list is above the fold and before summary metrics
