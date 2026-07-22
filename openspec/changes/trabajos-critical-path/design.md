# Design: Trabajos Section with Critical Path

## Technical Approach

Add a first-class "Trabajos" section to the EcoTienda admin panel, delivered in two waves. Wave 1 ships navigation entries + a filterable card list. Wave 2 adds a unified detail view with stage timeline, the two missing server actions (`visita → cotización`, `cotización → venta`), and the venta form UI.

The design reuses the existing data normalization patterns from `src/features/trabajos/data.ts`, the stage-advancement pattern from `saveTrabajoVisitaAction`, and the navigation item structure from `app-shell.tsx`.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| List data query | New `getTrabajosForList()` with a lightweight select (no stage joins) | Reuse `getTrabajosForDocumentSelection` | The document selection query lacks `created_at` ordering and client join needed for cards. A dedicated query keeps concerns separated. |
| Detail data query | Extend `trabajoDocumentSelect` pattern into `getTrabajoDetailById()` adding `quotations` join | Build a new select from scratch | The document select already joins all 4 stage tables + client + media. Adding a `quotations` left-join is minimal. |
| Filter strategy | Server-side filtering via Supabase query params | Client-side filtering on full dataset | Trabajos will grow; server-side filtering scales. URL search params drive filter state for shareability. |
| Cotización form | Reuse existing quotation data from `trabajo_quotation_stage` + link `quotations` rows read-only | Build a new quotation form | The quotation stage data is already persisted by the visit workflow. The detail view displays it; no new form needed for Wave 2. |
| Mobile nav placement | Add "Trabajos" as 4th primary item in bottom bar | Move to "Más" sheet | Trabajos is the operational hub — it deserves primary placement. 4 items + Más still fits comfortably. |
| Stage advancement helper | Extract `advanceTrabajoStage()` shared function from `saveTrabajoVisitaAction` | Duplicate logic in each action | Three actions now share the snapshot → upsert → advance → revalidate pattern. DRY. |

## Data Flow

```
List page (server component):
  getTrabajosForList(filters?) ──→ Supabase ──→ normalize ──→ TrabajoCard[]
       ↑                                                         │
       └─── revalidatePath("/admin/trabajos") ←── server action  │
                                                                 ↓
                                                    Link → /admin/trabajos/[id]

Detail page (server component):
  getTrabajoDetailById(id) ──→ Supabase ──→ normalize ──→ TrabajoDetailRecord
       │                                                      │
       ├── TrabajoTimeline (client, presentational)            │
       ├── TrabajoStageSection × 5 (server, data display)      │
       └── VentaForm (client, useActionState) ──→ action ──→ revalidate
```

## Route Structure

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/admin/trabajos` | `src/app/admin/trabajos/page.tsx` | Server page | Card list with filters |
| `/admin/trabajos/[id]` | `src/app/admin/trabajos/[id]/page.tsx` | Server page | Unified detail view |

**Query params for list**: `?stage=visita&status=open&from=2025-01-01&to=2025-12-31&q=garcia`

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/admin/trabajos/page.tsx` | Create | List page — calls `getTrabajosForList`, renders filters + card grid |
| `src/app/admin/trabajos/[id]/page.tsx` | Create | Detail page — calls `getTrabajoDetailById`, renders timeline + sections |
| `src/features/trabajos/components/trabajo-card.tsx` | Create | Card component for list view |
| `src/features/trabajos/components/trabajo-list-filters.tsx` | Create | Client component: filter bar with stage/status/date/search |
| `src/features/trabajos/components/trabajo-timeline.tsx` | Create | 5-stage progress indicator |
| `src/features/trabajos/components/trabajo-stage-section.tsx` | Create | Collapsible section rendering one stage's data |
| `src/features/trabajos/components/venta-form.tsx` | Create | Client form for the venta stage using `useActionState` |
| `src/features/trabajos/data.ts` | Modify | Add `getTrabajosForList()` and `getTrabajoDetailById()` |
| `src/features/trabajos/actions.ts` | Modify | Add `saveTrabajoCotizacionAction`, `saveTrabajoVentaAction`, extract `advanceTrabajoStage()` helper |
| `src/components/app-shell.tsx` | Modify | Add "Trabajos" to `workflowNavigation` array |
| `src/components/mobile-bottom-navigation.tsx` | Modify | Add "Trabajos" to `primaryMobileNavigationByRole.admin` |

