# Delta for Documents

## MODIFIED Requirements

### Requirement: Direct Client or Work Selection Navigation

The client or work selector on Carta Poder and Ubicación del cliente template pages MUST navigate directly to its preview when staff make a selection. Client targets MUST remain `/admin/documents/{template}/preview?clientId=<id>`; work targets MUST identify the selected `Trabajo`. The selector MUST NOT display a submit button or confirmation section.

(Previously: Direct navigation required selection of a client only.)

#### Scenario: Selecting a client in Carta Poder navigates to preview

- GIVEN an admin user is on `/admin/documents/carta-poder`
- WHEN they select a client from the dropdown
- THEN the browser navigates to `/admin/documents/carta-poder/preview?clientId=<selected-id>`
- AND no submit button or confirmation section is present

#### Scenario: Selecting a client in Ubicación del cliente navigates to preview

- GIVEN an admin user is on `/admin/documents/ubicacion-cliente`
- WHEN they select a client from the dropdown
- THEN the browser navigates to `/admin/documents/ubicacion-cliente/preview?clientId=<selected-id>`
- AND no submit button or confirmation section is present

#### Scenario: Selecting work navigates to preview

- GIVEN an admin is on a supported template selector
- WHEN they select a `Trabajo`
- THEN the browser navigates directly to that template preview for the selected work
- AND no submit button or confirmation section is present

#### Scenario: Default selector state shows placeholder

- GIVEN an admin is on either supported selector page
- WHEN the page loads
- THEN no work is selected and no navigation occurs

## MODIFIED Requirements

### Requirement: Preview Pages Support Client and Trabajo Data

Preview pages (`/admin/documents/{template}/preview`) MUST continue to render the selected client when given `?clientId=<id>` and MUST render the selected `Trabajo` when given its work identifier. Preview layout and client-switching behavior MUST remain available; work-based previews MUST use accumulated work history as their source defaults.

(Previously: preview pages accepted only `?clientId=<id>` and their data fetching could not change.)

#### Scenario: Preview renders correctly after client navigation

- GIVEN an admin navigated from the selector using `clientId`
- WHEN the preview page loads
- THEN it displays the correct template preview for the selected client
- AND the existing back link remains functional

#### Scenario: Preview renders correctly after work navigation

- GIVEN an admin navigated from the selector using a `Trabajo` identifier
- WHEN the preview page loads
- THEN it displays the correct template preview with that work's defaults

## ADDED Requirements

### Requirement: Trabajo Data Defaults and Overrides

Supported document previews MUST derive applicable defaults from the selected `Trabajo` history. Staff MAY override a prefilled field before export; the override MUST NOT update the `Trabajo` or source stage records.

#### Scenario: Work history prefills a preview

- GIVEN a selected `Trabajo` has accumulated relevant data
- WHEN its document preview loads
- THEN applicable fields are prefilled from that history

#### Scenario: Preview override is isolated

- GIVEN a prefilled document preview
- WHEN staff override a field and export
- THEN only the exported document uses the override
