# Archive Report — Ubicación del cliente

**Archive status:** PASS

The `ubicacion-cliente` change is complete for its approved preview-only slice, has passed verification, and is fully synced into canonical specs. The change is now closed.

## Quick path

1. Proposal approved → slice scoped to preview-only (no print/PDF).
2. Spec written with two domains: `documents` (delta) and `ubicacion-cliente` (full).
3. Design approved → static map via Google Static Maps `<img>`, no new dependencies, `requireRole(["admin"])` on both routes.
4. Five tasks implemented across four files.
5. `npm run lint` and `npm run build` pass; verify-report PASS.
6. Sync completed: both canonical specs created under `openspec/specs/`.
7. Archive report written:
   - File created before move: `openspec/changes/ubicacion-cliente/archive-report.md`
   - Moved to: `openspec/changes/archive/2026-07-10-ubicacion-cliente/`

## Artifacts read at archive time

| Artifact | Location | Found |
|----------|----------|-------|
| proposal | `openspec/changes/ubicacion-cliente/proposal.md` | ✓ |
| spec (documents delta) | `openspec/changes/ubicacion-cliente/specs/documents/spec.md` | ✓ |
| spec (ubicacion-cliente full) | `openspec/changes/ubicacion-cliente/specs/ubicacion-cliente/spec.md` | ✓ |
| design | `openspec/changes/ubicacion-cliente/design.md` | ✓ |
| tasks | `openspec/changes/ubicacion-cliente/tasks.md` | ✓ |
| apply-progress | `openspec/changes/ubicacion-cliente/apply-progress.md` | ✓ |
| verify-report | `openspec/changes/ubicacion-cliente/verify-report.md` | ✓ |
| sync-report | `openspec/changes/ubicacion-cliente/sync-report.md` | ✓ |
| config | `openspec/config.yaml` | ✓ |
| canonical `documents` spec | `openspec/specs/documents/spec.md` | ✓ |
| canonical `ubicacion-cliente` spec | `openspec/specs/ubicacion-cliente/spec.md` | ✓ |

## Validation status

| Gate | Status | Evidence |
|------|--------|----------|
| Verify report status | PASS | All acceptance criteria for the seven top-level requirements PASS; no FAIL, BLOCKED, or CRITICAL findings |
| Lint | PASS (1 warning, non-blocking) | `@next/next/no-img-element` — intentional per design; plain `<img>` chosen to avoid `next/image` domain config for Google Static Maps |
| Build | PASS | Both routes registered: `/admin/documents/ubicacion-cliente` and `/admin/documents/ubicacion-cliente/preview` |
| TDD | Not required | `openspec/config.yaml` sets `strict_tdd: false` |
| Scope boundary | PASS | No `PrintButton`, download/PDF/print UI, or new dependencies added |

## Tasks completion

Final task completion gate re-checked immediately before this archive report was written.

- Total tasks: 5
- Tasks with `- [x]`: 5
- Tasks with `- [ ]`: 0
- Stale-checkbox reconciliation needed: No
- Mechanical checkbox repair applied: No

All five implementation tasks are marked complete in the persisted `tasks.md` artifact. No unchecked `- [ ]` implementations remain.

| # | Task | Status | Files touched |
|---|------|--------|--------------|
| 1 | Activate template entry on documents index | ✓ | `src/app/admin/documents/page.tsx` |
| 2 | Client selector route | ✓ | `src/app/admin/documents/ubicacion-cliente/page.tsx` (new) |
| 3 | Preview presentation component with field/map fallbacks | ✓ | `src/features/documents/ubicacion-cliente-preview.tsx` (new) |
| 4 | Admin preview route with graceful error handling | ✓ | `src/app/admin/documents/ubicacion-cliente/preview/page.tsx` (new) |
| 5 | Project safety-net validation | ✓ | lint + build commands |

## Canonical spec sync

Sync completed and confirmed by reading `sync-report.md`. Both canonical spec files were verified to exist on disk immediately before this archive report was written.

### Sync timing

- The sync report was already successful before archive began (no archive-time sync fallback was used).
- No parent-prompt approval for archive-time sync fallback was required because the canonical specs were already synced by a prior `sdd-sync` run.

### Domains synced