## Interfaces / Contracts

### New data types

```typescript
// In data.ts
export type TrabajoListFilters = {
  stage?: TrabajoStage;
  status?: TrabajoStatus;
  from?: string;   // ISO date
  to?: string;     // ISO date
  q?: string;      // search term
};

export type TrabajoListItem = {
  id: string;
  current_stage: TrabajoStage;
  status: TrabajoStatus;
  intake_name: string;
  intake_address_text: string;
  created_at: string;
  client_name: string | null;
  agenda_stage: Pick<TrabajoAgendaStage, "work_type"> | null;
};

export type TrabajoDetailRecord = Trabajo & {
  agenda: TrabajoAgendaStage | null;
  visita: TrabajoVisitaStage | null;
  cotizacion: TrabajoQuotationStage | null;
  venta: TrabajoSaleStage | null;
  client: TrabajoDocumentClient | null;
  media_assets: TrabajoMediaAsset[];
  linked_quotations: LinkedQuotation[] | null;
};
```

### Component props

```typescript
type TrabajoCardProps = {
  trabajo: TrabajoListItem;
};

type TrabajoListFiltersProps = {
  initialFilters: TrabajoListFilters;
};

type TrabajoTimelineProps = {
  currentStage: TrabajoStage;
  completedStages: Partial<Record<TrabajoStage, string | null>>;
};

type TrabajoStageSectionProps = {
  stage: TrabajoStage;
  data: unknown;         // stage-specific data or null
  isCurrent: boolean;
  isCompleted: boolean;
  children?: ReactNode;  // advancement form slot
};

type VentaFormProps = {
  trabajoId: string;
  quotationTrabajoId: string;
};
```

### Server action signatures

```typescript
export type CotizacionActionState = { error: string | null; success: string | null };
export type VentaActionState = { error: string | null; success: string | null };

export async function saveTrabajoCotizacionAction(
  prevState: CotizacionActionState, formData: FormData
): Promise<CotizacionActionState>;

export async function saveTrabajoVentaAction(
  prevState: VentaActionState, formData: FormData
): Promise<VentaActionState>;
```

## Server Actions Design

### Shared helper: `advanceTrabajoStage()`

Extracted from `saveTrabajoVisitaAction`. Takes: `supabase`, `trabajoId`, `currentStage`, `nextStage`, `completionField`, `stagePayload`, `revalidatePaths[]`. Handles: snapshot → validate `canAdvanceTrabajoStage` → upsert stage → update `trabajos.current_stage` → set completion timestamp → revalidate → redirect.

### `saveTrabajoCotizacionAction`

1. `requireRole(["admin"])`
2. Validate form fields: `trabajo_id`, `scope_summary`, `amount`, `terms_and_conditions`, `outcome`, `quotation_type`
3. Fetch trabajo → verify `canAdvanceTrabajoStage(current, "cotizacion", isTrabajoVisitaStageComplete(visita))`
4. Upsert `trabajo_quotation_stage` with `completed_at`
5. Update `trabajos.current_stage = "cotizacion"`, set `visita_completed_at`
6. `revalidatePath("/admin/trabajos")`, `revalidatePath(/admin/trabajos/${id})`

### `saveTrabajoVentaAction`

1. `requireRole(["admin"])`
2. Validate form fields: `trabajo_id`, `quotation_trabajo_id`, `confirmed_on`, `agreed_amount`, `notes`
3. Fetch trabajo → verify `canAdvanceTrabajoStage(current, "venta", isTrabajoQuotationStageComplete(cotizacion))`
4. Upsert `trabajo_sale_stage` with `completed_at`
5. Update `trabajos.current_stage = "venta"`, set `cotizacion_completed_at`
6. `revalidatePath("/admin/trabajos")`, `revalidatePath(/admin/trabajos/${id})`

