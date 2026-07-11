# Sync Report — Ubicación del cliente

## Status

**synced**

## Executive summary

Synced two domain specs from the `ubicacion-cliente` change into canonical OpenSpec specs under `openspec/specs/`. Both canonical specs did not exist previously and were created fresh.

The `documents` domain presented an edge case: the change spec was a MODIFIED delta with no existing canonical base. The delta was converted into a self-standing canonical requirement representing the current (post-change) state. The `ubicacion-cliente` domain spec was a full, non-delta spec and was copied as-is.

## Structured status

```yaml
schemaName: spec-driven
changeName: ubicacion-cliente
artifactStore: openspec
syncPhase: sync
artifactPaths:
  proposal: openspec/changes/ubicacion-cliente/proposal.md
  specs:
    - openspec/changes/ubicacion-cliente/specs/documents/spec.md
    - openspec/changes/ubicacion-cliente/specs/ubicacion-cliente/spec.md
  design: openspec/changes/ubicacion-cliente/design.md
  tasks: openspec/changes/ubicacion-cliente/tasks.md
  applyProgress: openspec/changes/ubicacion-cliente/apply-progress.md
  verifyReport: openspec/changes/ubicacion-cliente/verify-report.md
  syncReport: openspec/changes/ubicacion-cliente/sync-report.md
canonicalSpecsCreated:
  - openspec/specs/documents/spec.md
  - openspec/specs/ubicacion-cliente/spec.md
actionContext:
  mode: repo-local
  workspaceRoot: /home/sebas/Projects/EcoTienda
  allowedEditRoots:
    - /home/sebas/Projects/EcoTienda
nextRecommended: sdd-archive
```

## Domains synced

| Domain | Status | Canonical file |
|--------|--------|----------------|
| documents | created | `openspec/specs/documents/spec.md` |
| ubicacion-cliente | created | `openspec/specs/ubicacion-cliente/spec.md` |

## Requirements synced

### documents

| Requirement | Operation | Detail |
|-------------|-----------|--------|
| Documents Index Template Entries | ADDED (as encoded canonical) | Initiated canonical spec from MODIFIED delta — see Edge Cases section |

### ubicacion-cliente

| Requirement | Operation | Detail |
|-------------|-----------|--------|
| Client Selector Page | ADDED | Copied from change spec as-is |
| Preview Page Route | ADDED | Copied from change spec as-is |
| Client Identity Data Display | ADDED | Copied from change spec as-is |
| Embedded Map | ADDED | Copied from change spec as-is |
| Mobile-First Layout | ADDED | Copied from change spec as-is |
| Navigation Back | ADDED | Copied from change spec as-is |
| No Print or Download | ADDED | Copied from change spec as-is |
| Admin Authentication | ADDED | Copied from change spec as-is |

## Active same-domain collisions

None. Only the `ubicacion-cliente` change exists in `openspec/changes/`.

## Destructive sync approvals

Not required. No REMOVED requirements, no large MODIFIED blocks, no RENAMED requirements.

## Edge cases

### documents MODIFIED delta with no canonical base

**Problem**: The change spec at `openspec/changes/ubicacion-cliente/specs/documents/spec.md` is a MODIFIED delta (format: `## MODIFIED Requirements`). It modifies the "Documents Index Template Entries" requirement to reflect that the "Ubicación del cliente" template is now active. However, no canonical `openspec/specs/documents/spec.md` existed to apply the delta against.

**Resolution**: Created the canonical `openspec/specs/documents/spec.md` with the requirement expressed in its **current post-change state**, stripping the `## MODIFIED` framing and the `(Previously: ...)` note. This is the cleanest safe approach because:

- Applying a MODIFIED delta to a non-existent base is undefined.
- The canonical spec should represent the current state of the system, not delta operations.
- Future changes to the `documents` domain can use proper ADDED/MODIFIED/REMOVED deltas against this now-existing canonical base.

**Tradeoff**: The canonical spec is minimal — it contains only the one requirement touched by this change. The documents domain likely has more requirements that are not yet captured in canonical specs (existing templates, PDF generation, etc.). Those will be added when future changes touch those areas.

### ubicacion-cliente full spec, no canonical base

Straightforward: copied the full change spec as-is since it is a self-standing, non-delta spec and no canonical existed.

## Validation

| Check | Result |
|-------|--------|
| Verify report status | PASS |
| No REMOVED requirements | ✓ |
| No RENAMED requirements | ✓ |
| No destructive MODIFIED blocks requiring approval | ✓ |
| No active same-domain collisions | ✓ |
| Canonical specs readable | ✓ (`openspec/specs/documents/spec.md`, `openspec/specs/ubicacion-cliente/spec.md`) |
| Sync report writable | ✓ (`openspec/changes/ubicacion-cliente/sync-report.md`) |
| Change NOT moved to archive | ✓ (intentionally preserved for `sdd-archive` phase) |

## Warnings from verification carried forward

1. **Stale hero copy on documents index**: `src/app/admin/documents/page.tsx` still refers to ubicación del cliente in future tense ("Después se integrarán..."). The verify report flagged this as a non-blocking inconsistency. It does not block sync, but the team should consider fixing it before archive or as a follow-up commit.

## Next recommended phase

**sdd-archive** — the change is fully sync'd. All artifacts are complete (proposal, specs, design, tasks, apply-progress, verify-report, sync-report). No blockers remain for archival.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Minimal `documents` canonical spec may need expansion when other document templates are touched | Low — additional requirements will be added via standard delta syncs | Documented in this report |
| Stale hero copy is a cosmetic inconsistency | Low — does not affect functionality | Flagged for team follow-up |
| Change folder remains in `openspec/changes/` and could be mistakenly re-synced | Low — sync report exists and next phase is archive | Run `sdd-archive` to close the change |

## Skill resolution

- **Paths injected**: `/home/sebas/.config/opencode/skills/cognitive-doc-design/SKILL.md`, `/home/sebas/.pi/agent/npm/node_modules/gentle-pi/skills/gentle-ai/SKILL.md`
- **Applied**: cognitive-doc-design progressive disclosure principles (lead with answer, signposting, tables for recognition); gentle-ai discipline for OpenSpec artifact consistency.
