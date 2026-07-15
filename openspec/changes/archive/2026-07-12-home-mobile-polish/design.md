# Design: Compact mobile-first Admin Home

## Overview

This change keeps `/admin` as a server-rendered Home page and reshapes only its content hierarchy. Mobile receives a compact operational dashboard: Client activity summary first, four module links in a dense 2×2 grid second, and non-operational decorative/support content hidden. Desktop preserves the current hero, support cards, and module-card presentation.

## Key decisions

| Area | Decision |
|------|----------|
| Data source | Use only the existing `clients` table through the existing Supabase server client. No new tables, routes, integrations, or client fetches. |
| Fetching model | Fetch activity counts in server code before rendering `AdminPage`; keep the page a Server Component. |
| Count queries | Add/read a small server helper for Client activity counts using Supabase `select("id", { count: "exact", head: true })`. |
| Recent clients boundary | `recent clients` means clients where `created_at >= now - 7 days`; compute the boundary on the server and pass it as an ISO timestamp. |
| Query concurrency | Fetch total and recent Client counts with `Promise.all` so the Home page pays one parallel count-only fetch step. |
| Mobile hierarchy | On `<768px`, render compact activity summary before the module grid; hide the large hero and support cards. |
| Desktop preservation | On `lg`/desktop, keep the hero/support composition and module-card feel consistent with the existing design. |
| Components | Prefer small presentational sections in `src/app/admin/page.tsx`; extract only if readability becomes worse during implementation. |
| Styling | Use existing Tailwind utilities and current CSS variables (`--brand-*`, `--surface-*`, `--border-*`, `--muted`) plus existing rounded values. |

## Data flow

1. `AdminPage` resolves the current admin user using the existing `hasSupabaseEnv()` / `requireRole()` flow.
2. When Supabase is configured, the page requests Client activity counts server-side.
3. The activity helper runs two count queries in parallel:
   - total clients: all rows in `clients`.
   - recent clients: rows with `created_at >= sevenDaysAgoIso`.
4. The page renders those numbers into the activity summary.
5. The browser receives static HTML/CSS for the summary and module grid; no client component or client-side data fetch is introduced.

### Boundary calculation

```ts
const recentClientBoundary = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
```

Use the server clock and ISO timestamp because `created_at` is already stored as a timestamp string. The comparison is inclusive at the boundary (`gte`) so a client created exactly seven days ago counts as recent.

## File-level plan

| File | Change |
|------|--------|
| `src/features/clients/data.ts` | Add a cached server helper such as `getClientActivitySummary()` that returns `{ totalClients: number; recentClients: number }`. Keep it read-only and Supabase-only. |
| `src/app/admin/page.tsx` | Import the helper, fetch counts server-side when Supabase env exists, render activity summary, apply responsive layout classes, and preserve desktop hero/support cards. |

No app-shell, navigation, route, schema, or dependency changes are planned.

## Layout structure

### Mobile (`<768px`)

- Hide the existing large gradient hero (`hidden md:block` or equivalent).
- Hide support cards (`hidden lg:grid` or equivalent) so static informational content does not consume the first viewport.
- Render an activity summary card/row above the module grid:
  - `Total de clientes`
  - `Clientes recientes`
- Render the four module cards as `grid grid-cols-2`.
- Reduce card padding, title size, description visibility, and CTA height on mobile while preserving a minimum 44px interactive area.
- Keep module titles and routes unchanged:
  - `Clientes` → `/admin/clients`
  - `Descargables` → `/admin/documents`
  - `Cotizaciones` → `/admin/quotations`
  - `Visitas técnicas` → `/admin/visits`

### Desktop (`≥1024px`)

- Keep the current hero/support area visible and visually consistent.
- Keep module cards in the existing wider desktop grid behavior.
- Activity summary may appear as a lightweight section near the actionable content, but must not replace or visually regress the existing desktop composition.

## Visibility rules

| Element | Mobile | Desktop |
|---------|--------|---------|
| Large gradient hero | Hidden or reduced to a minimal greeting | Visible/preserved |
| Support cards (`Configuración`, `Operación centralizada`) | Hidden | Visible/preserved |
| Activity summary | Visible before module grid | Visible without disrupting desktop layout |
| Four module cards | Visible in compact 2×2 grid | Visible in current desktop-style grid |
| Quotations/Visits activity metrics | Never shown | Never shown |

## Contracts

### Activity helper contract

```ts
type ClientActivitySummary = {
  totalClients: number;
  recentClients: number;
};
```

- Returns numeric counts only.
- Uses the existing Supabase server client.
- Does not fetch row data.
- Does not query quotations, visits, or documents.
- Empty table returns `{ totalClients: 0, recentClients: 0 }` through Supabase exact counts.
- In local setup mode without Supabase env, `AdminPage` should render safe zero values and continue showing `SetupNotice`.

### UI contract

- UI copy remains Spanish for EcoTienda operators.
- Activity labels must clearly refer to clients only.
- Card links remain semantic links, not client-side buttons.
- Mobile tap targets remain at least 44px.
- No new custom CSS tokens or design primitives.

## Testing and verification

- Add/update tests only if the existing project already has page/component test coverage for admin pages; otherwise verify manually with the existing build/lint workflow from project setup.
- Verify at 375px width:
  - activity summary appears before module cards.
  - all four module cards are visible without scrolling past the activity section.
  - hero and support cards are not displayed.
  - tap targets are at least 44px.
- Verify at 1024px+:
  - hero and support cards remain visible.
  - module cards remain visually consistent with the current desktop layout.
- Verify data behavior:
  - total count uses all Client rows.
  - recent count uses `created_at >= now - 7 days`.
  - empty Client table renders `0` values without broken layout.
  - no Quotations or Technical Visits metrics appear.
- Verify bundle behavior:
  - no `"use client"` is added to Home activity components.
  - no new client-side data fetching or dependencies are introduced.

## Rollout and rollback

This is a read-only server-rendered UI change. Rollout requires no migration or feature flag. Rollback is a revert of the Home page changes and the optional Client activity helper.