## Navigation Changes

### `app-shell.tsx`

Add to `workflowNavigation` array (after Visitas):

```typescript
{ href: "/admin/trabajos", label: "Trabajos", roles: ["admin"], icon: Briefcase }
```

Import `Briefcase` from `reicon-react`.

### `mobile-bottom-navigation.tsx`

Add to `primaryMobileNavigationByRole.admin` array (after Visitas):

```typescript
{ href: "/admin/trabajos", label: "Trabajos", icon: Briefcase }
```

Active route detection: the existing `isActive()` function already handles prefix matching (`pathname.startsWith("/admin/trabajos/")`), so both `/admin/trabajos` and `/admin/trabajos/[id]` will highlight correctly.

## State Management

| State | Location | Mechanism |
|-------|----------|-----------|
| List filters (stage, status, date, search) | URL search params | `useSearchParams()` in client filter component; server page reads params |
| Expanded/collapsed stage sections | Client component state | `useState<Set<TrabajoStage>>` in detail page wrapper |
| Venta form state | Client component | `useActionState(saveTrabajoVentaAction, initialState)` |
| Cotización form state | Client component | `useActionState(saveTrabajoCotizacionAction, initialState)` |
| Trabajo data | Server component | React `cache()` via data functions; revalidated by actions |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `advanceTrabajoStage()` helper — snapshot, rollback, error paths | Vitest with mocked Supabase client |
| Unit | `saveTrabajoCotizacionAction` validation — missing fields, bad stage | Vitest with mocked `requireRole` and Supabase |
| Unit | `saveTrabajoVentaAction` validation — same pattern | Vitest |
| Unit | Filter query building — correct Supabase filters from `TrabajoListFilters` | Vitest pure function tests |
| Integration | List page renders cards with correct data | Playwright or RTL with mocked data functions |
| Integration | Detail page shows all 5 stage sections | Playwright or RTL |
| Integration | Stage advancement end-to-end (visita → cotización → venta) | Playwright with seeded DB |
| E2E | Full critical path: create agenda → visita → cotización → venta | Playwright happy path |

## Delivery Strategy

### Wave 1 — Navigation + List (low risk)

1. Add "Trabajos" to sidebar (`app-shell.tsx`) and mobile nav (`mobile-bottom-navigation.tsx`)
2. Create `getTrabajosForList()` data function with filter support
3. Create `/admin/trabajos` page with `TrabajoCard` grid and `TrabajoListFilters`
4. Cards link to `/admin/trabajos/[id]` (placeholder detail page)

### Wave 2a — Detail View + Timeline

1. Create `getTrabajoDetailById()` data function (extends document select + quotations join)
2. Create `/admin/trabajos/[id]` page with `TrabajoTimeline` and `TrabajoStageSection`
3. Display-only: all stages show data or "Pendiente" placeholder

### Wave 2b — Missing Actions + Venta Form

1. Extract `advanceTrabajoStage()` helper from `saveTrabajoVisitaAction`
2. Implement `saveTrabajoCotizacionAction` and `saveTrabajoVentaAction`
3. Create `VentaForm` client component with `useActionState`
4. Wire advancement buttons into `TrabajoStageSection` children slot

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Open Questions

- [ ] **Icon choice**: `Briefcase` from `reicon-react` is proposed; verify it exists in the icon set. Fallback: `Clipboard` (already imported).
- [ ] **Cotización form in detail view**: the spec says "show scope, amount, terms, outcome, quotation type" — this is display-only since quotation data is filled during the visit workflow. Confirm no separate cotización entry form is needed.
- [ ] **Descargables section**: display document download links from existing `/admin/documents/trabajos` output. No completion logic needed.
