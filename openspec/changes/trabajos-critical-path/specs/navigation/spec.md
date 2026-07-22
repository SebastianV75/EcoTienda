# Delta for Navigation

## MODIFIED Requirements

### Requirement: Mobile Bottom Navigation Bar

The system MUST display a fixed bottom navigation bar on viewports narrower than the `lg` breakpoint. The bar MUST include the "Trabajos" entry alongside the existing items and navigate to `/admin/trabajos` when tapped. The bar layout MUST remain usable when the new entry is added; if item count exceeds the practical limit, the least-used existing item MUST move into the "Mas" sheet.

(Previously: The bar contained exactly five items: Inicio, Clientes, Descargables, Cotizaciones, and Mas.)

#### Scenario: User sees Trabajos in bottom bar on mobile

- GIVEN a viewport narrower than 1024px
- WHEN the user opens any page using AppShell
- THEN the bottom navigation bar includes a "Trabajos" item
- AND tapping it navigates to `/admin/trabajos`

#### Scenario: User sees bottom bar on mobile viewport

- GIVEN a viewport narrower than 1024px
- WHEN the user opens any page that uses AppShell
- THEN a fixed bottom navigation bar is visible
- AND tapping any item navigates to its route

#### Scenario: User taps a primary nav item

- GIVEN the bottom navigation bar is visible
- WHEN the user taps `Clientes`
- THEN the application navigates to the Clientes route
- AND the `Clientes` item is visually highlighted as active

#### Scenario: Bottom bar does not appear on desktop

- GIVEN a viewport 1024px or wider
- WHEN the user opens any page that uses AppShell
- THEN the bottom navigation bar is not visible
- AND the existing sidebar navigation is displayed instead

#### Scenario: Mas section items do not require a primary highlight

- GIVEN the user navigated to Visitas tecnicas via the `Mas` sheet
- WHEN the bottom navigation bar renders
- THEN no primary item is required to be highlighted

## ADDED Requirements

### Requirement: Trabajos Sidebar Entry

The desktop sidebar MUST include a "Trabajos" entry alongside the existing Agenda, Visitas, and Cotizaciones entries. The entry MUST link to `/admin/trabajos`.

#### Scenario: Admin sees Trabajos in sidebar

- GIVEN a viewport 1024px or wider
- WHEN the sidebar renders
- THEN a "Trabajos" entry is visible next to Agenda, Visitas, and Cotizaciones

### Requirement: Trabajos Active Route Indicator

The "Trabajos" nav entry MUST be visually highlighted as active when the current path matches `/admin/trabajos` or any `/admin/trabajos/*` subroute.

#### Scenario: Active state on trabajo detail

- GIVEN the user is on `/admin/trabajos/123`
- WHEN the sidebar or bottom nav renders
- THEN the "Trabajos" entry is visually distinct from inactive entries