| Domain | Canonical file | Status | Operation |
|--------|----------------|--------|-----------|
| documents | `openspec/specs/documents/spec.md` | created | ADDED (new canonical from a MODIFIED delta; encoded as current-state canonical) |
| ubicacion-cliente | `openspec/specs/ubicacion-cliente/spec.md` | created | ADDED (full spec copied as-is) |

### Requirements operation log

| Domain | Operation | Requirement name |
|--------|-----------|------------------|
| documents | ADDED (as encoded canonical) | Documents Index Template Entries |
| ubicacion-cliente | ADDED | Client Selector Page |
| ubicacion-cliente | ADDED | Preview Page Route |
| ubicacion-cliente | ADDED | Client Identity Data Display |
| ubicacion-cliente | ADDED | Embedded Map |
| ubicacion-cliente | ADDED | Mobile-First Layout |
| ubicacion-cliente | ADDED | Navigation Back |
| ubicacion-cliente | ADDED | No Print or Download |
| ubicacion-cliente | ADDED | Admin Authentication |

### REMOVED / RENAMED requirements

None.

### Destructive merge approvals

Not required. No REMOVED requirements, no large MODIFIED blocks, no RENAMED requirements were applied during sync.

### Sync edge case: MODIFIED delta with no canonical base

The `documents` domain change spec was a MODIFIED delta against a canonical spec that did not yet exist. The sync resolution encoded the post-change state directly into the new canonical `openspec/specs/documents/spec.md`, dropping the `## MODIFIED` framing and the `(Previously: ...)` note. This trade-off means the canonical spec currently contains only the one requirement touched by this change; additional documents-domain requirements (e.g., other templates, PDF generation) will be added by future change deltas against the now-existing canonical base.

## Active same-domain change warnings

No active changes other than `ubicacion-cliente` exist under `openspec/changes/`. No same-domain collisions.

## Non-critical partial archive or stale-checkbox reconciliation

Not applicable. This is a full, clean archive for the approved slice. No stale-checkbox reconciliation was required; no unchecked implementation tasks were found.

## Known follow-ups (non-blocking)

These are tracked as future work and do NOT block archive.

1. **Stale hero copy on documents index** — `src/app/admin/documents/page.tsx` still contains hero copy stating "Después se integrarán ubicación del cliente...", which is inconsistent with the now-active template. This was flagged in the verify-report as a non-blocking warning. It does not violate any approved acceptance criterion for this slice. Recommend a small follow-up commit to refresh the hero copy.
2. **Documents domain canonical spec is minimal** — The new `openspec/specs/documents/spec.md` contains only the requirement touched by this change. Other document templates and the PDF/print generation flow are not yet captured as canonical requirements. They can be added incrementally by future change deltas when those areas are touched.
3. **Out-of-scope later slices** (carried from the proposal/design):
   - Printable / downloadable PDF document.
   - `PrintButton` integration in the preview route.
   - Interactive map (drag, zoom, re-pin).
   - Map screenshot or snapshot capture.
   - CFE format template.
   - Any changes to client create/edit flows.

## Action context findings

| Field | Value |
|-------|-------|
| mode | repo-local |
| workspaceRoot | /home/sebas/Projects/EcoTienda |
| allowedEditRoots | /home/sebas/Projects/EcoTienda |
| archive paths inside workspace | Yes |
| move targets inside workspace | Yes |
| ambiguous selection | No |
| missing change | No |
| skill_resolution | paths-injected |

## Rollback / undo

- No database or schema changes were made; zero migration risk.
- Revert the documents index template entry back to `status: "Pendiente"` and `href: "#"`.
- Remove `src/app/admin/documents/ubicacion-cliente/` and `src/features/documents/ubicacion-cliente-preview.tsx`.

## Archive move

- Source: `openspec/changes/ubicacion-cliente/`
- Destination: `openspec/changes/archive/2026-07-10-ubicacion-cliente/`
- Date used: today's ISO date (2026-07-10).
- Audit trail preserved: no active artifacts were deleted or modified silently.

## Skill resolution

- **paths-injected**: `/home/sebas/.config/opencode/skills/cognitive-doc-design/SKILL.md` and `/home/sebas/.pi/agent/npm/node_modules/gentle-pi/skills/gentle-ai/SKILL.md` were loaded before work.
- cognitive-doc-design patterns applied: answer-first lead-in, progressive disclosure in sections, tables for recognition over recall, reviewer empathy via checklist-style sections.

## Memory observations

Not applicable (artifact store mode is `openspec`, not `engram` or `both`).
