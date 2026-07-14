# Mobile Shell Polish Design

## Summary

Refactor `AppShell` so mobile viewports (`< lg`) use a compact title header, fixed bottom navigation, and a lightweight `Más` sheet while desktop keeps the existing sidebar and header unchanged. The implementation stays dependency-free, mobile-first, and contained to shell/navigation components.

## Decisions

| Area | Decision |
|------|----------|
| Desktop preservation | Keep the current sidebar/header markup and classes under `lg:` desktop visibility. Do not restyle desktop shell chrome. |
| Mobile shell | Hide the sidebar below `lg`; render a compact top header with only `title`; reduce mobile content padding so content begins near the top. |
| Bottom navigation | Add a mobile-only fixed bottom nav with exactly: `Inicio`, `Clientes`, `Descargables`, `Cotizaciones`, `Más`. |
| Icon strategy | Use local inline SVG icon components in the shell/navigation file. Do not add icon packages or depend on external UI libraries. |
| Active route | Use a small client component with `usePathname()` for mobile nav state. Primary items are active when the current pathname matches their route prefix. |
| `Más` behavior | `Más` opens a mobile-only bottom sheet in component state, not a route. The sheet lists `Visitas técnicas`, `Configuración`, session email, and `Cerrar sesión`. |
| Sheet implementation | Use plain React state, fixed overlay, semantic buttons/links, and Tailwind classes. No Radix/Dialog/Vaul/headless dependency. |
| Motion | Keep motion minimal: opacity/transform CSS transitions under 250ms. Respect `motion-reduce` utilities. |
| Safe area | Pad the fixed nav/sheet footer with `env(safe-area-inset-bottom)` so controls avoid OS home indicators. |
| Print | Add `print:hidden` to mobile nav and sheet overlay. Preserve existing shell print utilities. |

## Technical structure

### `src/components/app-shell.tsx`

Keep `AppShellProps` unchanged:

```ts
type AppShellProps = {
  children: ReactNode;
  role: AppRole;
  title: string;
  description: string;
  email?: string | null;
};
```

Recommended structure:

```tsx
export function AppShell(props: AppShellProps) {
  return (
    <div className="... pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-... print:...">
      <div className="... lg:grid-cols-[300px_minmax(0,1fr)] ...">
        <DesktopSidebar ... />
        <main>
          <ShellHeader title={title} description={description} />
          <div>{children}</div>
        </main>
      </div>
      <MobileBottomNavigation email={email} />
    </div>
  );
}
```

The helper components may live in the same file for this slice to keep the change small. If `usePathname()` is needed, extract only the mobile navigation to a client component such as `src/components/mobile-bottom-navigation.tsx` and keep `AppShell` server-compatible.

### Desktop sidebar

The current sidebar should be preserved visually:

- Same logo block.
- Same role card.
- Same six navigation links.
- Same `AuthStatus` position.
- Same rounded card, border, colors, spacing, and shadow.

Only add responsive visibility and print classes if needed:

```tsx
<aside className="hidden ... lg:block print:hidden">
```

This is intentionally a visibility change for mobile, not a desktop redesign.

### Header behavior

Use one header container with responsive children or two small header variants:

- Mobile (`lg:hidden`): render only `{title}` with compact padding, e.g. `px-4 py-4`.
- Desktop (`hidden lg:block`): keep current branding label, large title, and description exactly as-is.

The mobile header MUST NOT show:

- `EcoTienda interno` branding label,
- page description,
- role card,
- navigation links,
- auth status.

### Content spacing

Mobile content needs bottom padding so fixed navigation does not cover the page:

- Shell/root: reserve bottom space with `pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-5` or equivalent.
- Main content: reduce mobile padding from the desktop-like values to compact spacing, e.g. `px-4 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8`.
- Print: keep `print:p-0` so printable documents remain clean.

## Navigation model

Use two explicit arrays so the mobile order and `Más` split are obvious:

```ts
const primaryMobileNavigation = [
  { href: "/admin", label: "Inicio", icon: HomeIcon, exact: true },
  { href: "/admin/clients", label: "Clientes", icon: UsersIcon },
  { href: "/admin/documents", label: "Descargables", icon: DownloadIcon },
  { href: "/admin/quotations", label: "Cotizaciones", icon: QuoteIcon },
];

const secondaryMobileNavigation = [
  { href: "/admin/visits", label: "Visitas técnicas", icon: VisitsIcon },
  { href: "/admin/settings", label: "Configuración", icon: SettingsIcon },
];
```

Desktop may continue using the existing `navigation` array and labels (`Panel`, `Clientes`, etc.) to avoid changing desktop copy.

## Active route behavior

Implement active state in the client-only mobile nav:

```ts
function isActive(pathname: string, item: { href: string; exact?: boolean }) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
```

Behavior:

- `/admin` activates `Inicio` only on exact match.
- `/admin/clients` and nested client routes activate `Clientes`.
- `/admin/documents` and nested document routes activate `Descargables`.
- `/admin/quotations` activates `Cotizaciones`.
- `/admin/visits` and `/admin/settings` may leave all primary items inactive, or may highlight `Más` while on a secondary route. Prefer highlighting `Más` so users can see where the current section lives.

## `Más` sheet

### Rendering contract

`Más` is a button, not a link. It sets `isMoreOpen` to `true`.

When open, render:

