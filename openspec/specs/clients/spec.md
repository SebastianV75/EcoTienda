# Clients Specification

## Purpose

Define the client create/edit form behavior for capturing a client's location — including manual entry and an assisted geolocation flow that uses the browser's Geolocation API and reverse geocoding to autofill coordinates and address.

## Requirements

### Requirement: Geolocation Button Presence

The client form MUST display a button labeled "Usar mi ubicación" that is visible in both create and edit modes.

The button MUST be reachable and operable on mobile viewports (minimum 320px width).

#### Scenario: Button visible on create

- GIVEN a user is on the client create form
- WHEN the form renders
- THEN a "Usar mi ubicación" button is visible

#### Scenario: Button visible on edit

- GIVEN a user is editing an existing client
- WHEN the form renders
- THEN the "Usar mi ubicación" button is visible alongside the latitude, longitude, and address fields

### Requirement: Explicit User Trigger

The system MUST NOT request geolocation permission automatically on page load or form render. Geolocation MUST only be triggered when the user explicitly taps the "Usar mi ubicación" button.

#### Scenario: No automatic geolocation

- GIVEN a user opens the client form
- WHEN the page loads
- THEN no geolocation permission prompt appears
- AND no geolocation API call is made

### Requirement: Geolocation Permission Request

When the user taps "Usar mi ubicación", the system MUST call the browser's Geolocation API (`navigator.geolocation.getCurrentPosition()`) to request the device's current position.

#### Scenario: User grants permission

- GIVEN the user taps "Usar mi ubicación"
- WHEN the browser displays a geolocation permission prompt
- AND the user grants permission
- THEN the system obtains the current GPS coordinates

#### Scenario: Browser does not support geolocation

- GIVEN the user taps "Usar mi ubicación"
- AND the browser does not support the Geolocation API
- THEN the system displays a non-blocking error message informing the user that geolocation is not available
- AND the form remains fully editable

### Requirement: Coordinate Autofill

On successful geolocation, the system MUST automatically populate the latitude and longitude form fields with the obtained coordinates.

The populated values MUST be editable — the user MUST be able to modify them after autofill.

#### Scenario: Coordinates autofilled

- GIVEN the user tapped "Usar mi ubicación"
- AND geolocation succeeded with coordinates latitude 19.4326, longitude -99.1332
- WHEN the geolocation result is processed
- THEN the latitude field contains 19.4326
- AND the longitude field contains -99.1332
- AND both fields remain editable

### Requirement: Reverse Geocoding (Best-Effort)

After obtaining coordinates, the system MUST attempt to reverse-geocode the coordinates into a human-readable address using the Google Maps Geocoding API.

The reverse-geocode attempt MUST be best-effort: success populates the address field; failure does NOT block the form or prevent saving.

If the address field already contains user-entered text, the reverse-geocoded address SHOULD replace it (the user explicitly requested autofill).

#### Scenario: Reverse geocode succeeds

- GIVEN geolocation returned coordinates
- AND the Google Maps Geocoding API returns a valid address
- WHEN the reverse-geocode response is processed
- THEN the address field is populated with the returned human-readable address

#### Scenario: Reverse geocode returns no results

- GIVEN geolocation returned coordinates
- AND the Google Maps Geocoding API returns zero results
- WHEN the reverse-geocode response is processed
- THEN the address field is left unchanged
- AND a non-blocking message informs the user that the address could not be determined automatically

#### Scenario: Reverse geocode API error

- GIVEN geolocation returned coordinates
- AND the Google Maps Geocoding API call fails (network error, timeout, quota)
- WHEN the reverse-geocode response is processed
- THEN the address field is left unchanged
- AND a non-blocking message informs the user that the address could not be determined

### Requirement: Geolocation Timeout

The geolocation request MUST have a timeout of no more than 5 seconds. If the timeout elapses before a position is obtained, the system MUST treat it as a failure.

#### Scenario: Geolocation times out

- GIVEN the user tapped "Usar mi ubicación"
- AND the device does not return a position within 5 seconds
- WHEN the timeout elapses
- THEN the system displays a non-blocking message indicating that location could not be determined
- AND the form remains fully editable

### Requirement: Non-Blocking Error Handling

All geolocation and reverse-geocoding failures MUST be communicated to the user via a brief, non-blocking message (toast or inline notification).

