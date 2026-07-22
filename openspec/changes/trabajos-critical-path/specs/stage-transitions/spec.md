# Delta for Stage Transitions

## ADDED Requirements

### Requirement: Visita to Cotizacion Transition Action

The system MUST provide `saveTrabajoCotizacionAction` that advances a trabajo from the `visita` stage to the `cotizacion` stage. The action MUST enforce admin role (`requireRole`), verify `canAdvanceTrabajoStage`, and require `isTrabajoVisitaStageComplete` before persisting. On success the action MUST update `trabajos.current_stage` to `cotizacion` and set `visita_completed_at`.

#### Scenario: Admin advances visita to cotizacion

- GIVEN a trabajo in the `visita` stage with the visita form complete
- WHEN the admin submits a valid cotización payload via `saveTrabajoCotizacionAction`
- THEN the action persists the cotización stage data
- AND updates `current_stage` to `cotizacion`
- AND records `visita_completed_at`

#### Scenario: Admin attempts advance with incomplete visita

- GIVEN a trabajo in the `visita` stage with required visita fields missing
- WHEN the admin invokes `saveTrabajoCotizacionAction`
- THEN the action returns a validation error
- AND the trabajo's stage remains `visita`

### Requirement: Cotizacion to Venta Transition Action

The system MUST provide `saveTrabajoVentaAction` that advances a trabajo from the `cotizacion` stage to the `venta` stage. The action MUST enforce admin role, verify `canAdvanceTrabajoStage`, and require `isTrabajoQuotationStageComplete` before persisting. On success the action MUST update `trabajos.current_stage` to `venta` and set `cotizacion_completed_at`.

#### Scenario: Admin confirms venta and advances

- GIVEN a trabajo in the `cotizacion` stage with the quotation stage complete
- WHEN the admin submits a valid venta payload (quotation_trabajo_id, confirmed_on, agreed_amount, notes) via `saveTrabajoVentaAction`
- THEN the action persists the sale stage data
- AND updates `current_stage` to `venta`
- AND records `cotizacion_completed_at`

#### Scenario: Admin tries advancing from incomplete cotizacion

- GIVEN a trabajo in the `cotizacion` stage with `isTrabajoQuotationStageComplete` returning false
- WHEN the admin invokes `saveTrabajoVentaAction`
- THEN the action returns a validation error
- AND the trabajo's stage remains `cotizacion`

### Requirement: Stage Ordering Enforcement

No transition action MUST allow skipping or reverting stages. A transition MUST only succeed when the trabajo's current stage is exactly the prior stage in the critical path.

#### Scenario: Cannot skip a stage

- GIVEN a trabajo whose `current_stage` is `agenda`
- WHEN the admin invokes `saveTrabajoVentaAction` directly
- THEN the action rejects the request because `canAdvanceTrabajoStage` fails
- AND the trabajo's stage remains `agenda`

### Requirement: Admin Only Authorization

Both new transition actions MUST reject requests from non-admin users using the existing `requireRole` admin guard.

#### Scenario: Non-admin user blocked

- GIVEN a non-admin authenticated user
- WHEN the user invokes `saveTrabajoCotizacionAction` or `saveTrabajoVentaAction`
- THEN the action rejects the request with an authorization error