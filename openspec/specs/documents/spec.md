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
