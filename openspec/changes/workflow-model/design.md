# Design: Workflow Model

## Technical Approach

Introduce a workflow-first domain anchored on `Trabajo`, while keeping current client, agenda, quotation, and document routes operational during transition. `Trabajo` becomes the durable master record; stage-specific tables store required payloads for Agenda, Visita, Cotización, Venta, and document overrides. Existing client-based flows remain valid as compatibility paths until UI and documents are re-pointed to `Trabajo`.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|---|---|---|---|
| Core aggregate | Keep `agenda_items` as master vs new `trabajos` root | New `trabajos` root | `agenda_items` is schedule-centric and tied to optional `client_id`; the spec needs durable workflow ownership across later stages. |
| Stage storage | One JSON blob vs per-stage tables | `trabajos` + per-stage tables with structured payload columns and selective JSON | Keeps progression enforceable, supports reporting, and allows conditional Visita/media data without over-normalizing the first slice. |
| Progress state | Infer from available rows vs explicit stage pointer | Explicit `current_stage` + completion metadata | Simpler gating, dashboard counts, and migration coexistence; avoids guessing from partial downstream rows. |
| Client relationship | Force client creation vs optional late association | Preserve free-text intake and optional `client_id` on `trabajos` | Matches proposal and avoids blocking intake before CRM certainty. |
| Document source | Keep client-only previews vs dual source | Dual-mode previews: `clientId` compatibility + `trabajoId` preferred path | Lets current documents keep working while new work-owned defaults roll in incrementally. |

## Data Flow

`Agenda form` → create `trabajos` row (`current_stage=agenda`) + `trabajo_agenda_stage`
→ optional later `trabajo_visita_stage`
→ `trabajo_quotation_stage`
→ `trabajo_sale_stage`
→ document default composer reads accumulated stage data
→ optional `trabajo_document_overrides` per template/export.

Stage advancement writes only the next allowed stage and updates `trabajos.current_stage` after validating the current stage completion contract.

## File Changes

| File | Action | Description |
|---|---|---|
| `docs/sql/create-trabajos-*.sql` | Create | New `trabajos`, stage tables, document override table, and media reference tables. |
| `src/types/trabajo.ts` | Create | Workflow enums, aggregate types, stage payload contracts. |
| `src/features/trabajos/*` | Create | Data access, progression rules, and default-composition helpers. |
| `src/features/agenda/actions.ts` | Modify | Agenda creation writes `Trabajo` shell first, then compatibility fields. |
| `src/features/agenda/data.ts` | Modify | Agenda lists hydrate from `trabajos`/agenda stage while tolerating legacy `agenda_items`. |
| `src/app/agenda/**` | Modify | Workflow-first labels and detail views around `Trabajo`. |
| `src/app/admin/visits/**` | Expand | Real Visita capture/edit flow instead of agenda-type listing only. |
| `src/features/documents/*` and `src/app/admin/documents/**` | Modify | Support `trabajoId`, defaults composer, and isolated overrides. |
| `src/app/admin/page.tsx`, `src/components/app-shell.tsx`, `src/components/mobile-bottom-navigation.tsx` | Modify | Workflow-first dashboard and navigation prioritization. |
| `src/features/quotations/*`, `src/types/quotation.ts`, `docs/quotations-schema.sql` | Modify | Attach quotations to `Trabajo` while keeping existing quotation detail flows. |

## Interfaces / Contracts

```ts
type TrabajoStage = "agenda" | "visita" | "cotizacion" | "venta" | "descargables";

type Trabajo = {
  id: string;
  currentStage: TrabajoStage;
  status: "open" | "won" | "lost" | "archived";
  intakeName: string;
  intakePhone: string;
  intakeAddressText: string;
  intakeLatitude: number | null;
  intakeLongitude: number | null;
  clientId: string | null;
};
```

Visita lives in `trabajo_visita_stage` plus `trabajo_media_assets`. Conditional branches use nullable groups plus validation rules: minisplit fields are required only when quotation type is minisplit; mufa-related media/flags are required only when that condition is selected. Media rows store `trabajo_id`, `stage`, `kind`, storage path, mime, size, and capture metadata; stage payload stores references, not binaries.

Cotización and Venta attach by `trabajo_id` foreign key. Descargables compute defaults from the latest completed stage snapshots; overrides persist per `trabajo_id + template + export instance` and never mutate stage tables.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Stage completion and advancement rules; document default composer | Pure TypeScript rule tests. |
| Integration | Agenda creates `Trabajo`; Visita gating; quotation/sale attachment; document override isolation | Supabase-backed repository tests or route/server-action integration tests. |
| E2E | Workflow-first happy path and legacy client/doc preview compatibility | Browser flow covering Agenda → Trabajo detail → work-based preview, plus existing `clientId` preview regression. |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No destructive migration in slice one. Add new workflow tables beside `clients`, `agenda_items`, and `quotations`. Treat current client-centric pages as compatibility surfaces. First rollout should support: (1) creating new `Trabajo` records from Agenda, (2) reading old client/doc flows unchanged, and (3) progressively switching dashboard/navigation/doc selectors to prefer `Trabajo` when present.

## Open Questions

- [ ] Confirm whether legacy `agenda_items` should become a compatibility projection over `trabajo_agenda_stage` or remain a separately written bridge during transition.
- [ ] Confirm initial supported downloadable templates for `trabajoId` flow beyond Carta Poder and Ubicación del cliente.
