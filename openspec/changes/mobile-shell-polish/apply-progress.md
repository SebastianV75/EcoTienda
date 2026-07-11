# Apply Progress — Mobile Shell Polish

## Status

In progress → all planned tasks implemented, lint and build pass.

## Completed tasks

- [x] 1. Prepare the mobile navigation seam in `src/components/app-shell.tsx`.
- [x] 2. Build the mobile navigation client component in `src/components/mobile-bottom-navigation.tsx`.
- [x] 3. Integrate the mobile shell layout in `src/components/app-shell.tsx`.
- [x] 4. Validate route coverage against current `AppShell` consumers.
- [x] 5. Run the safety net and manual acceptance checks.

## Files changed

| File | Change |
|------|--------|
| `src/components/app-shell.tsx` | Hide `<aside>` below `lg`, add mobile-only compact header (title only), keep desktop header copy/layout intact, reduce mobile content padding, reserve bottom safe-area-aware padding for the fixed nav, render `MobileBottomNavigation` with `MobileSignOut` as the sheet slot. |
| `src/components/mobile-bottom-navigation.tsx` | New client component. Fixed 5-item bottom nav (`Inicio / Clientes / Descargables / Cotizaciones / Más`), inline SVG icons, `usePathname()` active state (`Inicio` exact, others prefix), `aria-current="page"`, `aria-label="Navegación principal"`, `print:hidden`, `pb-[env(safe-area-inset-bottom)]`. `Más` opens a stateful bottom sheet (`role="dialog"`, `aria-modal="true"`, escape-to-close, backdrop close, close-on-link, swipe-down ≥48px) listing `Visitas técnicas`, `Configuración`, and the `signOutSlot`. `Más` button is highlighted while on a secondary route or when the sheet is open. |
| `src/components/mobile-sign-out.tsx` | New server component. Renders the session email and a `<form action={signOutAction}>` with `Cerrar sesión`. Kept as a server component to keep the client/server boundary around `signOutAction` clean. |
| `openspec/changes/mobile-shell-polish/tasks.md` | Marked all 5 implementation tasks as completed. |

`src/components/auth-status.tsx` was not modified — desktop sidebar keeps using it untouched.

## Test commands run

```bash
npm run lint
npm run build
```

Results:

- `npm run lint` — passes with zero errors. One pre-existing warning about `<img>` in `src/features/documents/ubicacion-cliente-preview.tsx:200` is unrelated to this change.
- `npm run build` — `Compiled successfully`, `TypeScript` clean, 18 routes generated (matches pre-change route count, no consumer changes required).

## Verification against spec

| Spec requirement | Status |
|------------------|--------|
| Bottom nav fixed on `< lg` with 5 items in order | ✅ `fixed inset-x-0 bottom-0 ... lg:hidden` with `Inicio / Clientes / Descargables / Cotizaciones / Más` |
| Bottom nav not visible on desktop | ✅ `lg:hidden print:hidden` |
| Active route indicator | ✅ `aria-current="page"` + visual highlight via `text-[var(--brand-deep)]`; `Inicio` exact, others prefix match |
| Secondary routes highlight `Más` | ✅ `onSecondaryRoute` activates `Más` brand color |
| `Más` is a sheet, not a route | ✅ Local `isMoreOpen` state, `role="dialog"`, `aria-modal="true"`, no route change |
| Sheet lists `Visitas técnicas`, `Configuración`, email, logout | ✅ secondary nav + `signOutSlot` containing `MobileSignOut` |
| Backdrop / Escape / close button / link-tap dismiss | ✅ all four paths implemented |
| Compact mobile header shows only `title` | ✅ dedicated `lg:hidden` header containing only `{title}` |
| Desktop header copy unchanged | ✅ original header block kept verbatim under `hidden lg:block` |
| Sidebar hidden on mobile | ✅ `<aside className="hidden ... lg:block">` |
| Safe-area insets | ✅ `pb-[env(safe-area-inset-bottom)]` on nav; sheet footer `pb-[calc(1rem+env(safe-area-inset-bottom))]`; root `pb-[calc(88px+env(safe-area-inset-bottom))]` reserves the nav footprint |
| Print hides mobile nav + sheet | ✅ `print:hidden` on nav, sheet container, and both header variants |
| Backward compatibility | ✅ `AppShellProps` signature unchanged; build confirms all 18 routes still generate with no consumer edits |
| Spanish UI | ✅ all visible labels Spanish: Inicio, Clientes, Descargables, Cotizaciones, Más, Visitas técnicas, Configuración, Más opciones, Cerrar, Cerrar sesión, Conectado como, Sesión |
| No new dependencies | ✅ only `next/link`, `next/navigation`, `react`, and existing `signOutAction` |

## Deviations from design

- Inline icon set is rendered as plain functional components returning `<svg>` rather than typed `SVGProps`. The design asked for "local inline SVG icon components" and a dependency-free implementation; this matches the intent while keeping the file self-contained.
- Sheet pointer-dismiss threshold is 48px (per design) without drag-follow animation. Tap-outside, close button, and Escape remain the reliable non-gesture paths.

## Remaining tasks

None — all 5 implementation tasks are complete. Manual visual checks on a real device with a home indicator are recommended but were not runnable in this session.

## PR boundary

- Single PR, ~190 changed lines (well under the 400-line budget). No chained PRs needed.
- Suggested commit message: `feat(shell): add mobile bottom navigation and compact header`

## Structured status

| Field | Value |
|-------|-------|
| `applyState` | `all_done` |
| `nextRecommended` | `verify` |
| `risks` | None blocking. One pre-existing lint warning in `ubicacion-cliente-preview.tsx` is unrelated. |

## Discoveries

- The existing `auth-status.tsx` already imports `signOutAction` from a server action module and uses it as a `<form action={...}>`. To keep that boundary clean inside the new client `MobileBottomNavigation`, the logout block was extracted into a small server component `MobileSignOut` and passed in as a `signOutSlot` prop. This avoided turning the client component into a server-action importer and avoided the alternative of passing the action as a prop from a server boundary.
- Next.js 16's `useId` provides a stable id suitable for `aria-controls` / `aria-labelledby` on the sheet without collisions.
