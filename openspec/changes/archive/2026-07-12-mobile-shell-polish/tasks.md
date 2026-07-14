# Tasks — Mobile Shell Polish

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 180-280 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Implementation Plan

- [x] 1. Prepare the mobile navigation seam in `src/components/app-shell.tsx`.
  - Keep `AppShellProps` unchanged.
  - Preserve the existing desktop `navigation` behavior and desktop sidebar/header markup.
  - Extract or reorganize navigation data only as needed so desktop links stay unchanged and mobile primary/secondary items are explicit.
  - Verification: desktop markup still renders from `AppShell` with no consumer prop changes.

- [x] 2. Build the mobile navigation client component in `src/components/mobile-bottom-navigation.tsx`.
  - Add primary items for `/admin`, `/admin/clients`, `/admin/documents`, `/admin/quotations` plus a `Más` trigger.
  - Add inline SVG icons, `usePathname()` active-state logic, Spanish labels, `aria-current`, and `aria-label="Navegación principal"`.
  - Implement the `Más` sheet with `Visitas técnicas`, `Configuración`, session email, `Cerrar sesión`, backdrop close, Escape close, and close-on-link-tap.
  - Discovery target: verify `signOutAction` can be used safely from this client boundary; if not, extract the logout form into a tiny server-safe component under `src/components/` without changing desktop behavior.
  - Verification: mobile nav renders exactly 5 items and the sheet is not route-backed.

- [x] 3. Integrate the mobile shell layout in `src/components/app-shell.tsx`.
  - Hide the sidebar below `lg` and keep it unchanged at `lg` and above.
  - Add a mobile-only compact header that shows only `title`.
  - Keep the current desktop header copy/layout unchanged.
  - Reduce mobile content padding and reserve bottom space with safe-area-aware padding so content is not covered by the fixed nav.
  - Add `print:hidden` / existing print-safe classes so the mobile nav and sheet stay out of print output.
  - Verification: mobile content starts near the top, desktop shell remains visually unchanged.

- [x] 4. Validate route coverage against current `AppShell` consumers.
  - Check representative pages using `AppShell`: `app/admin/page.tsx`, `app/admin/clients/page.tsx`, `app/admin/documents/page.tsx`, `app/admin/quotations/page.tsx`, `app/admin/visits/page.tsx`, `app/admin/settings/page.tsx`, and one nested route under `app/admin/clients/[id]/` or `app/admin/documents/**`.
  - Confirm active-state behavior for nested paths and decide whether secondary routes highlight only `Más`.
  - Confirm no changes are required in existing consumer files.
  - Verification: no prop/API drift and no broken route mapping.

- [x] 5. Run the safety net and manual acceptance checks.
  - Run `npm run lint`.
  - Run `npm run build`.
  - Manually verify on `< lg`: sidebar hidden, compact title header, bottom nav order `Inicio / Clientes / Descargables / Cotizaciones / Más`, safe-area padding, and `Más` sheet dismissal behavior.
  - Manually verify on `>= lg`: sidebar + full desktop header remain unchanged.
  - Manually verify print preview hides the mobile nav/sheet.
