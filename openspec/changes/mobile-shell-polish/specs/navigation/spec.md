# Navigation Specification

## Purpose

Define the mobile and desktop navigation shell for EcoTienda. On mobile viewports, replace the stacked sidebar with a fixed bottom navigation bar and a compact top header so that primary content is immediately visible. On desktop viewports, preserve the existing sidebar layout unchanged.

## Requirements

### Requirement: Mobile Bottom Navigation Bar

The system MUST display a fixed bottom navigation bar on viewports narrower than the `lg` breakpoint (~1024px). The bar MUST contain exactly five items in this order: Inicio, Clientes, Descargables, Cotizaciones, and Más. Each item MUST navigate to its corresponding route when tapped.

#### Scenario: User sees bottom bar on mobile viewport

- GIVEN a viewport narrower than 1024px
- WHEN the user opens any page that uses AppShell
- THEN a fixed bottom navigation bar is visible at the bottom of the viewport with five items: Inicio, Clientes, Descargables, Cotizaciones, Más

#### Scenario: User taps a primary nav item

- GIVEN the bottom navigation bar is visible
- WHEN the user taps "Clientes"
- THEN the application navigates to the Clientes route
- AND the "Clientes" item in the bottom bar is visually highlighted as active

#### Scenario: Bottom bar does not appear on desktop

- GIVEN a viewport 1024px or wider
- WHEN the user opens any page that uses AppShell
- THEN the bottom navigation bar is NOT visible
- AND the existing sidebar navigation is displayed instead

### Requirement: Active Route Indicator

The bottom navigation bar MUST visually indicate which primary section is currently active. The indicator MUST update when the user navigates to a different primary section.

#### Scenario: Active indicator reflects current route

- GIVEN the user is on the Descargables page
- WHEN the bottom navigation bar renders
- THEN the "Descargables" item is visually distinct (highlighted) from the other items

#### Scenario: Más section items do not activate a bottom bar indicator

- GIVEN the user navigated to Visitas técnicas via the "Más" sheet
- WHEN the bottom navigation bar renders
- THEN no primary item in the bottom bar is highlighted as active (or "Más" MAY be highlighted)

### Requirement: Más Sheet

The "Más" item in the bottom navigation bar MUST open a sheet or drawer panel — NOT a dedicated page route. The sheet MUST list secondary navigation items: Visitas técnicas and Configuración. The sheet MUST also contain the authenticated user's email address and a logout action.

#### Scenario: User opens the Más sheet

- GIVEN the bottom navigation bar is visible on a mobile viewport
- WHEN the user taps "Más"
- THEN a sheet/drawer panel slides up from the bottom of the viewport
- AND the sheet displays "Visitas técnicas" and "Configuración" as tappable navigation items
- AND the sheet displays the user's email address
- AND the sheet displays a logout action

#### Scenario: User navigates from Más sheet

- GIVEN the "Más" sheet is open
- WHEN the user taps "Configuración"
- THEN the sheet closes
- AND the application navigates to the Configuración route

#### Scenario: User dismisses the Más sheet

- GIVEN the "Más" sheet is open
- WHEN the user taps outside the sheet or swipes it down
- THEN the sheet closes
- AND the underlying page content remains visible and interactive

#### Scenario: User logs out from Más sheet

- GIVEN the "Más" sheet is open
- WHEN the user taps the logout action
- THEN the application terminates the user session
- AND the user is redirected to the login page

### Requirement: Compact Mobile Header

On viewports narrower than the `lg` breakpoint, the top header area MUST display only the current page title. The header MUST NOT display the branding label, role card, page description/subtitle, or any navigation elements that are redundant with the bottom bar.

#### Scenario: Mobile header shows title only

- GIVEN a viewport narrower than 1024px
- WHEN the user is on the "Clientes" page
- THEN the top header displays "Clientes" as the page title
- AND no subtitle, description, role card, or branding label is visible in the header area

#### Scenario: Page content starts near top of viewport

- GIVEN a viewport narrower than 1024px
- WHEN any AppShell page renders
- THEN the main page content begins within the first ~120px of the viewport height (excluding the bottom navigation bar)

### Requirement: Desktop Layout Preserved

On viewports 1024px or wider, the navigation shell MUST remain visually and functionally identical to the current sidebar-based layout. No elements of the desktop experience MAY change as a result of this specification.

#### Scenario: Desktop sidebar unchanged

- GIVEN a viewport 1024px or wider
- WHEN the user opens any AppShell page
- THEN the full sidebar is displayed with logo, role card, all navigation links, and auth status
- AND the bottom navigation bar is NOT rendered
- AND the desktop header retains its current layout including branding and description

### Requirement: Sidebar Hidden on Mobile

On viewports narrower than the `lg` breakpoint, the sidebar MUST NOT be visible. The sidebar content (navigation links, role card, auth status) MUST NOT be accessible via the mobile top header or bottom bar except where explicitly relocated (email/logout in Más sheet).

#### Scenario: Sidebar not rendered on mobile

- GIVEN a viewport narrower than 1024px
- WHEN any AppShell page renders
- THEN the `<aside>` sidebar element is not visible in the layout

### Requirement: Safe Area Insets

The bottom navigation bar MUST respect `env(safe-area-inset-bottom)` to avoid overlapping with device home indicators (iOS) or gesture navigation areas (Android).

#### Scenario: Bottom bar on iPhone with home indicator

- GIVEN the app is running on an iPhone with a home indicator
- WHEN the bottom navigation bar is displayed
- THEN the bar's content area is padded above the home indicator safe area
- AND no interactive element overlaps the system gesture area

### Requirement: Print Layout

The bottom navigation bar MUST be hidden when the page is printed. Existing print styles for the rest of the layout MUST continue to function.

#### Scenario: Print hides bottom bar

- GIVEN a mobile or desktop viewport
- WHEN the user triggers browser print (Ctrl+P / Cmd+P)
- THEN the bottom navigation bar does not appear in the print output

### Requirement: Backward Compatibility

All existing AppShell consumer pages (18+ pages) MUST continue to render correctly without any changes to their component props or code. The AppShell component signature MUST remain unchanged.

#### Scenario: Existing pages render without modification

- GIVEN any existing page that uses `<AppShell>` with its current props
- WHEN the page is rendered on a mobile viewport
- THEN the page content displays correctly within the new mobile shell
- AND no console errors or layout breaks occur

#### Scenario: Existing pages render on desktop without modification

- GIVEN any existing page that uses `<AppShell>` with its current props
- WHEN the page is rendered on a desktop viewport
- THEN the page displays identically to the pre-change layout

### Requirement: Spanish UI Labels

All user-facing labels, aria-labels, and strings in the navigation shell MUST be in Spanish.

#### Scenario: Labels are in Spanish

- GIVEN the navigation shell renders
- WHEN the user views the bottom bar, Más sheet, or mobile header
- THEN all visible labels read in Spanish (Inicio, Clientes, Descargables, Cotizaciones, Más, Visitas técnicas, Configuración, Cerrar sesión)

### Requirement: No New Dependencies

The navigation shell changes MUST be implemented using only existing project dependencies (React, Tailwind CSS). No new UI component libraries or animation libraries MAY be introduced.

#### Scenario: Build passes without new packages

- GIVEN the navigation shell changes are implemented
- WHEN `npm run build` executes
- THEN the build succeeds with zero errors
- AND no new dependencies were added to `package.json`
