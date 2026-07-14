# Direct client selector navigation for Descargables templates

Remove the intermediate confirmation step when selecting a client in the Carta Poder and Ubicación del cliente template flows. Selecting a client from the dropdown navigates directly to the template preview, eliminating an unnecessary tap on mobile.

## Business problem

The current flow requires **three interactions** to reach the preview: (1) pick a client from the dropdown, (2) tap the submit button, (3) tap "Abrir vista previa". On mobile — the primary usage context — this extra tap after selection is pure friction. The user already made their decision; the intermediate confirmation adds no informational value because the preview page already shows the selected client's data.

## Target users and situations

- **Admin users** generating documents for clients on mobile devices (field work, in-store).
- **Workflow moment**: the admin has already decided which client's document to generate. They just need to see the preview to verify and print/download.

## Current-state gap

| Step | Current behavior | Problem |
|------|-----------------|---------|
| Select client | Dropdown + submit button | Form submit reloads the same page with `?clientId=` |
| Confirmation | Green box says "Cliente seleccionado" + "Abrir vista previa" link | Redundant — user already knows which client they picked |
| Preview | Navigate to `/preview?clientId=<id>` | This is the actual destination; everything before it is overhead |

## Proposed outcome

Selecting a client from the dropdown **immediately navigates** to the template preview page (`/admin/documents/{template}/preview?clientId=<id>`). No submit button, no confirmation section, no page reload on the selector page.

### Affected flows

1. **Carta Poder** — `/admin/documents/carta-poder` → direct nav to `/admin/documents/carta-poder/preview?clientId=<id>`
2. **Ubicación del cliente** — `/admin/documents/ubicacion-cliente` → direct nav to `/admin/documents/ubicacion-cliente/preview?clientId=<id>`

### Standard for future templates

This direct-selection pattern becomes the default behavior for any new template added to Descargables (e.g., Formato CFE when it becomes active).

## Scope

### In scope

- Convert the client `<select>` in both template pages to trigger direct navigation on change.
- Remove the submit button ("Autollenar plantilla" / "Seleccionar cliente").
- Remove the confirmation section that appears after selection (the green box with "Abrir vista previa" link).
- Keep the preview pages unchanged — they already handle `?clientId=` correctly.
- Keep the "Volver a descargables" back-navigation link.
- Preserve the empty/default state ("Selecciona un cliente") in the dropdown.

### Non-goals

- No changes to preview page content, layout, or data fetching.
- No changes to the Descargables index page (`/admin/documents`).
- No changes to client data, forms, or CRUD operations.
- No new routes or URL structure changes.
- No changes to the Formato CFE placeholder (still "Pendiente").

## Implementation approach (high-level)

The selector pages are currently server components. The `<select>` needs an `onChange` handler for client-side navigation, which requires extracting the selector into a client component (or converting the page). The component uses `router.push()` (or `router.replace()`) to navigate to the preview URL when a client is selected.

Key decisions deferred to design/implementation:

- `router.push` vs `router.replace` — `replace` is cleaner (no back-to-selector in history) but `push` preserves browser back behavior. Recommend `push` so back button returns to the selector if the user wants to pick a different client.
- Whether to keep the page as a server component with a small client island for the select, or convert the whole page. The island approach is lighter.

## Risks and tradeoffs

| Risk | Mitigation |
|------|-----------|
| User accidentally selects wrong client and lands on preview | Preview page already has a client switcher and back link; no data is mutated |
| Native `<select>` onChange fires on every keyboard arrow during exploration | On mobile (primary context), native select fires onChange only on final selection. On desktop, the dropdown behavior is the same — onChange fires when the user confirms their choice |
| Losing the ability to "see which client is selected" without navigating | The preview page shows the client's full data prominently; this is strictly more informative than a label |

## Rollback

Revert the two template page files. No data migration, no schema changes, no downstream dependencies.

## Success criteria

- Selecting a client in Carta Poder navigates directly to the Carta Poder preview.
- Selecting a client in Ubicación del cliente navigates directly to the Ubicación del cliente preview.
- No submit button or confirmation section remains on either selector page.
- Preview pages work identically to today (no regressions).
- Back button from preview returns to the selector page.
- Mobile UX: the flow is select → preview in two taps instead of four.
