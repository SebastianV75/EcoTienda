# Delta for Ubicación del Cliente

## ADDED Requirements

### Requirement: Print Trigger Button

The preview page MUST display a "Guardar como PDF" button that, when clicked, invokes the browser's native print dialog (`window.print()`).

The button MUST be visible on the preview page in normal (screen) rendering. The button itself MUST NOT appear in the printed output.

#### Scenario: User clicks print button

- GIVEN an admin is on the preview page for a valid client
- WHEN they click the "Guardar como PDF" button
- THEN the browser's native print dialog opens

#### Scenario: Print button is hidden in print output

- GIVEN the browser print dialog is open
- WHEN the print preview renders
- THEN the "Guardar como PDF" button is not visible in the print output

### Requirement: Print-Friendly Layout

When the browser produces print output (print dialog preview or actual print/PDF), the system MUST hide all AppShell chrome — sidebar, top bar, navigation buttons, footer, and any other administrative UI elements.

Only the document content area (client identity fields, coordinates, and map image) MUST be visible in the printed output.

#### Scenario: Print output excludes AppShell chrome

- GIVEN an admin opens the browser print dialog from the preview page
- WHEN the print preview renders
- THEN the sidebar is not visible
- AND the top bar is not visible
- AND navigation buttons are not visible
- AND the footer is not visible
- AND only the document content (identity fields, coordinates, map) is visible

#### Scenario: Screen rendering is unchanged

- GIVEN an admin is on the preview page in normal browsing mode
- WHEN the page renders on screen
- THEN the AppShell chrome (sidebar, top bar, navigation) is visible as before
- AND the print CSS rules do not affect the screen layout

### Requirement: Print Content Completeness

The printed output MUST include all information displayed on the preview page:

- Client identity fields (full name, address, neighborhood, RPU, RFC)
- Coordinates (latitude and longitude as text)
- The static map image

Each field MUST be legible at standard print font sizes. Null/empty fields MUST show the same placeholder used on screen (e.g., "Sin dato").

#### Scenario: Full data in print output

- GIVEN a client with all fields populated and valid coordinates
- WHEN the admin prints or saves as PDF
- THEN the printed output contains all seven identity fields with their values
- AND the coordinates are displayed
- AND the map image is rendered

#### Scenario: Map image renders in print

- GIVEN a client with valid coordinates
- WHEN the admin prints or saves as PDF
- THEN the static map image appears in the print output
- AND the image is not blank, clipped, or missing

#### Scenario: Null coordinates in print

- GIVEN a client with null coordinates
- WHEN the admin prints or saves as PDF
- THEN the map area shows the fallback message (e.g., "Sin coordenadas guardadas") consistent with the screen preview

### Requirement: Print Page Sizing

The printed content MUST fit within a standard page size (A4 or Letter) without horizontal overflow. Font sizes and image dimensions MUST be adjusted for print so that content is readable and the layout does not span multiple pages unnecessarily.

#### Scenario: Content fits on one page

- GIVEN a client with all fields populated and a valid map image
- WHEN the admin prints or saves as PDF on A4 or Letter paper
- THEN all content fits on a single page
- AND no horizontal overflow or clipping occurs
- AND text is legible at the printed size

#### Scenario: Map image fits within page

- GIVEN the preview page with a rendered map image
- WHEN the admin prints or saves as PDF
- THEN the map image is scaled to fit within the page width
- AND the image is not cropped or distorted

## REMOVED Requirements

### Requirement: No Print or Download (original constraint)

(Reason: This change explicitly introduces print/PDF export via the browser print dialog, replacing the preview-only restriction. The requirement is superseded by the new Print Trigger, Print-Friendly Layout, Print Content Completeness, and Print Page Sizing requirements.)
(Migration: None — the original constraint was a prohibition; removing it enables new functionality without breaking existing consumers.)
