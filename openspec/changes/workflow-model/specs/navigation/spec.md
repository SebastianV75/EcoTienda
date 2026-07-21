# Delta for Navigation

## MODIFIED Requirements

### Requirement: Mobile Bottom Navigation Bar

The system MUST display a fixed bottom navigation bar on viewports narrower than the `lg` breakpoint. The bar MUST contain exactly five items in this order: Inicio, Agenda, Descargables, Cotizaciones, and Mas. Agenda MUST navigate to the workflow entry point; the other primary items MUST navigate to their corresponding routes.

(Previously: the second primary item was Clientes.)

#### Scenario: User sees workflow-first bottom bar

- GIVEN a viewport narrower than 1024px
- WHEN the user opens any page that uses AppShell
- THEN a fixed five-item bottom bar includes Agenda as its second item

#### Scenario: User opens Agenda

- GIVEN the bottom navigation bar is visible
- WHEN the user taps `Agenda`
- THEN the application navigates to the Agenda route
- AND `Agenda` is visually highlighted as active

#### Scenario: Bottom bar does not appear on desktop

- GIVEN a viewport 1024px or wider
- WHEN the user opens any page that uses AppShell
- THEN the bottom navigation bar is not visible
- AND the existing sidebar navigation is displayed instead
