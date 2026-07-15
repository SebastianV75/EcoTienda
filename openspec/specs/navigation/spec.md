# Navigation Specification

## Purpose

Define the mobile and desktop navigation shell for EcoTienda. On mobile viewports, the shell MUST use a fixed bottom navigation bar and a compact top header so primary content is visible quickly. On desktop viewports, the existing sidebar layout MUST remain unchanged.

## Requirements

### Requirement: Mobile Bottom Navigation Bar

The system MUST display a fixed bottom navigation bar on viewports narrower than the `lg` breakpoint. The bar MUST contain exactly five items in this order: Inicio, Clientes, Descargables, Cotizaciones, and Mas. Each primary item MUST navigate to its corresponding route when tapped.

#### Scenario: User sees bottom bar on mobile viewport

- GIVEN a viewport narrower than 1024px
- WHEN the user opens any page that uses AppShell
- THEN a fixed bottom navigation bar is visible with five items

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

### Requirement: Active Route Indicator

The bottom navigation bar MUST visually indicate which primary section is currently active.

#### Scenario: Active indicator reflects current route

- GIVEN the user is on the Descargables page
- WHEN the bottom navigation bar renders
- THEN the `Descargables` item is visually distinct from the other items

#### Scenario: Mas section items do not require a primary highlight

- GIVEN the user navigated to Visitas tecnicas via the `Mas` sheet
- WHEN the bottom navigation bar renders
- THEN no primary item is required to be highlighted

### Requirement: Mas Sheet

The `Mas` item in the bottom navigation bar MUST open a sheet or drawer panel, not a dedicated page route. The sheet MUST list Visitas tecnicas and Configuracion, and it MUST contain the authenticated user's email address and a logout action.

#### Scenario: User opens the Mas sheet

- GIVEN the bottom navigation bar is visible on a mobile viewport
- WHEN the user taps `Mas`
- THEN a sheet or drawer opens from the bottom of the viewport
- AND the sheet displays the secondary navigation items, email, and logout action

#### Scenario: User navigates from Mas sheet

- GIVEN the `Mas` sheet is open
- WHEN the user taps `Configuracion`
- THEN the sheet closes
- AND the application navigates to the Configuracion route

#### Scenario: User dismisses the Mas sheet

- GIVEN the `Mas` sheet is open
- WHEN the user taps outside the sheet or swipes it down
- THEN the sheet closes

#### Scenario: User logs out from Mas sheet

- GIVEN the `Mas` sheet is open
- WHEN the user taps the logout action
- THEN the application terminates the user session and redirects to the login page

### Requirement: Compact Mobile Header

On viewports narrower than the `lg` breakpoint, the top header area MUST display only the current page title.

#### Scenario: Mobile header shows title only

- GIVEN a viewport narrower than 1024px
- WHEN the user is on the `Clientes` page
- THEN the top header displays only the page title

#### Scenario: Page content starts near top of viewport

- GIVEN a viewport narrower than 1024px
- WHEN any AppShell page renders
- THEN the main page content begins near the top of the viewport excluding the bottom navigation bar

### Requirement: Desktop Layout Preserved

On viewports 1024px or wider, the navigation shell MUST remain visually and functionally identical to the current sidebar-based layout.

#### Scenario: Desktop sidebar unchanged

- GIVEN a viewport 1024px or wider
- WHEN the user opens any AppShell page
- THEN the full sidebar is displayed
- AND the bottom navigation bar is not rendered
- AND the desktop header retains its current layout

### Requirement: Sidebar Hidden on Mobile

On viewports narrower than the `lg` breakpoint, the sidebar MUST NOT be visible.

#### Scenario: Sidebar not rendered on mobile

- GIVEN a viewport narrower than 1024px
- WHEN any AppShell page renders
- THEN the sidebar is not visible in the layout

### Requirement: Safe Area Insets

The bottom navigation bar MUST respect `env(safe-area-inset-bottom)` so it does not overlap device gesture areas.

#### Scenario: Bottom bar on device with home indicator

- GIVEN the app is running on a device with a home indicator
- WHEN the bottom navigation bar is displayed
- THEN the bar's content area is padded above the safe area

### Requirement: Print Layout

The bottom navigation bar MUST be hidden when the page is printed.

#### Scenario: Print hides bottom bar

- GIVEN a mobile or desktop viewport
- WHEN the user triggers browser print
- THEN the bottom navigation bar does not appear in the print output

### Requirement: Backward Compatibility

All existing AppShell consumer pages MUST continue to render correctly without any changes to their component props or code. The AppShell component signature MUST remain unchanged.

#### Scenario: Existing pages render without modification

- GIVEN any existing page that uses `<AppShell>` with its current props
- WHEN the page is rendered on a mobile viewport
- THEN the page content displays correctly within the new mobile shell

#### Scenario: Existing pages render on desktop without modification

- GIVEN any existing page that uses `<AppShell>` with its current props
- WHEN the page is rendered on a desktop viewport
- THEN the page displays identically to the pre-change layout

### Requirement: Spanish UI Labels

All user-facing labels, aria-labels, and strings in the navigation shell MUST be in Spanish.

#### Scenario: Labels are in Spanish

- GIVEN the navigation shell renders
- WHEN the user views the bottom bar, Mas sheet, or mobile header
- THEN all visible labels are in Spanish

### Requirement: No New Dependencies

The navigation shell changes MUST be implemented using only existing project dependencies.

#### Scenario: Build passes without new packages

- GIVEN the navigation shell changes are implemented
- WHEN `npm run build` executes
- THEN the build succeeds without requiring new packages in `package.json`
