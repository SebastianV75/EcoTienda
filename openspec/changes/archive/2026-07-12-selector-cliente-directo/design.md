# Design: Direct client selector navigation

## Summary

Keep both document selector pages as Server Components and extract only the client `<select>` into a small Client Component island. The island receives server-loaded clients plus a template route segment, and uses `router.push()` on selection to navigate directly to the existing preview route. Preview pages, routes, data access, and the Descargables index remain unchanged.

## Key decisions

| Area | Decision |
|------|----------|
| Rendering boundary | Preserve `src/app/admin/documents/carta-poder/page.tsx` and `src/app/admin/documents/ubicacion-cliente/page.tsx` as Server Components. |
| Client interactivity | Add one minimal selector Client Component for the `onChange` handler instead of converting full pages to client rendering. |
| Navigation API | Use `router.push()` from `next/navigation`, not `replace`, so browser Back returns to the selector page. |
| URL contract | Build preview URLs as `/admin/documents/${template}/preview?clientId=${encodeURIComponent(clientId)}`. |
| Default state | The selector always renders with `defaultValue=""` and placeholder `Selecciona un cliente`; selecting the placeholder performs no navigation. |
| Existing data access | Continue loading clients on the server with `getClients()` and admin access with `requireRole(["admin"])`. |
| Scope boundary | Apply only to Carta Poder and Ubicación del cliente selector pages. No preview, index, Formato CFE, CRUD, route, or dependency changes. |
| UX state | While navigation is pending, disable the selector and optionally show a concise loading status to prevent repeated selection. |

## Data flow

1. Admin opens `/admin/documents/carta-poder` or `/admin/documents/ubicacion-cliente`.
2. The selector page remains server-rendered:
   - `requireRole(["admin"])` validates access.
   - `getClients()` retrieves the dropdown options.
3. The page renders the shared selector island with:
   - `clients`,
   - `template` (`"carta-poder"` or `"ubicacion-cliente"`),
   - the existing select label/copy and class styling.
4. The selector starts in placeholder state with no selected client.
5. When the admin selects a non-empty client ID, the Client Component calls `router.push()` with the preview URL.
6. The existing preview page loads and continues its current server data flow using `getClientById(clientId)`.
7. Browser Back returns to the selector page because navigation used `push`; the selector page renders again with the placeholder selected.

## File-level plan

| File | Change |
|------|--------|
| `src/features/documents/client-preview-selector.tsx` | New Client Component island containing the label, `<select>`, placeholder option, client options, `router.push` navigation, and pending state. |
| `src/app/admin/documents/carta-poder/page.tsx` | Keep server auth/client loading. Remove `searchParams`, selected-client state, form submit button, and confirmation section. Render the selector island with `template="carta-poder"`. |
| `src/app/admin/documents/ubicacion-cliente/page.tsx` | Same cleanup as Carta Poder. Render the selector island with `template="ubicacion-cliente"`. |

No changes are planned for:

- `src/app/admin/documents/carta-poder/preview/page.tsx`
- `src/app/admin/documents/ubicacion-cliente/preview/page.tsx`
- `src/app/admin/documents/page.tsx`
- client data helpers, schemas, middleware, or dependencies

## Component contract

### `ClientPreviewSelector`

Proposed shape:

```ts
type DocumentTemplateSlug = "carta-poder" | "ubicacion-cliente";

type ClientPreviewSelectorClient = {
  id: string;
  full_name: string;
  rpu: string | null;
};

type ClientPreviewSelectorProps = {
  clients: ClientPreviewSelectorClient[];
  template: DocumentTemplateSlug;
};
```

Behavior contract:

- MUST include `<option value="">Selecciona un cliente</option>`.
- MUST ignore empty values and not navigate when the placeholder is selected.
- MUST use `router.push`, not `router.replace`.
- MUST disable the select while the navigation transition is pending.
- MUST keep the selector accessible with `htmlFor="clientId"`, `id="clientId"`, and `name="clientId"`.
- MUST not submit a form or require an additional button click.

Implementation sketch:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ClientPreviewSelector({ clients, template }: ClientPreviewSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const clientId = event.target.value;

    if (!clientId) {
      return;
    }

    startTransition(() => {
      router.push(
        `/admin/documents/${template}/preview?clientId=${encodeURIComponent(clientId)}`,
      );
    });
  }

  return (
    <div className="space-y-2.5">
      <label htmlFor="clientId" className="text-sm font-medium text-[var(--brand-deep)]">
        Cliente
      </label>
      <select
        id="clientId"
        name="clientId"
        defaultValue=""
        disabled={isPending}
        onChange={handleChange}
        className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300 disabled:cursor-wait disabled:opacity-70"
      >
        <option value="">Selecciona un cliente</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.full_name} · {client.rpu}
          </option>
        ))}
      </select>
      {isPending ? (
        <p className="text-sm text-[var(--muted)]" role="status">
          Abriendo vista previa…
        </p>
      ) : null}
    </div>
  );
}
```

The implementation may adjust formatting, but must preserve the behavior contract and existing visual language.

## Page structure

Each selector page should keep the existing `AppShell`, title, description, and `Volver a descargables` link. The selector card becomes a simple section containing the selector island, not a form with submit behavior.

Expected structure:

```tsx
<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
  <ClientPreviewSelector clients={clients} template="carta-poder" />
</section>
```

Remove from both pages:

- `searchParams` parsing for `clientId`.
- `selectedClientId` state derived from query params.
- `<form>` wrapper if it exists only for submit layout.
- Submit button text such as `Autollenar plantilla` or `Seleccionar cliente`.
- Confirmation section containing `Cliente seleccionado` and `Abrir vista previa`.

## UX and accessibility

- The flow is intentionally immediate: select a client, then load preview.
- No animation is needed for navigation; this is a frequent workflow action and should feel instant.
- Keep native `<select>` behavior because it gives the best mobile picker experience without dependencies.
- Pending state should be subtle and functional, not decorative.
- The browser Back behavior is part of the product contract; do not replace it with custom state management.

## Testing and verification

Automated test coverage is not currently evident from project scripts; use the existing `npm run lint` workflow and manual browser checks for this slice.

Manual checks:

- Open `/admin/documents/carta-poder`.
  - Confirm the placeholder says `Selecciona un cliente`.
  - Confirm no submit button or confirmation box appears.
  - Select a client and verify navigation to `/admin/documents/carta-poder/preview?clientId=<id>`.
  - Press browser Back and verify return to `/admin/documents/carta-poder` with placeholder state.
- Repeat the same checks for `/admin/documents/ubicacion-cliente`.
- Verify both preview pages still render the selected client's existing data and actions.
- Verify `/admin/documents` still shows the same template list and Formato CFE remains `Pendiente` with `href: "#"`.

## Rollout and rollback

Rollout is a normal frontend deploy. The change is UI-only, route-compatible, and does not alter persisted data or dependencies.

Rollback is a revert of the new selector component plus the two selector page edits. Preview routes and client data access remain untouched.
