# Diagrama Unifilar Specification

## Purpose

Define the client selector and data panel preview for the unifilar electrical diagram document. This is the first slice — data panel only, no graphical diagram rendering. The data panel displays a structured, read-only view of client identity, CFE service number, and solar equipment information that will accompany the diagram in a future slice.

## Requirements

### Requirement: Client Selector Page

The system MUST provide a client selector page at `/admin/documents/diagrama-unifilar` that follows the same interaction pattern as Carta Poder and Ubicación del cliente: AppShell layout, rounded card, select dropdown with client list, and Link-based navigation to the preview page.

The page MUST be accessible only to authenticated admin users.

#### Scenario: Client selector renders with client list

- GIVEN an admin user is authenticated
- WHEN they navigate to `/admin/documents/diagrama-unifilar`
- THEN the page displays a select dropdown containing all clients
- AND each option shows the client's full name and RPU (format: `{full_name} · {rpu}`)
- AND a "Volver a descargables" link navigates back to `/admin/documents`

#### Scenario: User selects a client and navigates to preview

- GIVEN an admin user is on the client selector page
- WHEN they select a client from the dropdown
- AND click the navigation link to the preview
- THEN they are navigated to `/admin/documents/diagrama-unifilar/preview?clientId={selected_id}`

#### Scenario: Back navigation from selector

- GIVEN an admin user is on the client selector page
- WHEN they click "Volver a descargables"
- THEN they are navigated to `/admin/documents`

### Requirement: Data Panel Preview Page

The system MUST provide a preview page at `/admin/documents/diagrama-unifilar/preview?clientId=<id>` that displays a structured data panel containing all information needed for the unifilar diagram.

The preview page MUST be accessible only to authenticated admin users.

The data panel MUST be organized into two clearly labeled sections:

1. **Datos del cliente** — client identity and CFE service number
2. **Equipo de generación** — solar installation equipment specifications

#### Scenario: Preview displays all data panel sections

- GIVEN an admin user navigates to the preview page with a valid `clientId`
- WHEN the page renders
- THEN the data panel displays two sections: "Datos del cliente" and "Equipo de generación"
- AND each section shows its fields with labels and values

#### Scenario: Preview navigates back to selector

- GIVEN an admin user is on the preview page
- WHEN they click the back navigation link
- THEN they are navigated to `/admin/documents/diagrama-unifilar`

### Requirement: Data Panel Autofill from Client Record

The data panel MUST autofill all displayed fields from the client record. No manual data entry is required or allowed on the preview page. The preview is read-only.

#### Datos del cliente section

| Field label | Data source | Display when null |
|-------------|-------------|-------------------|
| Nombre del titular | `client.full_name` | "—" |
| Número de servicio | `client.rpu` | "—" |
| R.F.C. | `client.rfc` | "—" |
| Teléfono | `client.phone` | "—" |
| Domicilio | `client.address` | "—" |
| Colonia | `client.neighborhood` | "—" |

#### Equipo de generación section

| Field label | Data source | Display when null |
|-------------|-------------|-------------------|
| Cantidad de paneles | `client.panel_count` | "—" |
| Potencia de paneles | `client.panel_power` | "—" |
| Inversor | `client.inverter` | "—" |
| Capacidad instalada | `client.installed_capacity` | "—" |
| Generación media mensual estimada | `client.estimated_monthly_generation` | "—" |

#### Scenario: All fields populated

- GIVEN a client record where all fields have values
- WHEN the preview page renders
- THEN every field in the data panel displays its corresponding value
- AND no field shows "—"

#### Scenario: Solar equipment fields are null

- GIVEN a client record where `panel_count`, `panel_power`, `inverter`, `installed_capacity`, and `estimated_monthly_generation` are null
- WHEN the preview page renders
- THEN the "Datos del cliente" section displays its values normally
- AND the "Equipo de generación" section displays "—" for each field
- AND the page renders without errors

#### Scenario: Core client fields are always populated

- GIVEN a client record with `full_name`, `rpu`, `address`, `neighborhood`, `rfc`, and `phone` populated
- WHEN the preview page renders
- THEN the "Datos del cliente" section displays all values

### Requirement: Data Panel Read-Only

The data panel preview page MUST be entirely read-only. Users MUST NOT be able to edit, modify, or input any data on this page.

#### Scenario: No editable fields on preview

- GIVEN an admin user is on the preview page
- WHEN they inspect the data panel
- THEN all fields are displayed as static text
- AND no input fields, textareas, or editable elements are present

### Requirement: Invalid or Missing Client ID

When the preview page is accessed without a `clientId` parameter or with an invalid/non-existent `clientId`, the system MUST display a recovery card or redirect the user, matching the existing document flow error handling pattern.

#### Scenario: Missing clientId parameter

- GIVEN an admin user navigates to `/admin/documents/diagrama-unifilar/preview` without a `clientId` query parameter
- WHEN the page loads
- THEN the system redirects to `/admin/documents/diagrama-unifilar` (the client selector)
- OR displays a recovery card with a link back to the client selector

#### Scenario: Invalid clientId

- GIVEN an admin user navigates to `/admin/documents/diagrama-unifilar/preview?clientId=nonexistent-id`
- WHEN the page loads
- THEN the system redirects to `/admin/documents/diagrama-unifilar` (the client selector)
- OR displays a recovery card informing the user that the client was not found, with a link back to the client selector

### Requirement: Data Panel Modular Structure

The data panel MUST be structured as independent sections (Datos del cliente, Equipo de generación) so that each section can be repositioned or embedded into a diagram layout in a future slice without requiring changes to the data fetching or field mapping logic.

#### Scenario: Sections are independently renderable

- GIVEN the data panel component
- WHEN each section is rendered
- THEN each section receives its data independently
- AND removing or repositioning one section does not affect the rendering of other sections

### Requirement: Spanish UI Copy

All user-facing text on the client selector page and data panel preview MUST be in Spanish, consistent with the rest of the application.

#### Scenario: All UI copy in Spanish

- GIVEN the client selector page or preview page is rendered
- WHEN the user inspects all visible text (labels, section headers, navigation links, field labels)
- THEN all text is in Spanish

### Requirement: Existing Document Flows Preserved

This change MUST NOT alter any existing document flow. Carta Poder and Ubicación del cliente MUST continue to work identically.

#### Scenario: Carta Poder unaffected

- GIVEN an admin user navigates to `/admin/documents/carta-poder`
- WHEN they select a client and view the preview
- THEN the Carta Poder document renders exactly as before this change

#### Scenario: Ubicación del cliente unaffected

- GIVEN an admin user navigates to `/admin/documents/ubicacion-cliente`
- WHEN they select a client and view the preview
- THEN the Ubicación del cliente document renders exactly as before this change

### Requirement: Build and Lint Pass

The change MUST NOT introduce any new lint errors or build failures. `npm run lint` and `npm run build` MUST pass with no new errors.

#### Scenario: Lint passes

- GIVEN the change is implemented
- WHEN `npm run lint` is executed
- THEN it exits with zero errors

#### Scenario: Build passes

- GIVEN the change is implemented
- WHEN `npm run build` is executed
- THEN it completes successfully with no new errors
