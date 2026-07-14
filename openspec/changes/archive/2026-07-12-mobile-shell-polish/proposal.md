# Mobile Shell Polish — Bottom Navigation & Reduced Chrome

Replace the stacked sidebar-heavy mobile experience with a fixed bottom navigation bar, freeing above-the-fold space for primary content. Desktop layout remains unchanged.

## Business Problem

EcoTienda's internal operations staff use the app primarily on mobile phones. The current `AppShell` renders a full sidebar (logo, role card, 6 navigation links, auth status) that stacks above the main content on small screens. Combined with the main content header (branding label + page title + description), users must scroll past significant navigation chrome before reaching actionable content. This creates a heavy, desktop-first feel on devices where screen real estate is the scarcest resource.

## Target Users & Situations

| Who | When | Pain |
|-----|------|------|
| Internal operations staff (Mexican team) | Daily mobile use — checking clients, viewing documents, managing quotations | Excessive scrolling before reaching the task they opened the app for |
| Same users | Switching between sections frequently | Navigation links are far from thumb zone; sidebar links require scrolling back up on mobile |

## Current-State Gap

- The sidebar (`<aside>`) contains ~280px of vertical branding/role content + 6 nav links + auth status before the first piece of page content appears.
- The main content area adds another header block with `px-5 py-5 sm:px-8 sm:py-7` padding, a branding label, and a large title.
- On a typical 667px-tall phone viewport, very little space remains for the actual page content.
- Navigation items are not in the thumb zone; users must scroll or reach to the top to switch sections.

## Product Outcome

After this change, a mobile user opening the app should see:

1. A compact top bar (page title only — minimal branding, no role card, no full nav list).
2. The page content starting near the top of the viewport.
3. A fixed bottom navigation bar with the 4 primary sections always one tap away.
4. A "Más" entry in the bottom bar that opens secondary sections (Visitas técnicas, Configuración, and future items).

The desktop experience (sidebar + full navigation) must remain visually identical.

## Scope

### In scope (this slice)

| Area | Decision |
|------|----------|
| Bottom navigation bar | Fixed to viewport bottom on mobile (`< lg` breakpoint). Items: Inicio, Clientes, Descargables, Cotizaciones, Más. |
| "Más" menu | Sheet/drawer listing secondary nav items: Visitas técnicas, Configuración. Future items (Agenda) deferred. |
| Mobile top bar | Compact header showing only the current page title. Remove the large branding block, role card, and description from mobile view. |
| Sidebar on mobile | Hidden. Replaced by bottom nav + compact top bar. |
| Sidebar on desktop | Unchanged. Existing `lg:` breakpoint behavior preserved. |
| Active route indicator | Bottom nav highlights the current section. |
| Safe-area insets | Bottom bar respects `env(safe-area-inset-bottom)` for devices with home indicators. |

### Non-goals

| Item | Reason |
|------|--------|
| Desktop layout changes | No reported pain; sidebar works well on large screens. |
| New feature: Visitas técnicas | Exists as a nav target only; implementation is a separate change. |
| New feature: Agenda (appointments/scheduling) | Explicitly deferred to a future change. |
| Role-based navigation filtering | Out of scope; all users see the same nav items today. |
| Animation/micro-interaction polish | Not in this slice. Bottom bar appears/hides with CSS only. |
| Offline/PWA shell changes | Not related to navigation structure. |

## Constraints

- **Spanish UI**: All labels, aria-labels, and user-facing strings must be in Spanish.
- **Backward compatibility**: Every existing `AppShell` consumer (18+ pages) must continue to work without prop changes. The component signature stays the same.
- **Breakpoint**: Use the existing `lg:` Tailwind breakpoint (~1024px) as the mobile/desktop boundary, consistent with the current grid layout.
- **No new dependencies**: Implement with existing Tailwind CSS and React patterns. No new UI libraries.
- **Print styles**: Must remain functional (bottom bar hidden in print).

## Risks & Tradeoffs

| Risk | Mitigation |
|------|------------|
| "Más" adds a tap to reach secondary sections | Acceptable tradeoff — these sections (Visitas técnicas, Configuración) are used less frequently. The sheet/drawer should feel lightweight. |
| Bottom nav conflicts with OS gesture areas (iOS home indicator, Android back gesture) | Use `env(safe-area-inset-bottom)` padding. Test on real devices. |
| 5-item bottom bar is at the practical limit | 4 primary + "Más" is within the recommended 3–5 item range for bottom navigation. |
| Users accustomed to sidebar may not discover "Más" immediately | "Más" label is self-explanatory. The sheet lists all secondary items clearly. |
| Compact mobile header loses role/profile visibility | Role info is low-value during task execution. Auth status (email, logout) moves to "Más" or settings. |

## Rollback

The change is contained in `src/components/app-shell.tsx` and its CSS. Reverting the file restores the previous mobile experience entirely. No data migration, no API changes, no database impact.

## Success Criteria

- [ ] On viewports < `lg`, the sidebar is not visible; a bottom navigation bar with 5 items (Inicio, Clientes, Descargables, Cotizaciones, Más) is fixed at the bottom.
- [ ] On viewports ≥ `lg`, the layout is visually identical to the current sidebar-based design.
- [ ] The "Más" entry opens a sheet/drawer listing Visitas técnicas and Configuración.
- [ ] Page content starts within the first ~120px of the mobile viewport (vs. current ~400px+ of chrome).
- [ ] All 18+ existing `AppShell` consumer pages render correctly without prop changes.
- [ ] Bottom bar respects safe-area insets on devices with home indicators.
- [ ] Print layout hides the bottom bar (existing print behavior preserved).
- [ ] `npm run lint` and `npm run build` pass with zero errors.

## Affected Areas

| File / Area | Impact |
|-------------|--------|
| `src/components/app-shell.tsx` | Primary change — conditional mobile/desktop rendering, bottom nav, compact header. |
| `src/components/auth-status.tsx` | May need a mobile-accessible location (inside "Más" or settings). |
| All pages using `AppShell` | No code changes required; benefit from the new mobile layout automatically. |
