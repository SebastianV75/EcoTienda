# Ubicación del Cliente Specification

## Purpose

Enable admin staff to preview a client's location — identity data, coordinates, and an embedded map — from within the documents workflow. This is a preview-only slice; no printable or downloadable output is produced.

## Requirements

### Requirement: Client Selector Page

The system MUST provide a client selector page at `/admin/documents/ubicacion-cliente` that follows the same interaction pattern as the Carta Poder template (AppShell layout, rounded card, select dropdown, Link-based navigation).

The selector MUST list all clients and, upon selection, navigate to the preview page with the selected client's ID.

#### Scenario: Admin selects a client

- GIVEN an admin user is on `/admin/documents/ubicacion-cliente`
- WHEN they select a client from the dropdown
- THEN the system navigates to `/admin/documents/ubicacion-cliente/preview?clientId=<id>`

#### Scenario: No client selected

- GIVEN an admin user is on `/admin/documents/ubicacion-cliente`
- WHEN no client is selected
- THEN the preview link/button is disabled or not visible

### Requirement: Preview Page Route

The system MUST provide a preview page at `/admin/documents/ubicacion-cliente/preview?clientId=<id>` that requires admin authentication.

If `clientId` is missing or invalid, the system MUST handle the error gracefully (redirect to selector or show an error state).

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
| Latitude | `latitude` (displayed as text) |
| Longitude | `longitude` (displayed as text) |

All fields MUST be present and readable. If a field is empty/null on the client record, the system MUST display a placeholder (e.g., "—" or "Sin dato") rather than omitting the field.

#### Scenario: All fields populated

- GIVEN a client with all fields populated
- WHEN the admin views the preview page
- THEN all seven fields are displayed with their values

#### Scenario: Some fields are null

- GIVEN a client with `rfc` set to null
- WHEN the admin views the preview page
- THEN the RFC field shows a placeholder such as "Sin dato"

### Requirement: Embedded Map

The preview page MUST display an embedded map centered on the client's saved coordinates (`latitude`, `longitude`).

The map MUST be rendered using Google Maps — either a static map image (Maps Static API) or an iframe embed. The implementation MUST use the existing `GOOGLE_MAPS_API_KEY` environment variable when the Static API is used, or require no key when using an iframe embed.

The map MUST NOT be interactive (no drag, zoom, or re-pin) in this slice.

#### Scenario: Map renders with valid coordinates

- GIVEN a client with `latitude: 19.4326` and `longitude: -99.1332`
- WHEN the admin views the preview page
- THEN a map is displayed centered on those coordinates

#### Scenario: Coordinates are zero or null

- GIVEN a client with `latitude: null` and `longitude: null`
- WHEN the admin views the preview page
- THEN the map area shows a message indicating coordinates are not available (e.g., "Sin coordenadas guardadas")

### Requirement: Mobile-First Layout

The preview page MUST be fully usable on a mobile viewport (minimum 320px width). The layout MUST stack vertically on small screens with the map taking full width. Data fields MUST be readable without horizontal scroll.

#### Scenario: Mobile viewport

- GIVEN the preview page is viewed on a 375px-wide viewport
- WHEN the page renders
- THEN the map occupies full width
- AND client data fields are stacked vertically
- AND no horizontal scroll is required

#### Scenario: Desktop viewport

- GIVEN the preview page is viewed on a 1024px-wide viewport
- WHEN the page renders
- THEN the layout uses the available width appropriately (map and data side-by-side or stacked with comfortable spacing)

### Requirement: Navigation Back

The preview page MUST provide a way to navigate back to the client selector or to the documents index.

#### Scenario: Back navigation

- GIVEN an admin is on the preview page
- WHEN they click the back/navigation link
- THEN they are taken to `/admin/documents/ubicacion-cliente` or `/admin/documents`

### Requirement: No Print or Download

The preview page MUST NOT include any print button, download button, PDF generation, or any mechanism to produce a printable document. This is a preview-only slice.

#### Scenario: No print functionality

- GIVEN an admin is on the preview page
- WHEN they inspect the page
- THEN no `PrintButton`, download link, or print-related UI element is present

### Requirement: Admin Authentication

Access to both the client selector and preview routes MUST require admin authentication, consistent with all other document routes.

#### Scenario: Unauthenticated access

- GIVEN an unauthenticated user
- WHEN they attempt to access `/admin/documents/ubicacion-cliente` or its preview route
- THEN they are redirected to the login page
