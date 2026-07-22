# Delta for Trabajo Detail

## ADDED Requirements

### Requirement: Unified Trabajo Detail View

The system MUST provide a `/admin/trabajos/[id]` route that shows a stage timeline and one section per stage. The timeline MUST render all five stages (agenda, visita, cotizacion, venta, descargables) with the current stage highlighted. Each stage section MUST show its completed data or a "Pendiente" placeholder when not yet filled.

#### Scenario: Admin opens a trabajo mid-flow

- GIVEN a trabajo whose `current_stage` is `visita`
- WHEN the admin opens `/admin/trabajos/[id]`
- THEN the timeline highlights `visita`
- AND the agenda section shows its completed data
- AND the visita section shows a "Pendiente" or in-progress state

#### Scenario: All stages completed

- GIVEN a fully completed trabajo
- WHEN the admin opens the detail view
- THEN every stage section shows its filled data and the timeline marks all five stages as done

### Requirement: Stage Section Contents

The agenda section MUST show appointment date, work type, assignee, contact, address, and a map link. The visita section MUST show all form responses from whichever visita form was filled. The cotización section MUST show scope, amount, terms, outcome, and quotation type. The venta section MUST show confirmed date, agreed amount, and notes. The descargables section MUST list downloadable documents for the trabajo.

#### Scenario: Admin views descargables section

- GIVEN a trabajo with generated documents
- WHEN the admin opens the detail view descargables section
- THEN every eligible document for this trabajo is listed with a download link

### Requirement: Stage Advancement Actions

The detail view MUST present a stage advancement action only when the prerequisites for the next stage are met. Advancing MUST call the corresponding server action (see stage-transitions spec).

#### Scenario: Admin completes visita and advances

- GIVEN a trabajo in the `visita` stage with the visita form complete
- WHEN the admin submits the cotización form
- THEN the trabajo advances to the `cotización` stage and the timeline updates

### Requirement: Return to List Navigation

The detail view MUST provide a "Volver a Trabajos" link navigating to `/admin/trabajos`.

#### Scenario: Admin returns to the list

- GIVEN the admin is on `/admin/trabajos/[id]`
- WHEN the admin clicks "Volver a Trabajos"
- THEN the application navigates to `/admin/trabajos`