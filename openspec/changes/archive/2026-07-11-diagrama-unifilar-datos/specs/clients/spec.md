# Delta for Clients

## ADDED Requirements

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
