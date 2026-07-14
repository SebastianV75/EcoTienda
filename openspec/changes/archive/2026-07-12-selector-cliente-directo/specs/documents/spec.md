# Delta for Documents

## ADDED Requirements

### Requirement: Direct Client Selection Navigation

The client selector on the Carta Poder (`/admin/documents/carta-poder`) and Ubicación del cliente (`/admin/documents/ubicacion-cliente`) template pages MUST navigate directly to the respective template preview when the user selects a client from the dropdown.

The navigation target MUST be `/admin/documents/{template}/preview?clientId=<id>` where `{template}` is `carta-poder` or `ubicacion-cliente` and `<id>` is the selected client's ID.

The selector page MUST NOT display a submit button (e.g., "Autollenar plantilla", "Seleccionar cliente").

The selector page MUST NOT display a confirmation section after client selection (the green box with "Abrir vista previa" link).

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
- THEN the dropdown displays a default placeholder option (e.g., "Selecciona un cliente")
- AND no navigation occurs

### Requirement: Back Navigation to Selector

The browser's back button from the preview page MUST return the user to the client selector page for the same template.

Navigation to the preview MUST use `router.push` (not `router.replace`) so the selector page remains in the browser history stack.

#### Scenario: Back button returns to Carta Poder selector

- GIVEN an admin user selected a client on `/admin/documents/carta-poder` and is now on the preview page
- WHEN they press the browser back button
- THEN they return to `/admin/documents/carta-poder` with the dropdown in its default placeholder state

#### Scenario: Back button returns to Ubicación del cliente selector

- GIVEN an admin user selected a client on `/admin/documents/ubicacion-cliente` and is now on the preview page
- WHEN they press the browser back button
- THEN they return to `/admin/documents/ubicacion-cliente` with the dropdown in its default placeholder state

### Requirement: Mobile UX — Two-Tap Flow

The complete flow from selector page to preview MUST require exactly two user interactions on mobile: (1) open the dropdown, (2) tap the desired client. No intermediate confirmation step is permitted.

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
- AND the preview page's existing back link ("Volver a descargables") remains functional

### Requirement: Scope Boundary — Affected Templates Only

This direct-navigation behavior applies ONLY to Carta Poder and Ubicación del cliente template pages.

No other template pages, the Descargables index page (`/admin/documents`), client CRUD operations, or route structure MAY be modified by this change.

#### Scenario: Descargables index is unaffected

- GIVEN the change is deployed
- WHEN an admin navigates to `/admin/documents`
- THEN the index page displays and behaves identically to before the change

#### Scenario: Formato CFE placeholder is unaffected

- GIVEN the change is deployed
- WHEN an admin navigates to `/admin/documents`
- THEN the Formato CFE template still displays status "Pendiente" with `href: "#"`
