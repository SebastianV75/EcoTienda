# trabajo-detail-display Specification

## Purpose

Governs how the admin Trabajo detail view renders the four JSONB attribute
groups captured during a Visita Técnica — `house_attributes`,
`electrical_attributes`, `roof_attributes`, `minisplit_attributes` — so the
admin reads translated, typed, layout-paired fields instead of raw JSON.

## Requirements

### Requirement: Legible Attribute Rendering

The system MUST render each populated JSONB attribute group as a list of
label/value pairs. It MUST NOT display raw JSON (braces `{}`, surrounding
quotes, or snake_case keys) to the user.

#### Scenario: Happy path — populated groups

- GIVEN a Trabajo with a completed visita and populated `house_attributes`
- WHEN the admin opens the Trabajo detail view
- THEN the group renders as label/value pairs
- AND no braces, quotes, or snake_case keys appear

#### Scenario: Empty group is hidden

- GIVEN a visita whose `minisplit_attributes` is an empty object
- WHEN the admin views the Trabajo detail
- THEN the minisplit group section is not rendered

#### Scenario: Visita not completed

- GIVEN a Trabajo whose `visita` is null
- WHEN the admin views the Trabajo detail
- THEN the Visita Técnica section shows "Visita no completada."

### Requirement: Spanish Label Translation

The system SHALL translate each attribute key to a Spanish label via a
curated dictionary keyed per group. Unknown keys MUST fall back to a Title
Case humanization of the snake_case key. Fields MUST render in the curated
dictionary order, not JSONB insertion order.

#### Scenario: Known key translation

- GIVEN `roof_attributes` contains key `roof_material`
- WHEN the group renders
- THEN the label shown is "Material del techo"

#### Scenario: Boolean key translation

- GIVEN `electrical_attributes` contains key `has_mufa`
- WHEN the group renders
- THEN the label shown is "Tiene mufa"

#### Scenario: Unknown key fallback

- GIVEN a future key not present in the dictionary
- WHEN the group renders
- THEN the label is a humanized Title Case form of the key
- AND no error is raised

### Requirement: Type-Aware Value Rendering

The system MUST render each value according to its type:

| Value type        | Rendered as                |
|-------------------|----------------------------|
| null / undefined  | `—`                        |
| empty string      | `—`                        |
| boolean `true`    | `Sí`                       |
| boolean `false`   | `No`                       |
| asset ID key      | image preview (not raw UUID) |
| other string/num  | the value itself           |

Keys whose names indicate media (`*_image`, `*_photo`, `*_video`, and
similar asset-ID holders) MUST be detected as media keys.

#### Scenario: Boolean true

- GIVEN `has_mufa` equals `true`
- WHEN the field renders
- THEN the value shown is "Sí"

#### Scenario: Null value fallback

- GIVEN `roof_material` is null
- WHEN the field renders
- THEN the value shown is `—`

#### Scenario: Asset ID rendered as preview

- GIVEN `roof_attributes` has key `roof_image` holding a storage asset ID
- WHEN the field renders
- THEN an image preview is shown
- AND the raw UUID is not displayed as text

#### Scenario: Plain string value

- GIVEN `house_attributes` key `roof_material` holds "Lámina"
- WHEN the field renders
- THEN the value shown is "Lámina"

### Requirement: Question-Above / Answer-Below Layout

The system MUST present each attribute with the translated label above and
the value below, using the same design tokens already applied in the Visita
Técnica section (label muted/brand-strong, value foreground).

#### Scenario: Pair orientation

- GIVEN any rendered attribute in any of the four groups
- WHEN the pair displays
- THEN the label appears above the value
- AND the label/value styles match the existing visita field pairs

### Requirement: Presentational-Only Constraint

The change MUST NOT alter the database schema, migrations, server actions,
or `rules.ts`. It is presentational on the Trabajo detail view only.

#### Scenario: No data-layer regression

- GIVEN the change is applied
- WHEN the diff is reviewed
- THEN server action files, `rules.ts`, and schema files show zero changes