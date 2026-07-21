# Proposal: Workflow Dashboard

## Intent

Make `/admin` a mobile-first workflow surface centered on active `Trabajo` records. The current home still behaves like a client-centric overview: counters and generic cards appear before the operator sees what work needs movement. This hides the real daily question: which jobs are active, where are they in the route, and what should be started next?

## Scope

### In Scope
- Above-the-fold active work list on mobile, before summary metrics.
- Active work item row/card showing only title, current stage, and route line: `Agenda → Visita → Cotización → Venta → Descargables`.
- Editable `Trabajo` title generated from Agenda intake defaults.
- Visible dashboard CTA for quick new-work creation that also registers the Agenda entry.
- Secondary placement for summary metrics and existing operational context.

### Out of Scope
- Replacing full Agenda calendar/list behavior.
- Adding Installation, CRM automation, notifications, or reporting dashboards.
- Redesigning document, quotation, or visit capture flows.
- Changing workflow stage order or stage completion rules.

## Capabilities

### New Capabilities
- `workflow-dashboard`: mobile-first active `Trabajo` dashboard, route-line display, quick work creation entry, and title-generation/edit behavior.

### Modified Capabilities
- `admin-home`: demote counters to secondary context and prioritize active work above the fold.

## Approach

Use existing `Trabajo` stage data as the dashboard source. Add a focused active-work query/view model, then render a compact mobile-first list before metrics. The route line matters operationally because it gives staff a shared map of the job path without forcing them to infer state from separate Agenda, Visita, Cotización, Venta, or Descargables screens. Quick creation belongs here because the dashboard is the operator’s launch point; creating from it must still write the Agenda-backed start of the workflow, not bypass intake.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `openspec/specs/admin-home/spec.md` | Modified | Home hierarchy changes from client/counter-first to active-work-first. |
| `openspec/specs/workflow-dashboard/spec.md` | New | Defines active list, route line, title behavior, and quick creation. |
| `src/app/admin/page.tsx` | Modified | Dashboard layout and above-the-fold priority. |
| `src/features/trabajos/*` | Modified | Active work data/view model and title behavior. |
| `src/features/agenda/*` | Modified | Quick creation must create/register the Agenda stage. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Overloading the mobile dashboard | Med | Limit item content to title, stage, and route line. |
| Quick creation bypasses Agenda invariants | Med | Reuse Agenda-backed creation rules. |
| Metrics lose discoverability | Low | Keep metrics visible but below active work. |
| Title generation is confusing | Low | Generate from Agenda defaults and allow edit. |

## Rollback Plan

Restore `/admin` to the previous summary-first layout and remove the quick creation entry. Keep existing `Trabajo` and Agenda records because this slice should not require destructive schema rollback.

## Dependencies

- Existing workflow tables and Agenda-backed `Trabajo` creation.
- Existing mobile shell and design tokens.

## Success Criteria

- [ ] Mobile `/admin` shows active work before summary metrics.
- [ ] Each active item shows only title, current stage, and route line.
- [ ] Dashboard quick creation creates a `Trabajo` and registers Agenda data.
- [ ] Generated titles are editable.
- [ ] Client-centric metrics remain secondary, not primary.
