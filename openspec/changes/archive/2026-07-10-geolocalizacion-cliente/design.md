# Assisted client geolocation design

Add an explicit, user-triggered geolocation flow to the existing client form. The first slice stays intentionally small: one button, browser coordinates, best-effort Google reverse geocoding, and non-blocking feedback while keeping all existing manual fields editable.

## Decision summary

| Area | Decision |
|------|----------|
| UI entry point | Add a `type="button"` control labeled `Usar mi ubicación` near the address/coordinate fields in `ClientForm`. |
| State model | Convert `address`, `latitude`, and `longitude` from uncontrolled `defaultValue` fields to local React state so geolocation can update them. Keep other fields unchanged. |
| Geolocation trigger | Call `navigator.geolocation.getCurrentPosition()` only from the button handler. Never request location on render. |
| Timeout | Use `timeout: 5000` in the Geolocation API options. |
| Reverse geocoding | After coordinates succeed, call Google Geocoding API with the existing `GOOGLE_MAPS_API_KEY` passed from the server page into the client component. |
| Failure handling | Show a short inline Spanish status message; never block submission, clear user input, or disable form fields. |
| Dependencies | No new packages. Use browser APIs, `fetch`, and existing styling patterns. |

## Current structure

`src/features/clients/client-form.tsx` is already a client component and owns the create/edit form UI. The create and edit pages render it directly:

- `src/app/admin/clients/new/page.tsx`
- `src/app/admin/clients/[id]/edit/page.tsx`

The form currently uses uncontrolled inputs with `defaultValue`. That works for manual submission, but assisted autofill needs controlled values for only the fields that geolocation updates.

The existing document preview already demonstrates the API-key pattern: server pages can read `process.env.GOOGLE_MAPS_API_KEY` and pass it into a client component as a prop. The same approach avoids adding a new public env var for this first slice.

## Proposed file changes

| File | Change |
|------|--------|
| `src/features/clients/client-form.tsx` | Add local state, geolocation button, handler, reverse-geocode helper, loading/status UI, and controlled `address`, `latitude`, `longitude` fields. |
| `src/app/admin/clients/new/page.tsx` | Read `process.env.GOOGLE_MAPS_API_KEY ?? null` and pass it to `ClientForm`. |
| `src/app/admin/clients/[id]/edit/page.tsx` | Read `process.env.GOOGLE_MAPS_API_KEY ?? null` and pass it to `ClientForm`. |

No server action, database, or route changes are required.

## Component contract

Extend `ClientFormProps` minimally:

```ts
type ClientFormProps = {
  mode: "create" | "edit";
  clientId?: string;
  defaultValues?: Partial<ClientFormValues>;
  googleMapsApiKey?: string | null;
};
```

`googleMapsApiKey` is optional so the form remains safe in environments where the key is missing. Missing key skips reverse geocoding after coordinates are captured and shows a non-blocking message.

## Data flow

1. User taps `Usar mi ubicación`.
2. Form checks `navigator.geolocation` support.
3. Button enters loading state and clears any previous geolocation status message.
4. `getCurrentPosition()` runs with a 5-second timeout.
5. On coordinate success:
   - `latitude` state is set from `position.coords.latitude`.
   - `longitude` state is set from `position.coords.longitude`.
   - The form attempts reverse geocoding if an API key exists.
6. On reverse-geocode success:
   - `address` state is replaced with the returned `formatted_address`.
   - A success message can confirm that location and address were filled.
7. On reverse-geocode failure or no results:
   - `address` remains unchanged.
   - A non-blocking Spanish message explains that the address can be entered manually.
8. On geolocation failure:
   - Existing field values remain unchanged.
   - A non-blocking Spanish message explains the failure.
9. Submission continues through the existing server action using the current field values.

## Reverse-geocoding approach

Use a small local helper inside `client-form.tsx` for the first slice:

