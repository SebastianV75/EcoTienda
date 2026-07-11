# Assisted Geolocation for Client Capture

Add a "use my location" button to the client create/edit form so field staff can capture GPS coordinates and a reverse-geocoded address in one tap, without blocking manual entry when geolocation is unavailable.

## Business Problem

Field staff register clients at their homes or businesses. Today they must look up latitude, longitude, and address manually — a slow, error-prone process on mobile. This slows down client onboarding and produces inaccurate location data that affects downstream document previews (the `ubicacion-cliente` preview already renders these coordinates).

## Target Users and Situations

| Who | When | Urgency |
|-----|------|---------|
| Field admin staff on mobile | Creating a new client or editing an existing client's address/coordinates | High — they are on-site with the client |

## Current-State Gap

- The client form (`src/features/clients/client-form.tsx`) exposes `latitude`, `longitude`, and `address` as manual text inputs.
- A static note says: *"Por ahora la ubicación se captura con dirección y coordenadas manuales."*
- No browser Geolocation API integration exists.
- No reverse-geocoding helper exists.
- The existing `ubicacion-cliente` canonical spec covers the **preview** side (document workflow); this change covers the **capture** side.

## Product Outcome

After this change:

1. A button labeled **"Usar mi ubicación"** is visible in the client form.
2. Tapping it requests the browser's geolocation permission.
3. On success: latitude and longitude fields are filled automatically, AND the system attempts to reverse-geocode the coordinates into the address field.
4. On failure (permission denied, timeout, reverse-geocode error): the user sees a brief, non-blocking message and can continue filling the form manually.
5. The manual entry path remains fully functional at all times — no field is locked or disabled.

## Scope (First Slice)

### In Scope

| Area | Detail |
|------|--------|
| Geolocation button | Add a "Usar mi ubicación" button to `client-form.tsx` |
| Browser Geolocation API | Call `navigator.geolocation.getCurrentPosition()` on tap |
| Latitude/longitude autofill | Write the obtained coordinates into the existing form fields |
| Reverse-geocode attempt | Best-effort call to Google Maps Geocoding API to populate the address field |
| Error handling | Non-blocking toast or inline message on failure; form remains editable |
| Mobile UX | Button placement and feedback must work on 320px+ viewports |
| Edit mode | Same button available when editing an existing client |

### Non-Goals

| Area | Reason |
|------|--------|
| Interactive map picker | Separate concern; can be added later without breaking this slice |
| Automatic geolocation on page load | Intrusive; user should explicitly opt in per tap |
| Making lat/lng or address read-only | Manual entry must always work |
| Geocoding API key management changes | Use the existing `GOOGLE_MAPS_API_KEY` |
| Location accuracy validation | Out of scope for first slice; trust device GPS |
| Batch geolocation or import | Different workflow entirely |

## Constraints

| Constraint | Implication |
|------------|-------------|
| Mobile-first, Spanish UI | All copy in Spanish; button must be thumb-reachable |
| Mexican internal users | Google Maps Geocoding API works well in Mexico; no alternative provider needed |
| Existing `GOOGLE_MAPS_API_KEY` | Reuse for reverse geocoding; no new env var |
| No test runner configured | Validate via `npm run lint` + `npm run build` |
| Server actions for persistence | Geolocation is client-side only; no server action changes needed for this slice |

## Risks and Tradeoffs

| Risk | Severity | Mitigation |
|------|----------|------------|
| Geolocation permission denied on mobile browser | Medium | Show clear message; manual entry always available |
| Reverse-geocode returns inaccurate or empty address | Medium | Treat as best-effort; user can edit the address field after autofill |
| Geocoding API latency on slow connections | Low | Set a short timeout (3–5 s); do not block form submission |
| Geocoding API quota exhaustion | Low | This is an internal tool with low request volume; monitor if it becomes an issue |
| HTTPS requirement for Geolocation API | Low | App already runs on HTTPS in production; localhost works for dev |

## Rollback

This change is purely additive to the client form UI. Rolling back means removing the geolocation button and its handler — no database migrations, no API changes, no impact on existing client records.

## Success Criteria

1. Field staff can tap "Usar mi ubicación" and see lat/lng fields populated within 5 seconds on a mobile device with GPS enabled.
2. When reverse geocoding succeeds, the address field is pre-filled with a human-readable address.
3. When geolocation fails or is denied, the form shows a brief message and the user can save the client with manually entered data — no blocking error.
4. Existing create and edit flows continue to work identically when the button is not used.
5. `npm run lint` and `npm run build` pass with no new errors.

## Affected Areas

| Area | Impact |
|------|--------|
| `src/features/clients/client-form.tsx` | Add button, geolocation handler, reverse-geocode call |
| Client form UX | New interactive element; loading state while geolocating |
| Google Maps Geocoding API | New client-side call using existing API key |
| No database changes | Coordinates and address fields already exist |
| No server action changes | Form submission logic unchanged |
