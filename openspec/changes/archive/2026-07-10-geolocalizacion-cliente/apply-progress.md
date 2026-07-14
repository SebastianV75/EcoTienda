# Apply Progress: geolocalizacion-cliente

## Status

`status`: success

`executive_summary`: First slice implemented end-to-end. The client form gains a button-triggered geolocation flow that autofills latitude/longitude, attempts a best-effort Google reverse geocode for the address, and surfaces a non-blocking Spanish status message while keeping every location field fully editable. Existing manual create/edit flows remain unchanged when the button is not used. `npm run lint` and `npm run build` pass.

## Completed tasks

| # | Task | Persisted checkbox | Status |
|---|------|--------------------|--------|
| 1 | Pass `googleMapsApiKey` into create/edit page entry points | `[x]` | done |
| 2 | Extend `ClientForm` contract with `googleMapsApiKey` and convert `address`/`latitude`/`longitude` to local controlled state | `[x]` | done |
| 3 | Add `Usar mi ubicación` button with explicit `navigator.geolocation.getCurrentPosition({ timeout: 5000 })` call from the handler only, plus loading state | `[x]` | done |
| 4 | Autofill coordinates on success and call Google Geocoding API via local `reverseGeocode` helper, populating `address` from `formatted_address` (best-effort) | `[x]` | done |
| 5 | Replace the static manual-location note with inline Spanish status messaging covering: unsupported browser, permission denied, timeout/unavailable, coordinates-only success, reverse-geocode failure, and full success | `[x]` | done |
| 6 | `npm run lint` and `npm run build` pass with no new errors | `[x]` | done (manual on-device checks pending) |

## Files changed

| File | Change |
|------|--------|
| `src/app/admin/clients/new/page.tsx` | Reads `process.env.GOOGLE_MAPS_API_KEY ?? null` and passes it to `ClientForm` as `googleMapsApiKey`. No other changes. |
| `src/app/admin/clients/[id]/edit/page.tsx` | Same env read and prop wiring, in addition to the existing `defaultValues` mapping. |
| `src/features/clients/client-form.tsx` | New `googleMapsApiKey` prop, controlled state for `address`/`latitude`/`longitude`, local `reverseGeocode` helper, geolocation button + handler, inline status message UI replacing the old static note. All other fields keep their uncontrolled `defaultValue` behavior. |

No new dependencies, no server action changes, no schema or route changes.

## Test commands run

| Command | Result |
|---------|--------|
| `npm run lint` | Passed (0 errors). One pre-existing warning in `src/features/documents/ubicacion-cliente-preview.tsx:165` about `<img>` vs `next/image` — unrelated to this change and present before. |
| `npm run build` | Passed. `✓ Compiled successfully in 2.1s`; TypeScript passed in 1762 ms. Both `ƒ /admin/clients/new` and `ƒ /admin/clients/[id]/edit` appear in the route list as expected. |

## TDD evidence

Not applicable. `strict_tdd` is false for this repository (per orchestrator context) and the project has no test runner configured. The proposal explicitly states validation runs through `npm run lint` + `npm run build`.

## Deviations from design

None. The implementation follows the design doc's:

- Component contract (`ClientFormProps.googleMapsApiKey?: string | null`).
- Data flow (button tap → support check → loading → `getCurrentPosition` with `timeout: 5000` → set coords → optional reverse geocode → set or preserve address → status message).
- `reverseGeocode` helper shape (URLSearchParams, `formatted_address` extraction, swallows all errors to `null`).
- Local-only state (`isLocating`, `locationMessage`, controlled `address`/`latitude`/`longitude`); other fields stay uncontrolled.
- Manual-entry parity: inputs are never disabled or read-only; failures never clear user data; submit remains tied only to `isPending`.
- Spanish message copy (unsupported browser, permission denied, timeout/unavailable, coordinates-only, reverse-geocode failure, full success).
- Static "Por ahora..." note replaced with a smaller, evergreen hint plus dynamic inline status.

## Remaining tasks

| # | Task | Persisted checkbox | Notes |
|---|------|--------------------|-------|
| — | — | — | All implementation tasks complete. The manual on-device checks listed under task 6 (real browser GPS, permission prompt, geocode happy path) require a real device with location services and could not be executed in this apply environment. The code paths are wired and `lint`/`build` pass; the verify phase or the user can run the on-device matrix. |

## Workload / PR boundary

- Estimated changed lines: ~120 (inside the 90–180 forecast).
- 400-line budget risk: Low.
- Delivery strategy: `single-pr` (per `tasks.md`).
- Suggested commit shape from tasks: 3 commits (pages + contract, form behavior, validation follow-up). The executor did not create commits (orchestrator/user owns git). The two logical units are cleanly separated:
  1. Wire `googleMapsApiKey` through both pages and add the prop on `ClientForm` (state conversion is naturally co-located with the prop, so all of `client-form.tsx` lands in commit 2 in practice).
  2. Geolocation state, button, autofill flow, and inline feedback in `client-form.tsx`.
  3. Validation-only commit (not needed — `lint`/`build` were clean on the first pass).

## Structured status

- Consumed: orchestrator-provided `Apply instructions` block, including `Artifact store: openspec`, `strict_tdd: false`, validation commands, and the manual-only constraints (button trigger, fill lat/lng, best-effort geocode, manual fallback, Spanish copy).
- Produced: this `apply-progress.md` and the updated `tasks.md` checkboxes.
- `actionContext`: not applicable to this executor; no edit-root restrictions encountered. All edits stayed inside the existing project tree under `src/` and `openspec/`.

## Skill resolution

`skill_resolution`: paths-injected (the three `SKILL.md` files listed in the parent prompt were read before work).
