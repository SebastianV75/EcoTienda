# Design: Workflow Dashboard

## Technical Approach

Make `/admin` a server-rendered workflow-first landing page: fetch a compact list of active `Trabajo` records, render it above all secondary content on mobile, and keep creation/title editing inside the existing Agenda form flow. This satisfies `workflow-dashboard` and the `admin-home` delta without changing workflow order, Agenda persistence, or downstream stage rules.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|---|---|---|---|
| Active-work source | Reuse summary counts only vs add focused dashboard query | Add focused `getActiveTrabajosForDashboard()` | `/admin` needs per-item workflow state, not only counts. Keep query server-side and shape only title/stage/route data. |
| Title ownership | Add `trabajos.title` vs keep title Agenda-backed | Keep title in `agenda_items.titulo` and merge it into dashboard items | Current create/edit flows already persist `titulo`; this avoids schema churn and keeps Agenda as the editable intake surface. |
| Quick creation entry | Inline dashboard-only action vs route into Agenda create flow | Dashboard CTA opens `/agenda/new?source=admin-dashboard` | Reuses `createAgendaItemAction` invariants and avoids a second creation path. |
| Route display | Derive custom UI per item vs static stage line | Static route from `trabajoStages` with current-stage highlight | Cheap to render, easy to scan, and preserves fixed stage order. |

## Data Flow

`/admin` server page → `getActiveTrabajosForDashboard()`
→ query `trabajos` where `status = 'open'`, ordered by `updated_at desc`
→ second query `agenda_items` for matching ids/titles
→ normalize `ActiveTrabajoDashboardItem { id, title, currentStage, currentStageLabel }`
→ render active list first, then client summary, then module grid.

`/admin` CTA → `/agenda/new?source=admin-dashboard`
→ `AgendaItemForm` shows generated title + manual edit
→ `createAgendaItemAction` persists `trabajos` + `trabajo_agenda_stage` + `agenda_items.titulo`
→ redirect to `/agenda/{id}`; next `/admin` load shows the new title from Agenda.

## File Changes

| File | Action | Description |
|---|---|---|
| `openspec/changes/workflow-dashboard/design.md` | Create | This design artifact. |
| `src/app/admin/page.tsx` | Modify | Replace summary-first layout with active-work-first mobile hierarchy; keep summary/module navigation secondary. |
| `src/features/trabajos/data.ts` | Modify | Add dashboard item query/normalizer that merges `trabajos` with Agenda-backed titles. |
| `src/features/trabajos/dashboard-active-list.tsx` | Create | Minimal active list renderer and empty state for `/admin`. |
| `src/features/trabajos/dashboard-route-line.tsx` | Create | Shared route-line renderer using existing stage constants/labels. |
| `src/features/agenda/agenda-item-form.tsx` | Modify | Add generated/editable title field and optional dashboard-origin copy while preserving existing fields. |
| `src/features/agenda/actions.ts` | Modify | Accept persisted title input and keep bridge `agenda_items.titulo` synchronized on create/update. |
| `src/types/agenda.ts` | Modify | Extend form values with `title`. |
| `src/app/agenda/new/page.tsx` | Modify | Support dashboard origin affordance while reusing existing create flow. |
| `src/app/agenda/[id]/edit/page.tsx` | Modify | Populate editable title defaults from existing Agenda data. |

## Interfaces / Contracts

```ts
type ActiveTrabajoDashboardItem = {
  id: string;
  title: string; // agenda_items.titulo fallback to intake_name
  currentStage: TrabajoStage;
  currentStageLabel: string;
};
```

No new workflow stage, status, or completion contract is introduced.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Title fallback + route-line highlight helpers | Keep helpers pure and cover with lightweight TS tests if a runner is introduced in apply. |
| Integration | `/admin` query shaping, Agenda title persistence on create/edit | Validate with Supabase-backed manual smoke path because the repo currently has no test runner. |
| E2E | Mobile order, empty state, CTA, new item visibility in `/admin` and `/agenda` | Manual viewport walkthrough plus `npm run lint` and `npm run build`. |

## Threat Matrix

N/A — no shell, subprocess, VCS/PR automation, executable-classification, or process-integration boundary. Route content changes stay inside existing Next.js pages and server actions.

## Migration / Rollout

No schema migration required for this slice. Roll out by reusing Agenda title storage and existing `Trabajo`/Agenda creation writes.

## Open Questions

- [ ] None blocking. Keep ordering as `updated_at desc` for this slice; prioritization heuristics stay out of scope.
