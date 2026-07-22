# Tasks: Workflow Model

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900-1300 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 -> PR 2 -> PR 3 |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Add `Trabajo` schema, types, repos, rules | PR 1 base=`workflow-model` | `npm run build` | N/A - foundation only | `docs/sql/create-trabajos-*.sql`, `src/types/trabajo.ts`, `src/features/trabajos/*` |
| 2 | Create Agenda work-shell + Visita progression | PR 2 base=PR1 | `npm run lint` | Create/edit work in `/agenda` then open `/admin/visits` | `src/features/agenda/*`, `src/app/agenda/**`, `src/app/admin/visits/**` |
| 3 | Attach quotation/docs/dashboard to `Trabajo` compatibly | PR 3 base=PR2 | `npm run build` | Open work-based and client-based document previews | `src/features/documents/*`, `src/app/admin/documents/**`, `src/features/quotations/*`, shell/nav pages |

## Phase 1: Foundation

- [x] 1.1 Add `docs/sql/create-trabajos-*.sql` for `trabajos`, agenda/visita/quotation/sale stage tables, media assets, and document overrides; keep `agenda_items`, `clients`, and `quotations` untouched.
- [x] 1.2 Create `src/types/trabajo.ts` and `src/features/trabajos/{data,rules,defaults}.ts` for stage enums, aggregate contracts, completion checks, advancement gating, and document default composition.
- [ ] 1.3 Verify foundation with unit-style rule coverage in `src/features/trabajos/*.test.ts` if test infra exists; otherwise add build-safe fixtures and run `npm run build`.

## Phase 2: Agenda -> Trabajo -> Visita

- [x] 2.1 Update `src/features/agenda/actions.ts`, `src/types/agenda.ts`, and `src/features/agenda/agenda-item-form.tsx` so Agenda creates a `Trabajo` shell from free-text intake plus a compatibility `agenda_items` bridge.
- [x] 2.2 Update `src/features/agenda/data.ts`, `src/app/agenda/page.tsx`, `src/app/agenda/[id]/page.tsx`, and `src/features/agenda/agenda-item-detail.tsx` to read workflow-backed rows while tolerating legacy agenda records.
- [x] 2.3 Expand `src/app/admin/visits/page.tsx` into work-stage listing and create `src/app/admin/visits/[trabajoId]/page.tsx` plus `src/features/trabajos/visita-form.tsx` for conditional Visita capture and blocked advancement messaging.
- [ ] 2.4 Verify scenarios: intake without master client, missing Agenda data rejection, complete non-minisplit visit, and minisplit branch blocking.

## Phase 3: Quotation, Documents, Workflow UI

- [x] 3.1 Update `src/types/quotation.ts`, `src/features/quotations/{actions,data}.ts`, `docs/quotations-schema.sql`, and quotation pages to persist `trabajo_id` while preserving current quotation detail screens.
- [x] 3.2 Replace client-only selectors with dual-mode selectors in `src/features/documents/client-preview-selector.tsx` and `src/app/admin/documents/{carta-poder,ubicacion-cliente}/**`; load previews by `trabajoId` or `clientId` and persist isolated overrides.
- [x] 3.3 Update `src/app/admin/page.tsx`, `src/components/app-shell.tsx`, `src/components/mobile-bottom-navigation.tsx`, and `src/app/admin/documents/page.tsx` to surface workflow counts, prioritize Agenda, and keep product-facing copy.
- [ ] 3.4 Verify scenarios: sale blocked without quotation, work preview autofill, override isolation, client preview regression, mobile Agenda nav highlight, and empty workflow dashboard state. Runtime proof is still incomplete for the sale-block case.

## Phase 4: Cleanup and rollout guardrails

- [ ] 4.1 Document the temporary compatibility path in `docs/development-plan.md` or a workflow note: `agenda_items` bridge, optional late `client_id`, and supported `trabajoId` templates.
- [ ] 4.2 Before each chained apply slice, re-check diff size against the 400-line budget and keep tests/docs with the behavior slice they verify.