```ts
async function reverseGeocode(latitude: string, longitude: string, apiKey: string) {
  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
  );

  if (!response.ok) return null;

  const payload = await response.json();
  return payload.results?.[0]?.formatted_address ?? null;
}
```

The implementation should not throw user-visible blocking errors. Network, quota, empty results, and malformed responses all resolve to `null` from the caller's perspective.

A separate shared service is intentionally deferred. There is only one caller in this slice, and extracting early would add indirection without current reuse.

## State and UI behavior

Use three small pieces of state in `ClientForm`:

- `isLocating: boolean` for button loading/disabled state.
- `locationMessage: { tone: "success" | "error" | "info"; text: string } | null` for inline feedback.
- Controlled values for `address`, `latitude`, and `longitude`.

Keep manual entry always available:

- Do not disable address/latitude/longitude inputs during geolocation.
- Do not make them read-only after autofill.
- Do not clear them on geolocation or reverse-geocode failure.
- If the user explicitly taps the autofill button and reverse geocoding succeeds, replacing the address is acceptable per the spec.

Button behavior:

- Default text: `Usar mi ubicación`.
- Loading text: `Obteniendo ubicación...`.
- Disable only the geolocation button while the request is active to prevent duplicate prompts/calls.
- The submit button behavior remains tied only to `isPending` from `useActionState`.

## Error and message copy

Use concise Spanish copy consistent with the current form:

| Case | Message |
|------|---------|
| Unsupported browser | `Tu navegador no permite obtener la ubicación. Puedes ingresar los datos manualmente.` |
| Permission denied | `Permiso de ubicación denegado. Puedes ingresar la dirección manualmente.` |
| Timeout/unavailable | `No se pudo obtener tu ubicación. Intenta de nuevo o captura los datos manualmente.` |
| Coordinates ok, no key | `Coordenadas capturadas. Ingresa la dirección manualmente.` |
| Reverse geocode no result/error | `Coordenadas capturadas, pero no se pudo determinar la dirección automáticamente.` |
| Full success | `Ubicación y dirección capturadas. Puedes ajustar los datos antes de guardar.` |

The message should be inline below the geolocation control or location fields. A toast system is not present in the current dependency set, so inline feedback avoids adding dependencies.

## Safety and failure modes

| Failure | Safe behavior |
|---------|---------------|
| Browser lacks Geolocation API | Show message; no field changes; manual path remains intact. |
| Permission denied | Show message; no field changes; manual path remains intact. |
| Geolocation times out | Show message; no field changes; manual path remains intact. |
| Google API key missing | Keep captured coordinates; leave address as-is; show manual-address message. |
| Google API fails/quota/network | Keep captured coordinates; leave address as-is; show non-blocking message. |
| Google returns zero results | Keep captured coordinates; leave address as-is; show non-blocking message. |

This keeps the implementation safe even when reverse geocoding fails: coordinates are useful by themselves, and the user can complete address entry manually.

## Minimal implementation notes

- Use `useState` from React alongside the existing `useActionState` import.
- Preserve existing `name` attributes so server actions receive the same form keys.
- Use `value` + `onChange` only for `address`, `latitude`, and `longitude`.
- Format coordinates with `String(position.coords.latitude)` and `String(position.coords.longitude)`; no accuracy validation or rounding is required in this slice.
- Add `maximumAge: 0` and `enableHighAccuracy: true` only if desired; the required option is `timeout: 5000`.
- Keep styling with the existing rounded border/card classes and mobile-first `w-full` behavior.

## Verification plan

Run:

```bash
npm run lint
npm run build
```

Manual checks:

- Create form renders with `Usar mi ubicación` and does not request permission on page load.
- Edit form renders with the same button and existing values.
- Successful geolocation fills latitude and longitude.
- Successful reverse geocoding replaces the address with `formatted_address`.
- Permission denied, timeout, missing API key, and Google API failure all show non-blocking messages and preserve manual submission.
- The address, latitude, and longitude fields remain editable before and after autofill.
