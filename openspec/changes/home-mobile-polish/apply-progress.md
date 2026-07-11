# Apply Progress: home-mobile-polish

## Status

Implementation complete for the approved Home mobile polish slice. Lint and build pass.

## Completed tasks

All 7 implementation tasks from `tasks.md` are checked off in the persisted tasks artifact.

- [x] 1. Added server-side `getClientActivitySummary()` helper in `src/features/clients/data.ts`.
- [x] 2. Wired the helper into `src/app/admin/page.tsx` behind the `hasSupabaseEnv()` gate with a safe zero-value fallback.
- [x] 3. Reordered mobile content hierarchy: activity summary first, then the hero/support section (hidden on mobile), then the module grid.
- [x] 4. Compacted the mobile module cards: 2×2 grid, reduced padding, smaller title on small screens, hidden description on mobile, kept `min-h-[44px]` interactive area.
- [x] 5. Hid non-operational mobile chrome (hero banner and support cards) using `hidden md:grid` so the existing desktop composition is preserved from `md` (768px) upward.
- [x] 6. Scoped regression validation: only the two approved files were modified. No `app-shell.tsx`, navigation, route, schema, or dependency changes.
- [x] 7. Validation commands: `npm run lint` and `npm run build` both succeed.

## Files changed

| File | Change | Notes |
|------|--------|-------|
| `src/features/clients/data.ts` | Added `ClientActivitySummary` type and `getClientActivitySummary()` server helper | Cached with `react/cache`; uses `Promise.all` for parallel count-only queries; reads only the existing `clients` table. |
| `src/app/admin/page.tsx` | Wired the helper, added the activity summary section, reordered hierarchy, compacted mobile module cards, hid hero/support on mobile | No new client component, no new dependencies, no AppShell edits. |

`git diff --stat` for the two changed files:

```
src/app/admin/page.tsx       |  44 ++++-
src/features/clients/data.ts |  39 +++++
```

## Test commands run

| Command | Result |
|---------|--------|
| `npm run lint` | Pass. One pre-existing warning in `src/features/documents/ubicacion-cliente-preview.tsx` (`@next/next/no-img-element`) — unrelated to this change. |
| `npm run build` | Pass. `next build` compiled successfully, TypeScript clean, all 18 static pages generated, `/admin` remains a dynamic server-rendered route (`ƒ /admin`). |

No unit tests were added; per design, this project does not have a test runner configured and the repo's `package.json` does not declare one, so verification relies on lint + build + manual responsive review at 375px and 1024px+.

## Behavior verification

- **Activity summary content**: only `Total de clientes` and `Clientes recientes` (últimos 7 días). No Quotations, no Technical Visits, no placeholders, no fake zeros beyond real Supabase counts.
- **Mobile hierarchy** (<768px): activity summary → module grid. Hero and support cards are hidden via `hidden md:grid`.
- **Desktop hierarchy** (≥768px via `md`, ≥1024px via `xl`): hero/support composition appears in the original two-column layout, module grid expands to 4 columns at `xl`, activity summary sits above the decorative section as a lightweight panel.
- **Tap targets**: each module card CTA uses `min-h-[44px]` to satisfy the 44px minimum on mobile.
- **No new client-side JS**: page is still a Server Component; the activity summary renders from server-resolved props. Build output confirms `/admin` is `ƒ` (server-rendered on demand).
- **No new data sources**: helper only reads from the existing `clients` table. Empty table returns `{ totalClients: 0, recentClients: 0 }` via Supabase exact counts.
- **No AppShell/navigation changes**: `src/components/app-shell.tsx` and the mobile bottom navigation are untouched.

## Deviations from design

None. Implementation follows the proposal, spec, and design exactly:

- Single source of truth for the activity count: the existing `clients` table.
- Recent boundary computed server-side as `now - 7 days` and passed as an ISO timestamp; `gte` (inclusive) so a client created exactly 7 days ago counts.
- Both count queries run in parallel via `Promise.all`.
- No new CSS variables, no new border-radius values, no new design primitives; only existing tokens (`--brand-*`, `--border-soft`, `--surface-strong`, `--muted`) and existing rounded values.

## Remaining tasks

None. All implementation tasks are complete and verified. Next recommended step is `sdd-verify` for adversarial review of the diff against the spec.