- fixed full-screen overlay (`lg:hidden print:hidden`),
- backdrop button/area that closes the sheet on outside click,
- bottom-aligned panel with title `Más opciones`,
- secondary navigation links,
- session block with `email ?? "Usuario desconocido"`,
- logout form using `signOutAction` and button label `Cerrar sesión`.

If the sheet component is client-side, importing the existing server action from `@/features/auth/actions` for a `<form action={signOutAction}>` is acceptable in Next.js server actions. Alternatively, keep a tiny server-rendered logout form component and pass it into the client sheet if lint/build reveals a boundary issue.

### Dismissal

Minimum interactions:

- Tap `Más` opens.
- Tap backdrop closes.
- Tap a secondary link closes before navigation (`onClick={() => setIsMoreOpen(false)}`).
- Tap an explicit close button (`Cerrar`) closes.
- Press `Escape` closes via an effect while the sheet is open.

Implement swipe-down dismissal with a minimal pointer gesture on the sheet panel, without physics or drag-follow animation:

- Record the initial `clientY` on `pointerdown` for touch/pen pointers.
- On `pointerup`, close when the final `clientY` is at least ~48px below the start.
- Ignore upward movement and multi-touch complexity for this slice.
- Keep tap-outside, close button, and Escape as the reliable non-gesture dismissal paths.

### Styling and motion

- Panel enters from `translate-y-full` to `translate-y-0` with opacity/transform transition.
- Use `duration-200 ease-out`; avoid long or decorative animations.
- Add `motion-reduce:transition-none motion-reduce:transform-none`.
- Add `active:scale-[0.97]` to pressable mobile nav buttons/links for immediate touch feedback.

## Safe-area handling

Apply safe-area padding on mobile fixed chrome:

```tsx
<nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden print:hidden">
  <div className="border-t ... pb-[env(safe-area-inset-bottom)]">
    <div className="grid h-16 grid-cols-5">...</div>
  </div>
</nav>
```

The sheet panel should also include bottom padding:

```tsx
<div className="pb-[calc(1rem+env(safe-area-inset-bottom))]">...</div>
```

The page body/root should reserve at least the nav height plus safe-area inset to avoid covering the last content row.

## Print behavior

- Mobile bottom navigation: `print:hidden`.
- `Más` overlay/sheet: `print:hidden`.
- Existing `AppShell` print behavior remains: sidebar/header chrome hidden and main content simplified.
- Do not add broad global print CSS for this change unless Tailwind print utilities are insufficient.

## Data flow

```text
AppShell receives title, description, role, email, children
  -> desktop >= lg renders existing sidebar + existing full header
  -> mobile < lg hides sidebar
      -> compact header renders title only
      -> children render with compact spacing and bottom reserve
      -> MobileBottomNavigation reads pathname
          -> primary links navigate normally
          -> Más button opens local sheet state
              -> secondary links navigate and close sheet
              -> logout form calls existing signOutAction
```

No database, API, auth model, route, or AppShell prop changes are required.

## File changes

| File | Change |
|------|--------|
| `src/components/app-shell.tsx` | Preserve desktop shell, add mobile header spacing, hide sidebar on mobile, render mobile nav. |
| `src/components/mobile-bottom-navigation.tsx` | Recommended new client component for `usePathname()`, `Más` state, inline icons, sheet, and logout form. |
| `src/components/auth-status.tsx` | No required change. Reuse only if its desktop styling fits; otherwise duplicate a minimal mobile session block in the sheet. |
| `package.json` | No changes. |

If keeping the mobile nav in `app-shell.tsx` would force the whole shell to become a client component, do not do that. Prefer the small extracted client component so current server-rendered pages remain simple.

## Accessibility contracts

- Bottom nav uses `aria-label="Navegación principal"`.
- `Más` button uses `aria-haspopup="dialog"` and `aria-expanded`.
- Sheet container uses `role="dialog"`, `aria-modal="true"`, and an accessible title.
- Active links set `aria-current="page"`.
- Icon SVGs are decorative (`aria-hidden="true"`) because visible labels are present.
- All user-facing strings remain Spanish.

## Testing and verification

Automated:

```bash
npm run lint
npm run build
```

Manual checks:

- At `<1024px`, sidebar is hidden and bottom nav shows exactly `Inicio`, `Clientes`, `Descargables`, `Cotizaciones`, `Más`.
- At `>=1024px`, sidebar/header match the current desktop layout visually.
- Primary nav active state updates on `/admin`, `/admin/clients`, `/admin/documents`, and `/admin/quotations`.
- `Más` opens a bottom sheet; `Visitas técnicas`, `Configuración`, email, and `Cerrar sesión` are visible.
- Tapping `Configuración` closes the sheet and navigates to `/admin/settings`.
- Backdrop, close button, and Escape dismiss the sheet.
- On a phone with a home indicator, nav controls do not overlap the safe area.
- Browser print preview excludes bottom nav and any open sheet.
- Existing pages using `AppShell` render without prop changes.

## Rollout and rollback

Rollout is a normal frontend deploy. The change is shell-only and dependency-free.

Rollback is a simple revert of the shell/mobile-nav file changes. There are no migrations, persisted state changes, package changes, or route contract changes.

## Non-goals preserved

- No desktop redesign.
- No new navigation routes.
- No new dependencies or UI libraries.
- No PWA/offline shell changes.
- No role-based navigation filtering.
- No generalized drawer/sheet component library.
