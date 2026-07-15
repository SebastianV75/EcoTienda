# Formato CFE — define autofill data contract before implementation

Define the exact data contract required to autofill the CFE interconnection request template from EcoTienda data, separating reusable client data from EcoTienda contact data and trámite-specific fields before any UI or PDF/print implementation begins.

## Business problem

The CFE template contains a much broader field set than Carta Poder, Ubicación del cliente, or the current unifilar data panel. If we implement it by guessing or by dumping every field into `clients`, we will repeat the same mistake we already corrected in the unifilar flow: mixing client identity, company contact, and trámite-only values into one model without ownership boundaries.

The template must be analyzed as a data contract first. Only then should we decide what belongs in the reusable client record, what belongs to EcoTienda as fixed/frequently reused business data, and what belongs to a specific CFE request.

## Verified template sections from the reference image

### Header

- Fecha
- Número de solicitud

### I. Datos del solicitante

- Nombre / denominación o razón social
- Calle
- Número exterior
- Número interior
- Código postal
- Colonia / población
- Delegación / municipio
- Estado
- Teléfono
- Correo electrónico
- Fax

### II. Datos de contacto

- Nombre
- Puesto
- Calle
- Número exterior
- Número interior
- Código postal
- Colonia / población
- Delegación / municipio
- Estado
- Teléfono
- Correo electrónico
- Fax

### III. Datos del solicitante

- Modalidad: baja tensión / media tensión

### IV. Utilización de la energía eléctrica producida

- Consumo de centros de carga
- Consumo de centros de carga y venta de excedentes
- Venta total

### V. Datos del servicio de suministro actual

- Registro público de usuario (RPU)
- Nivel de tensión de suministro

### VI. Central eléctrica

- Fecha estimada de operación normal
- Capacidad bruta instalada (kW)
- Capacidad a incrementar (kW) opcional
- Generación promedio mensual estimada

### VII. Manifestación de cumplimiento / tecnología

- Confirmación de cumplimiento
- Tecnología: solar / eólico / biomasa / cogeneración / otro + especificar
- Número de unidades de generación
- Combustible principal
- Combustible secundario
- Coordenadas UTM X
- Coordenadas UTM Y

### Signature / stamp area

- Nombre
- Cargo
- Fecha
- Sello y firma del centro de atención (non-goal for autofill)

## What the current system already has

Existing reusable client fields available today:

- `full_name`
- `phone`
- `address`
- `neighborhood`
- `rfc`
- `rpu`
- `latitude`
- `longitude`
- `panel_count`
- `panel_power`
- `inverter`
- `installed_capacity`
- `estimated_monthly_generation`

## Core planning decision

Do NOT model the CFE template as a single flat extension of `clients`.

The template clearly mixes three ownership domains:

1. **Reusable client data**
   - identity, address, phone, RPU, solar installation facts
2. **EcoTienda / representative contact data**
   - the "Datos de contacto" block appears to be company-side or representative-side, not always the final client
3. **CFE trámite-specific data**
   - request date/number, supply tension level, usage mode, estimated operation date, UTM coordinates, signatory metadata, optional capacity increase, etc.

## Scope of this planning change

1. Record the verified field inventory from the scanned template.
2. Classify each field by ownership domain: client vs EcoTienda contact vs CFE request.
3. Identify which template values can be autofilled from current data and which are still missing.
4. Prevent premature implementation until the ambiguous ownership questions are answered.

## Immediate gaps confirmed by template analysis

These values are not currently modeled as first-class structured fields in the system:

- street split (`calle` vs full address)
- exterior number
- interior number
- postal code
- municipality / delegación
- state
- applicant email
- applicant fax
- request date
- request number
- supply tension level
- estimated operation date
- optional capacity increase
- generation usage mode
- technology selection for the CFE request
- generation unit count
- principal fuel
- secondary fuel
- UTM X / Y coordinates
- signatory name
- signatory role

## Blockers / open questions

- Does **Datos de contacto** use fixed EcoTienda contact data, or can it vary per trámite?
- Should the applicant block always mirror the client record, or are there legal/entity cases where it differs?
- Will CFE coordinates be stored as raw UTM, derived from lat/long, or entered per trámite?
- Which of the CFE-specific fields should live in a reusable document profile versus a per-request record?

## Non-goals

- No implementation yet
- No PDF/print work yet
- No `clients` schema expansion yet
- No UI capture yet
- No assumptions about CFE contact ownership or UTM conversion rules

## Success criteria

- [ ] The field inventory from the CFE image is documented in OpenSpec.
- [ ] The project explicitly recognizes the split between client data, EcoTienda contact data, and trámite-specific data.
- [ ] The current missing-field list is documented before implementation starts.
- [ ] The main ownership blocker for "Datos de contacto" is surfaced for later confirmation instead of guessed in code.
