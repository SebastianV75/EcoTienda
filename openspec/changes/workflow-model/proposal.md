# Proposal: Workflow Model

## Intent

Shift EcoTienda from client-registry-first to workflow-first. Admins and technicians need to document work as it happens; today the app asks for a reusable client too early and splits Agenda, visits, quotations, sales, and downloadables.

## Scope

### In Scope
- `Trabajo` is the core operational entity.
- Agenda is the entry point: admin captures hour, georeferenced address, work type, assignee, note, and phone.
- Initial client/contact is free text because intake precedes master-client certainty.
- First flow: Agenda -> Visita -> Cotización -> Venta -> Descargables.
- Visita is a rich, conditional, media-heavy survey: execution date, contact, location, utility bill, interest package, quotation type, minisplit branches, house/electrical/roof images and attributes, notes, signature.
- Downloadables belong to the original `Trabajo`, autofill from stage data, and allow overrides before PDF export.

### Out of Scope
- Installation as a first-slice stage.
- Mandatory master client at Agenda time.
- CRM, recurrence, notifications, portal, accounting.
- Full redesign of every document template.

## Capabilities

### New Capabilities
- `workflow-model`: `Trabajo`, stage order, Agenda entry, visit survey ownership, quotation/sale progression, downloadable ownership.

### Modified Capabilities
- `clients`: Master clients are not required to start work.
- `documents`: Source data from `Trabajo` history, not only client selection.
- `navigation`: Prioritize Agenda/Trabajo over Clientes.
- `admin-home`: Show workflow progress, not only client counts.

## Approach

`Trabajo` owns the lifecycle. Stage data accumulates over time. Agenda creates only the first appointment shell. Free-text client capture keeps intake fast while preserving later promotion into a master client.

## Affected Areas

| Area | Impact |
|------|--------|
| `openspec/specs/` | Add workflow model; update affected specs. |
| `app/admin/agenda` | Operational entry point. |
| `app/admin/visits` | Stage survey for `Trabajo`. |
| `app/admin/documents` | Autofill from work data with overrides. |
| `docs/sql` / Supabase | Tables for trabajos, stages, media. |

## Risks

| Risk | Mitigation |
|------|------------|
| CRM overbuild | Free-text intake; defer client promotion. |
| Rigid stages | Ordered stages with extensible payloads. |
| Media-heavy visits | Define upload/storage limits in design. |
| Document conflicts | Overrides over accumulated defaults. |

## Rollback Plan

Remove new `Trabajo` routes/schema and restore Agenda/Documents to prior client or agenda-item flows. Preserve captured records before destructive rollback.

## Dependencies

- Agenda v1, Supabase persistence, Supabase Storage.

## Success Criteria

- [ ] Staff start work from Agenda without a master client.
- [ ] A `Trabajo` progresses through Agenda, Visita, Cotización, Venta, and Descargables.
- [ ] Visit supports rich conditional media capture.
- [ ] Downloadables autofill from work data and allow overrides.
- [ ] Installation remains explicitly deferred.
