# Documents Specification

## Purpose

Define the documents workflow for admin users — a central index of downloadable/admin document templates, each with a navigation route and status indicator.

## Requirements

### Requirement: Documents Index Template Entries

The documents index page (`/admin/documents`) MUST display each template with its current status and a navigable link. When a template is active, its `href` MUST point to the template's route. When a template is pending, its `href` MUST be `"#"` and the status label MUST read "Pendiente".

The "Ubicación del cliente" template entry MUST have status "Activo" and `href` set to `/admin/documents/ubicacion-cliente`.

#### Scenario: Admin sees ubicación del cliente as active

- GIVEN an admin user is authenticated
- WHEN they navigate to `/admin/documents`
- THEN the "Ubicación del cliente" card displays status "Activo"
- AND the card links to `/admin/documents/ubicacion-cliente`

#### Scenario: Other pending templates remain unchanged

- GIVEN an admin user is authenticated
- WHEN they navigate to `/admin/documents`
- THEN all other templates with status "Pendiente" still display `href: "#"` and are not navigable

### Requirement: Diagrama Unifilar Template Entry

The documents index page (`/admin/documents`) MUST display a "Diagrama unifilar" template card with status "Activo" and `href` set to `/admin/documents/diagrama-unifilar`.

The card MUST follow the same visual pattern as existing template cards (Carta Poder, Ubicación del cliente).

#### Scenario: Admin sees diagrama unifilar as active

- GIVEN an admin user is authenticated
- WHEN they navigate to `/admin/documents`
- THEN a "Diagrama unifilar" card is displayed with status "Activo"
- AND the card links to `/admin/documents/diagrama-unifilar`

#### Scenario: Existing templates remain unchanged

- GIVEN an admin user is authenticated
- WHEN they navigate to `/admin/documents`
- THEN the "Carta Poder" card still displays status "Activo" and links to `/admin/documents/carta-poder`
- AND the "Ubicación del cliente" card still displays status "Activo" and links to `/admin/documents/ubicacion-cliente`
- AND the "Formato CFE" card still displays status "Pendiente" with `href: "#"`

### Requirement: Direct Client Selection Navigation

The client selector on the Carta Poder (`/admin/documents/carta-poder`) and Ubicación del cliente (`/admin/documents/ubicacion-cliente`) template pages MUST navigate directly to the respective template preview when the user selects a client from the dropdown.

The navigation target MUST be `/admin/documents/{template}/preview?clientId=<id>` where `{template}` is `carta-poder` or `ubicacion-cliente` and `<id>` is the selected client's ID.

The selector page MUST NOT display a submit button (for example, "Autollenar plantilla" or "Seleccionar cliente").

The selector page MUST NOT display a confirmation section after client selection.

#### Scenario: Selecting a client in Carta Poder navigates to preview

- GIVEN an admin user is on `/admin/documents/carta-poder`
- WHEN they select a client from the dropdown
- THEN the browser navigates to `/admin/documents/carta-poder/preview?clientId=<selected-id>`
- AND no submit button or confirmation section is present on the page

#### Scenario: Selecting a client in Ubicación del cliente navigates to preview

- GIVEN an admin user is on `/admin/documents/ubicacion-cliente`
- WHEN they select a client from the dropdown
- THEN the browser navigates to `/admin/documents/ubicacion-cliente/preview?clientId=<selected-id>`
- AND no submit button or confirmation section is present on the page

#### Scenario: Default dropdown state shows placeholder

- GIVEN an admin user is on either template selector page
- WHEN the page loads
- THEN the dropdown displays a default placeholder option (for example, "Selecciona un cliente")
- AND no navigation occurs

### Requirement: Back Navigation to Selector

The browser's back button from the preview page MUST return the user to the client selector page for the same template.

Navigation to the preview MUST use `router.push` rather than `router.replace` so the selector page remains in the browser history stack.

#### Scenario: Back button returns to Carta Poder selector

- GIVEN an admin user selected a client on `/admin/documents/carta-poder` and is now on the preview page
- WHEN they press the browser back button
- THEN they return to `/admin/documents/carta-poder` with the dropdown in its default placeholder state

#### Scenario: Back button returns to Ubicación del cliente selector

- GIVEN an admin user selected a client on `/admin/documents/ubicacion-cliente` and is now on the preview page
- WHEN they press the browser back button
- THEN they return to `/admin/documents/ubicacion-cliente` with the dropdown in its default placeholder state

### Requirement: Mobile UX - Two-Tap Flow

The complete flow from selector page to preview MUST require exactly two user interactions on mobile: opening the dropdown and selecting the desired client. No intermediate confirmation step is permitted.

#### Scenario: Mobile flow is select then preview

- GIVEN an admin user is on a template selector page on a mobile device
- WHEN they tap the dropdown and select a client
- THEN the preview page loads directly without any intermediate confirmation UI

### Requirement: Preview Pages Unchanged

The preview pages (`/admin/documents/{template}/preview`) MUST continue to function identically to current behavior. They MUST accept `?clientId=<id>` and display the selected client's data.

No preview page content, layout, data fetching, or client-switching behavior MAY be altered by this change.

#### Scenario: Preview page renders correctly after direct navigation

- GIVEN an admin user navigated directly from the selector to the preview via client selection
- WHEN the preview page loads
- THEN it displays the correct template preview for the selected client
- AND the preview page's existing back link remains functional

### Requirement: Scope Boundary - Affected Templates Only

This direct-navigation behavior applies ONLY to Carta Poder and Ubicación del cliente template pages.

No other template pages, the Descargables index page (`/admin/documents`), client CRUD operations, or route structure MAY be modified by this behavior.

#### Scenario: Descargables index is unaffected

- GIVEN the behavior is deployed
- WHEN an admin navigates to `/admin/documents`
- THEN the index page displays and behaves identically to before the change

#### Scenario: Formato CFE placeholder is unaffected

- GIVEN the behavior is deployed
- WHEN an admin navigates to `/admin/documents`
- THEN the Formato CFE template still displays status "Pendiente" with `href: "#"`
