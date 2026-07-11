# Verify Report — Ubicación del cliente

## Status

PASS

## Executive summary

The preview-only slice is implemented in the expected four files, matches the approved spec/design/tasks, respects the scope boundary (no print/PDF UI, no new dependencies), and passes the required validation commands.

One non-blocking inconsistency remains: the documents index hero copy still says ubicación del cliente will be integrated later, even though the template card is already active.

## Structured status

```yaml
schemaName: spec-driven
changeName: ubicacion-cliente
artifactStore: openspec
planningHome:
  root: /home/sebas/Projects/EcoTienda
  changesDir: openspec/changes
changeRoot: openspec/changes/ubicacion-cliente
artifactPaths:
  proposal:
    - openspec/changes/ubicacion-cliente/proposal.md
  specs:
    - openspec/changes/ubicacion-cliente/specs/documents/spec.md
    - openspec/changes/ubicacion-cliente/specs/ubicacion-cliente/spec.md
  design:
    - openspec/changes/ubicacion-cliente/design.md
  tasks:
    - openspec/changes/ubicacion-cliente/tasks.md
  applyProgress:
    - openspec/changes/ubicacion-cliente/apply-progress.md
  verifyReport:
    - openspec/changes/ubicacion-cliente/verify-report.md
  syncReport: []
contextFiles:
  proposal:
    - openspec/changes/ubicacion-cliente/proposal.md
  specs:
    - openspec/changes/ubicacion-cliente/specs/documents/spec.md
    - openspec/changes/ubicacion-cliente/specs/ubicacion-cliente/spec.md
  design:
    - openspec/changes/ubicacion-cliente/design.md
  tasks:
    - openspec/changes/ubicacion-cliente/tasks.md
  applyProgress:
    - openspec/changes/ubicacion-cliente/apply-progress.md
  verifyReport:
    - openspec/changes/ubicacion-cliente/verify-report.md
  syncReport: []
artifacts:
  proposal: done
  specs: done
  design: done
  tasks: done
  applyProgress: done
  verifyReport: done
  syncReport: missing
taskProgress:
  total: 5
  complete: 5
  remaining: 0
  unchecked: []
applyState: all_done
dependencies:
  apply: all_done
  verify: all_done
  sync: blocked
  archive: ready
actionContext:
  mode: repo-local
  workspaceRoot: /home/sebas/Projects/EcoTienda
  allowedEditRoots:
    - /home/sebas/Projects/EcoTienda
  warnings:
    - Parent prompt did not include a native status payload; status reconstructed from OpenSpec artifacts and workspace evidence.
nextRecommended: sdd-archive
isNonAuthoritative: false
```

## Task completion

No unchecked implementation task markers remain in `openspec/changes/ubicacion-cliente/tasks.md`.

## Spec coverage

### Documents index activation

- PASS — `src/app/admin/documents/page.tsx`
- Evidence:
  - Template status is `"Activo"`.
  - Template `href` is `/admin/documents/ubicacion-cliente`.
  - Other pending template (`Formato CFE`) still uses `href: "#"` and `status: "Pendiente"`.
- Warning:
  - The page hero copy still says `"Después se integrarán ubicación del cliente..."`, which is stale now that the template is active.

### Client selector page

- PASS — `src/app/admin/documents/ubicacion-cliente/page.tsx`
- Evidence:
  - Calls `requireRole(["admin"])`.
  - Loads clients with `getClients()`.
  - Uses `AppShell` and mirrors Carta Poder selector structure.
  - Back link points to `/admin/documents`.
  - Preview CTA renders only when `searchParams.clientId` is present.

### Preview page route

- PASS — `src/app/admin/documents/ubicacion-cliente/preview/page.tsx`
- Evidence:
  - Calls `requireRole(["admin"])`.
  - Missing `clientId` renders a recovery card with link back to selector.
  - `getClientById(clientId)` is wrapped in `try/catch`.
  - Invalid/missing client renders friendly fallback with links for `Elegir otro cliente` and `Volver a descargables`.

### Client identity data display

- PASS — `src/features/documents/ubicacion-cliente-preview.tsx`
- Evidence:
  - Renders full name, address, neighborhood, RPU, RFC, latitude, and longitude.
  - `formatField()` returns `Sin dato` for empty/nullish string fields.
  - Latitude/longitude use `toFiniteNumber()` and show `Sin dato` when invalid.

### Embedded non-interactive map

- PASS — `src/features/documents/ubicacion-cliente-preview.tsx`
- Evidence:
  - Builds Google Static Maps URL with `process.env.GOOGLE_MAPS_API_KEY`.
  - Rejects nullish/non-finite/both-zero coordinates.
  - Missing key shows a graceful unavailable state.
  - Invalid/missing coordinates show `Sin coordenadas guardadas...`.
  - Uses plain `<img>`; no interactive map library or iframe behavior.

### Mobile-first layout

- PASS — `src/features/documents/ubicacion-cliente-preview.tsx`
- Evidence:
  - Single-column default with `sm:grid-cols-2` enhancement.
  - Map container uses full-width block classes and no fixed overflow-prone width.
  - Nothing in the new slice suggests horizontal overflow on mobile.
- Note:
  - This was verified statically from the layout code; no browser viewport run was available in this verification environment.

### Navigation back

- PASS
- Evidence:
  - Selector page has `Volver a descargables`.
  - Preview page has `Cambiar cliente` and `Volver a descargables`.

### No print or download UI

- PASS
- Evidence:
  - No `PrintButton` import or usage in the new ubicación-cliente routes.
  - No download/PDF/print UI added.

### Admin authentication

- PASS
- Evidence:
  - Both new routes call `requireRole(["admin"])`.

## Scope boundary findings

- PASS — Preview-only slice respected.
- PASS — No print/PDF UI.
- PASS — No new dependencies detected.
  - Evidence: no changes in `package.json`, `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`.

## Review workload / PR boundary

- PASS — Implemented slice matches the approved single-PR forecast.
- Evidence:
  - Tasks forecast: `Chained PRs recommended: No`, `400-line budget risk: Low`.
  - Approximate diff footprint for this slice: `added=351 deleted=5 total=356`.
  - Only the planned slice was implemented in the expected files.
  - No `size:exception` was needed.

## Validation commands

```bash
npm run lint
npm run build
```

### Results

- `npm run lint`
  - PASS with warning
  - Exact output:
    - `src/features/documents/ubicacion-cliente-preview.tsx:135:7`
    - `@next/next/no-img-element`
  - Assessment: non-blocking because lint returned 0 errors, and the design explicitly chose plain `<img>` to avoid `next/image` domain/config overhead for Google Static Maps.

- `npm run build`
  - PASS
  - Build registered both routes:
    - `/admin/documents/ubicacion-cliente`
    - `/admin/documents/ubicacion-cliente/preview`

## Strict TDD compliance

Not active.

- `openspec/config.yaml` sets `strict_tdd: false`.
- TDD evidence and assertion-quality audit were therefore not required for this change.

## Blockers

None.

## Warnings

1. `src/app/admin/documents/page.tsx` still contains stale hero copy saying ubicación del cliente will be integrated later. This does not break the approved acceptance criteria, but it should be reconciled before archive if the team wants the index copy fully consistent with the now-active template.
