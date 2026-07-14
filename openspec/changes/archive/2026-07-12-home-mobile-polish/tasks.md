# Tasks: home-mobile-polish

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 90-170 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Implementation tasks

- [x] 1. Add the server-side Client activity summary helper in `app/features/clients/data.ts`.
  - Add a cached helper such as `getClientActivitySummary()` that returns `{ totalClients, recentClients }`.
  - Use Supabase count-only queries against `clients` with `select("id", { count: "exact", head: true })`.
  - Compute the recent boundary as `now - 7 days` on the server and fetch total + recent counts with `Promise.all`.
  - Keep the helper read-only and limited to Client data only.

- [x] 2. Wire the activity summary data into `app/admin/page.tsx` without adding client-side fetching.
  - Import the new helper and fetch summary data only when `hasSupabaseEnv()` is true.
  - Preserve the existing auth flow and `SetupNotice` behavior.
  - Provide safe zero-value fallback rendering for the no-Supabase setup path.

- [x] 3. Reorder the mobile content hierarchy in `app/admin/page.tsx`.
  - Render the activity summary before module navigation on mobile.
  - Keep the summary limited to `Total de clientes` and `Clientes recientes`.
  - Do not add Quotations, Technical Visits, placeholders, or any new data source.

- [x] 4. Compact the mobile module cards in `app/admin/page.tsx` while preserving desktop behavior.
  - Keep exactly four cards and the existing routes: `/admin/clients`, `/admin/documents`, `/admin/quotations`, `/admin/visits`.
  - Use a 2-column mobile grid, reduce vertical density, and shorten or hide descriptions on small screens.
  - Maintain tappable targets at or above 44px and keep links semantic.
  - Preserve the current broader card layout on desktop breakpoints.

- [x] 5. Hide non-operational mobile chrome in `app/admin/page.tsx` only.
  - Remove or hide the large hero banner on mobile.
  - Remove or hide the `Configuración` and `Operación centralizada` support cards on mobile.
  - Keep hero/support content visible for desktop layouts so desktop remains visually consistent.

- [x] 6. Run scope and regression validation for the Home page.
  - Verify by code review and responsive check that, at mobile width, the order is: activity summary → module grid → remaining informational content.
  - Confirm desktop still shows hero/support sections and unchanged module destinations.
  - Confirm no `"use client"`, no new dependencies, and no app-shell/navigation changes were introduced outside `app/admin/page.tsx` and `app/features/clients/data.ts`.

- [x] 7. Run the current safety-net commands and record results.
  - Run `npm run lint`.
  - Run `npm run build`.
  - If either command fails, fix only regressions caused by this change before moving to verify.
