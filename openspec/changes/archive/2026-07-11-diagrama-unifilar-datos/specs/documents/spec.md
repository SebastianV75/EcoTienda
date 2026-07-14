# Delta for Documents

## ADDED Requirements

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
