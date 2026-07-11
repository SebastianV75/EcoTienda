# Apply Progress — selector-cliente-directo

## Status

`complete` — all four implementation tasks finished, validation commands green, no manual browser checks performed in this headless session (flagged for the human verifier).

## Completed tasks

- [x] 1. Selector island `src/features/documents/client-preview-selector.tsx` added.
- [x] 2. `src/app/admin/documents/carta-poder/page.tsx` refactored to use the island.
- [x] 3. `src/app/admin/documents/ubicacion-cliente/page.tsx` refactored to use the island.
- [x] 4. `npm run lint` (0 errors) and `npm run build` (compile + typecheck + route map OK) ran clean.

## Persisted task checkbox updates

- `openspec/changes/selector-cliente-directo/tasks.md` — all four `- [ ]` boxes flipped to `- [x]` in this batch.

## Files changed

| File | Type | Notes |
|------|------|-------|
| `src/features/documents/client-preview-selector.tsx` | new (≈70 LOC) | `"use client"` island, `useTransition` + `router.push`, `defaultValue=""`, `htmlFor`/`id`/`name` accessibility, pending status text. |
| `src/app/admin/documents/carta-poder/page.tsx` | modified | Dropped `searchParams` prop, `selectedClientId` state, `<form>` wrapper, submit button, and the green confirmation section. Renders `<ClientPreviewSelector template="carta-poder" />`. |
| `src/app/admin/documents/ubicacion-cliente/page.tsx` | modified | Same cleanup as Carta Poder, renders `<ClientPreviewSelector template="ubicacion-cliente" />`. |

`git diff --stat` summary:

```
 src/app/admin/documents/carta-poder/page.tsx       | 61 ++++------------------
 src/app/admin/documents/ubicacion-cliente/page.tsx | 61 ++++------------------
 2 files changed, 20 insertions(+), 102 deletions(-)
```

Plus the new selector island (untracked, ~70 LOC). Net change is well below the 400-line budget.

## Untouched (per design and proposal)

- `src/app/admin/documents/carta-poder/preview/page.tsx`
- `src/app/admin/documents/ubicacion-cliente/preview/page.tsx`
- `src/app/admin/documents/page.tsx` (Descargables index, Formato CFE placeholder)
- `src/features/clients/*`, `src/features/auth/*`, `src/components/app-shell.tsx`
- Middleware, schemas, and dependencies

## Test commands run

| Command | Result |
|---------|--------|
| `npm run lint` | Pass — 0 errors. The 1 warning is pre-existing in `src/features/documents/ubicacion-cliente-preview.tsx` (`<img>` vs `next/image`) and is outside this change. |
| `npm run build` | Pass — `Compiled successfully`, TypeScript clean, all 18 static pages generated. Route map confirms both selector pages and both preview pages still register. |

Manual browser checks (Back button behavior, mobile two-tap flow, no-redirect on placeholder) are deferred to the human verifier; they cannot be exercised from this headless executor.

## Deviations from design

None. The selector island follows the design sketch: `"use client"`, `useTransition` + `router.push`, `defaultValue=""`, `htmlFor`/`id`/`name`, pending state with `role="status"` + `aria-live="polite"`, identical visual class strings, and identical `rpu` display. The pages drop `searchParams` and the confirmation section exactly as the design prescribed.

The component takes a structural `{ id, full_name, rpu }` subset via the `ClientPreviewSelectorClient` type, and the pages project the full `ClientRecord` down to that subset before passing it in — keeping the island decoupled from the broader `ClientRecord` schema.

## Remaining tasks

None — all four tasks are checked off. The only outstanding work is the human-side manual verification enumerated in the design (Back button returns to selector, mobile two-tap flow, preview pages still render correctly, Descargables index unchanged).

## Workload / PR boundary

- Estimated changed lines: ~80–100 across 3 files. Within the 400-line budget.
- Chained PRs: not required; single PR fits the slice.
- Delivery strategy honored: `ask-on-risk` was answered by the parent prompt as `single-pr` ("Implement only this direct client selection slice").
- No commits made (the user did not ask for one).

## Structured status consumed / produced

- Consumed: the parent prompt's artifact store mode (`openspec`), execution mode (`interactive`), delivery strategy (`ask-on-risk`), strict TDD flag (`false`), and the four approved artifacts.
- Produced: this `apply-progress.md` plus the four checked-off tasks in `openspec/changes/selector-cliente-directo/tasks.md`.

## Next recommended phase

`/sdd-verify selector-cliente-directo` — run the formal verification against `specs/documents/spec.md` to confirm the acceptance criteria are met and capture the manual browser checks performed by the human verifier.