Failures MUST NOT:

- Disable any form field
- Prevent form submission
- Clear any data the user has already entered
- Block navigation away from the form

#### Scenario: Permission denied

- GIVEN the user taps "Usar mi ubicación"
- AND the user denies the browser's geolocation permission
- WHEN the permission denial is received
- THEN a brief message is shown (e.g., "Permiso de ubicación denegado. Puedes ingresar la dirección manualmente.")
- AND all form fields remain editable
- AND the user can submit the form normally

#### Scenario: Form submission after geolocation failure

- GIVEN geolocation failed (any reason)
- AND the user manually entered latitude, longitude, and address
- WHEN the user submits the form
- THEN the client is saved with the manually entered data
- AND no geolocation-related error blocks the save

### Requirement: Manual Entry Parity

The latitude, longitude, and address fields MUST always be manually editable regardless of whether the geolocation button was used.

No field MUST ever be locked, disabled, or made read-only as a result of the geolocation flow.

#### Scenario: Manual entry without geolocation

- GIVEN a user is on the client form
- WHEN the user does not tap "Usar mi ubicación"
- THEN the user can type latitude, longitude, and address manually
- AND the form submits normally with the manually entered values

#### Scenario: Edit after autofill

- GIVEN the user tapped "Usar mi ubicación"
- AND coordinates and address were autofilled
- WHEN the user modifies any of the autofilled fields
- THEN the modified values are accepted
- AND form submission uses the user-modified values

### Requirement: Loading State Feedback

While a geolocation request is in progress, the system MUST provide visual feedback that the operation is ongoing (e.g., button loading indicator, disabled button state).

The user MUST be able to understand that the system is waiting for their device's location.

#### Scenario: Loading indicator during geolocation

- GIVEN the user taps "Usar mi ubicación"
- WHEN the geolocation request is in progress
- THEN the button shows a loading state (e.g., spinner or "Obteniendo ubicación..." text)
- AND the button is not repeatedly tappable during the request

### Requirement: Existing Form Behavior Preserved

The geolocation feature MUST NOT alter any existing form behavior. Client create and edit flows MUST continue to work identically when the geolocation button is not used.

#### Scenario: Create flow unchanged

- GIVEN a user creates a new client without using geolocation
- WHEN they fill all required fields manually and submit
- THEN the client is created exactly as before this change

#### Scenario: Edit flow unchanged

- GIVEN a user edits an existing client without using geolocation
- WHEN they modify fields and submit
- THEN the client is updated exactly as before this change

### Requirement: Spanish UI Copy

All user-facing text related to the geolocation feature MUST be in Spanish, consistent with the rest of the application.

#### Scenario: All copy in Spanish

- GIVEN the client form is rendered
- WHEN the user inspects all geolocation-related text (button label, loading state, error messages)
- THEN all text is in Spanish

### Requirement: Solar Equipment Data Fields

The `ClientRecord` type MUST be extended with the following nullable fields to support the unifilar diagram data panel. All new fields MUST be additive — no existing fields are modified or removed.

#### Solar equipment fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `panel_count` | `string \| null` | Yes | Cantidad de paneles solares |
| `panel_power` | `string \| null` | Yes | Potencia de los paneles (e.g., "550W") |
| `inverter` | `string \| null` | Yes | Modelo/marca del inversor |
| `installed_capacity` | `string \| null` | Yes | Capacidad instalada (e.g., "3.3 kWp") |
| `estimated_monthly_generation` | `string \| null` | Yes | Generación media mensual estimada (e.g., "450 kWh") |

#### Scenario: New fields are nullable and backward-compatible

- GIVEN an existing client record in the database
- WHEN the record is fetched
- THEN all new fields (`panel_count`, `panel_power`, `inverter`, `installed_capacity`, `estimated_monthly_generation`) are present in the `ClientRecord` type
- AND each new field is `null` when not yet populated

#### Scenario: Database schema accepts null values

- GIVEN the database migration has been applied
- WHEN a new client is created without providing any solar equipment fields
- THEN the client is created successfully
- AND all new columns contain `NULL`

#### Scenario: Fields can be populated via Supabase

- GIVEN an existing client record
- WHEN an admin updates the `panel_count` and `inverter` fields via the Supabase dashboard
- THEN the updated values are returned when the client record is fetched by the application
