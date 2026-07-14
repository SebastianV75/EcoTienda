# Ubicación del Cliente Specification

## Purpose

Enable admin staff to preview a client's location and produce browser print or save-as-PDF output from within the documents workflow.

## Requirements

### Requirement: Client Selector Page

The system MUST provide a client selector page at `/admin/documents/ubicacion-cliente` that follows the same interaction pattern as the Carta Poder template (AppShell layout, rounded card, select dropdown, and direct navigation on selection).

The selector MUST list all clients and, upon selection, navigate directly to the preview page with the selected client's ID.

#### Scenario: Admin selects a client

- GIVEN an admin user is on `/admin/documents/ubicacion-cliente`
- WHEN they select a client from the dropdown
- THEN the system navigates to `/admin/documents/ubicacion-cliente/preview?clientId=<id>`

#### Scenario: Default placeholder state

- GIVEN an admin user is on `/admin/documents/ubicacion-cliente`
- WHEN the page loads
- THEN the dropdown shows a placeholder option
- AND no navigation occurs until a client is selected

### Requirement: Preview Page Route

The system MUST provide a preview page at `/admin/documents/ubicacion-cliente/preview?clientId=<id>` that requires admin authentication.

If `clientId` is missing or invalid, the system MUST handle the error gracefully by redirecting to the selector or displaying an error state.

#### Scenario: Valid client ID

- GIVEN an admin user navigates to `/admin/documents/ubicacion-cliente/preview?clientId=42`
- AND client 42 exists
- THEN the preview page renders with client 42's data

#### Scenario: Missing client ID

- GIVEN an admin user navigates to `/admin/documents/ubicacion-cliente/preview` with no `clientId`
- THEN the system redirects to `/admin/documents/ubicacion-cliente` or displays an error

#### Scenario: Invalid client ID

- GIVEN an admin user navigates to `/admin/documents/ubicacion-cliente/preview?clientId=999999`
- AND client 999999 does not exist
- THEN the system redirects to `/admin/documents/ubicacion-cliente` or displays an error

### Requirement: Client Identity Data Display

The preview page MUST display the following client fields:

| Field | Source |
|-------|--------|
| Full name | `full_name` |
| Address | `address` |
| Neighborhood | `neighborhood` |
| RPU | `rpu` |
| RFC | `rfc` |
| Latitude | `latitude` |
| Longitude | `longitude` |

All fields MUST be present and readable. If a field is empty or null on the client record, the system MUST display a placeholder such as `Sin dato` rather than omitting the field.

#### Scenario: All fields populated

- GIVEN a client with all fields populated
- WHEN the admin views the preview page
- THEN all seven fields are displayed with their values

#### Scenario: Some fields are null

- GIVEN a client with `rfc` set to null
- WHEN the admin views the preview page
- THEN the RFC field shows a placeholder such as `Sin dato`

### Requirement: Embedded Map

The preview page MUST display an embedded map centered on the client's saved coordinates (`latitude`, `longitude`).

The map MUST be rendered using Google Maps. The implementation MUST use the existing `GOOGLE_MAPS_API_KEY` environment variable when the Static Maps API is used.

The map MUST NOT be interactive in this slice.

#### Scenario: Map renders with valid coordinates

- GIVEN a client with `latitude: 19.4326` and `longitude: -99.1332`
- WHEN the admin views the preview page
- THEN a map is displayed centered on those coordinates

#### Scenario: Coordinates are zero or null

- GIVEN a client with null coordinates
- WHEN the admin views the preview page
- THEN the map area shows a message indicating coordinates are not available

### Requirement: Mobile-First Layout

The preview page MUST be fully usable on a mobile viewport with a minimum width of 320px. The layout MUST stack vertically on small screens with the map taking full width. Data fields MUST be readable without horizontal scroll.

#### Scenario: Mobile viewport

- GIVEN the preview page is viewed on a 375px-wide viewport
- WHEN the page renders
- THEN the map occupies full width
- AND client data fields are stacked vertically
- AND no horizontal scroll is required

#### Scenario: Desktop viewport

- GIVEN the preview page is viewed on a 1024px-wide viewport
- WHEN the page renders
- THEN the layout uses the available width appropriately

### Requirement: Navigation Back

The preview page MUST provide a way to navigate back to the client selector or to the documents index.

#### Scenario: Back navigation

- GIVEN an admin is on the preview page
- WHEN they click the back link
- THEN they are taken to `/admin/documents/ubicacion-cliente` or `/admin/documents`

### Requirement: Print Trigger Button

The preview page MUST display a `Guardar como PDF` button that invokes the browser's native print dialog via `window.print()`.

The button MUST be visible on screen and MUST NOT appear in printed output.

#### Scenario: User clicks print button

- GIVEN an admin is on the preview page for a valid client
- WHEN they click `Guardar como PDF`
- THEN the browser's native print dialog opens

#### Scenario: Print button is hidden in print output

- GIVEN the browser print dialog is open
- WHEN the print preview renders
- THEN the `Guardar como PDF` button is not visible in the print output

### Requirement: Print-Friendly Layout

When the browser produces print output, the system MUST hide all AppShell chrome, including sidebar, top bar, footer, and navigation actions.

Only the document content area MUST remain visible in the printed output.

#### Scenario: Print output excludes AppShell chrome

- GIVEN an admin opens the browser print dialog from the preview page
- WHEN the print preview renders
- THEN only the document content remains visible

#### Scenario: Screen rendering is unchanged

- GIVEN an admin is on the preview page in normal browsing mode
- WHEN the page renders on screen
- THEN the AppShell chrome remains visible as normal

### Requirement: Print Content Completeness

The printed output MUST include all preview information: client identity fields, coordinates, and the static map image.

Null or empty fields MUST show the same placeholder used on screen.

#### Scenario: Full data in print output

- GIVEN a client with all fields populated and valid coordinates
- WHEN the admin prints or saves as PDF
- THEN the printed output contains all displayed fields and the map image

#### Scenario: Null coordinates in print

- GIVEN a client with null coordinates
- WHEN the admin prints or saves as PDF
- THEN the map area shows the same fallback message used on screen

### Requirement: Print Page Sizing

The printed content MUST fit within a standard page size such as A4 or Letter without horizontal overflow. Font sizes and image dimensions MUST remain legible.

#### Scenario: Content fits on one page

- GIVEN a client with all fields populated and a valid map image
- WHEN the admin prints or saves as PDF on A4 or Letter paper
- THEN all content fits on a single page without horizontal clipping

#### Scenario: Map image fits within page

- GIVEN the preview page with a rendered map image
- WHEN the admin prints or saves as PDF
- THEN the map image fits within the page width without distortion

### Requirement: Admin Authentication

Access to both the client selector and preview routes MUST require admin authentication, consistent with all other document routes.

#### Scenario: Unauthenticated access

- GIVEN an unauthenticated user
- WHEN they attempt to access `/admin/documents/ubicacion-cliente` or its preview route
- THEN they are redirected to the login page
