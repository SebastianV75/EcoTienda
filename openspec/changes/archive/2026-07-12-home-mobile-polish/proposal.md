# Compact mobile-first Home screen for admin panel

Restructure the admin Home screen (`/admin`) to serve mobile operators as a compact, scannable dashboard. The current layout forces excessive vertical scrolling before reaching actionable content. This change reorganizes the content hierarchy so that quick module access and a lightweight activity summary share a dense above-the-fold composition, without adding new data sources or operational features.

## Business problem

The admin Home screen was designed for desktop. On mobile — the primary device for EcoTienda's internal Mexican users — the page renders as a tall vertical stack: a full-width marketing hero, two stacked support cards, and four module cards. Users must scroll through ~800px of decorative content before reaching the module links they actually need for daily operations (clients, quotations, visits, documents). This creates friction in the most frequent workflow: opening the app and navigating to a specific module.

The hero banner and support cards communicate brand tone but provide zero operational value on a daily-use mobile tool. The content hierarchy prioritizes presentation over utility.

## Target users and situations

| Who | When | Need |
|-----|------|------|
| Admin operators on mobile | Open the app 5-15x/day to check status or start a task | See what needs attention and jump to the right module in <2 seconds |
| Admin operators on desktop | Same workflows, less frequent | Keep current desktop experience intact |

## Current-state gap

- **Hero banner** consumes ~40% of initial mobile viewport with marketing copy that offers no operational signal.
- **Support cards** ("Configuración", "Operación centralizada") are static informational blocks that duplicate information available elsewhere (settings nav, onboarding).
- **Quick action cards** are buried below the fold on most mobile viewports.
- **No activity signal** — the page shows where things are but not what's happening. Users must enter each module individually to check status.
- **Vertical stacking** on mobile wastes horizontal space that a 2-column compact grid could use.

## Product outcome

After this change, the mobile Home screen should:

1. Surface module access within the first viewport — no scrolling needed for the primary navigation action.
2. Show a compact activity summary that gives operators a quick operational pulse using **only currently available Client data** (total clients, recent clients). Modules that are not yet operational (Quotations, Technical Visits) must NOT appear in the activity summary.
3. Feel dense but not cluttered — information is scannable, tappable targets remain comfortable.
4. Preserve the current desktop layout and visual identity without regression.

## Scope

### In scope (first slice)

- **Compact module grid**: Reorganize the 4 module cards into a tighter 2×2 grid on mobile with reduced padding, shorter descriptions (or description removal on mobile), and prominent tap targets.
- **Activity summary section**: Add a lightweight summary row or card set that surfaces Client-related counts (e.g., total clients, recently added clients) from existing Supabase queries. **Only Client data is available today** — Quotations and Technical Visits modules are not yet developed and must not be referenced in the activity summary. No new tables, no new integrations.
- **Hero reduction**: Collapse the hero banner into a minimal greeting or remove it entirely on mobile, keeping it for desktop if desired.
- **Support card removal on mobile**: Remove or drastically reduce the "Configuración" and "Operación centralizada" cards on mobile — they add no operational value and consume viewport space.
- **Content hierarchy reorder**: Place module access and activity summary above any remaining decorative/informational content.

### Non-goals

- No new database tables, API routes, or external data integrations.
- No new operational features (no create/edit actions from Home).
- No changes to the mobile bottom navigation or app shell structure.
- No changes to individual module pages.
- No desktop layout changes beyond what's needed for consistency.
- No animation or transition work beyond standard component rendering.

## Constraints

| Constraint | Detail |
|------------|--------|
| Language | All UI text in Spanish (Mexican audience) |
| Platform | Mobile-first; must not degrade desktop experience |
| Data | Activity summary must use **only currently available Client data** (total clients, recent clients). Quotations and Technical Visits have no operational data yet and must not be queried or displayed |
| Navigation | Bottom nav is the primary mobile nav — Home must integrate with it, not compete |
| Performance | No additional client-side JS bundles; server components preferred |
| Design system | Use existing CSS variables, border radii, and color tokens — no new design primitives |

## Affected areas

- `src/app/admin/page.tsx` — primary file; content restructure and new server-side data fetching for activity summary.
- `src/components/app-shell.tsx` — may need minor adjustments if the page header/description interaction changes.
- Potentially new presentational components for the compact module grid and activity summary cards (under `src/components/` or co-located).

## Risks and tradeoffs

| Risk | Mitigation |
|------|------------|
| Activity summary adds page load time due to extra queries | Keep queries simple (counts, recent items); use `Promise.all` for parallel fetching; set a reasonable timeout/fallback |
| Removing hero/support cards on mobile reduces brand presence | Desktop keeps the full experience; mobile prioritizes utility over brand — operators use this 15x/day, not once |
| Compact cards may feel too dense or reduce discoverability | Maintain clear visual separation, adequate tap targets (min 44px), and descriptive labels |
| Activity summary is limited to Client data while other modules are undeveloped | Use clear labels ("Total de clientes", "Clientes recientes") and leave room to extend the summary when Quotations and Visits become operational |

## Rollback

This is a pure presentational + read-only data change. Rollback is a single-file revert of `src/app/admin/page.tsx` and any new components. No data migrations, no schema changes.

## Success criteria

1. On a standard mobile viewport (375px width), all 4 module links are visible within the first scroll without scrolling past the activity summary.
2. Activity summary renders meaningful Client counts (at minimum: total clients and recent clients). No placeholder or zero-count rows for Quotations or Technical Visits.
3. Desktop layout (≥1024px) remains visually consistent with the current design.
4. No new client-side JS bundles are introduced.
5. Page load time does not increase by more than 200ms (server-side queries are parallelized).
