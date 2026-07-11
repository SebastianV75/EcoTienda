# Delta for Documents

## MODIFIED Requirements

### Requirement: Documents Index Template Entries

The documents index page (`/admin/documents`) MUST display each template with its current status and a navigable link. When a template is active, its `href` MUST point to the template's route. When a template is pending, its `href` MUST be `"#"` and the status label MUST read "Pendiente".

The "Ubicación del cliente" template entry MUST have status "Activo" and `href` set to `/admin/documents/ubicacion-cliente`.

(Previously: "Ubicación del cliente" had status "Pendiente" and `href: "#"`)

#### Scenario: Admin sees ubicación del cliente as active

- GIVEN an admin user is authenticated
- WHEN they navigate to `/admin/documents`
- THEN the "Ubicación del cliente" card displays status "Activo"
- AND the card links to `/admin/documents/ubicacion-cliente`

#### Scenario: Other pending templates remain unchanged

- GIVEN an admin user is authenticated
- WHEN they navigate to `/admin/documents`
- THEN all other templates with status "Pendiente" still display `href: "#"` and are not navigable
