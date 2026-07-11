# Tasks: geolocalizacion-cliente

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 90-180 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Quick path

1. Wire the existing Google Maps API key into the client form on create and edit pages.
2. Add the button-triggered geolocation flow in the client form without breaking manual entry.
3. Validate create/edit flows plus `npm run lint` and `npm run build`.

## Implementation tasks

- [x] 1. Pass the reverse-geocoding key into the form entry points.
  - File: `src/app/admin/clients/new/page.tsx`
  - File: `src/app/admin/clients/[id]/edit/page.tsx`
  - Add `process.env.GOOGLE_MAPS_API_KEY ?? null` and pass it as `googleMapsApiKey` to `ClientForm`.
  - Verification: both pages still render `ClientForm` with no route or data-loading changes.

- [x] 2. Extend the `ClientForm` contract for assisted geolocation.
  - File: `src/features/clients/client-form.tsx`
  - Add optional prop `googleMapsApiKey?: string | null`.
  - Convert only `address`, `latitude`, and `longitude` from `defaultValue` to local controlled state; keep the rest of the form unchanged.
  - Verification: create and edit modes still submit the same field names (`address`, `latitude`, `longitude`).

- [x] 3. Add the explicit geolocation action and loading state.
  - File: `src/features/clients/client-form.tsx`
  - Add a `type="button"` control labeled `Usar mi ubicación` near the location fields.
  - Implement `navigator.geolocation.getCurrentPosition()` from the button handler only, with `timeout: 5000`.
  - Add loading feedback (`Obteniendo ubicación...`) and prevent repeated taps while the request is active.
  - Verification: no geolocation request happens on initial render; the button is visible in both create and edit flows.

- [x] 4. Autofill coordinates and attempt best-effort reverse geocoding.
  - File: `src/features/clients/client-form.tsx`
  - On geolocation success, set `latitude` and `longitude` from the browser result.
  - Add a local helper that calls Google Geocoding API with `fetch` and fills `address` from `formatted_address` when available.
  - If the key is missing, the API returns no results, or the request fails, keep the current address unchanged.
  - Verification: autofilled values remain editable after population.

- [x] 5. Add non-blocking Spanish feedback for success and failure paths.
  - File: `src/features/clients/client-form.tsx`
  - Replace the current static manual-location note with inline status messaging that covers: unsupported browser, permission denied, timeout/unavailable, coordinates-only success, reverse-geocode failure, and full success.
  - Do not disable form fields or block submission on any geolocation/reverse-geocoding failure.
  - Verification: manual entry remains available before and after pressing the button.

- [x] 6. Run the current safety net and perform focused manual checks.
  - Command: `npm run lint`
  - Command: `npm run build`
  - Manual checks:
    - Create page shows `Usar mi ubicación` without prompting on load.
    - Edit page shows the same button with existing values preserved.
    - Successful geolocation fills latitude/longitude.
    - Reverse geocoding success replaces the address.
    - Permission denied, timeout, missing API key, and API failure show non-blocking Spanish feedback.
    - Form submission still works when the button is never used and after a failed geolocation attempt.

## Suggested commit shape

- Commit 1: wire `googleMapsApiKey` through create/edit pages and extend `ClientForm` props.
- Commit 2: add geolocation state, button, autofill flow, and inline feedback in `src/features/clients/client-form.tsx`.
- Commit 3: validation-only follow-up if lint/build or manual checks require small cleanup.
