# Workflow Dashboard Specification

## Purpose

Define the mobile-first operational dashboard for active `Trabajo` records and its Agenda-backed start action.

## Requirements

### Requirement: Active Work Is the Mobile Priority

The system MUST show the active `Trabajo` list before summary metrics when `/admin` first renders on a mobile viewport.

#### Scenario: Active work appears above metrics

- GIVEN a mobile operator has active work
- WHEN the operator opens `/admin`
- THEN the active work list appears before any summary metrics

#### Scenario: No active work is available

- GIVEN no active work exists
- WHEN the operator opens `/admin`
- THEN the dashboard shows an empty active-work state and retains access to quick creation

### Requirement: Active Work Uses a Compact Route View

Each active work item MUST show only its editable title, current stage, and the route `Agenda → Visita → Cotización → Venta → Descargables`. The route MUST identify the current stage without changing the established stage order or completion rules.

#### Scenario: Operator reviews an active item

- GIVEN an active `Trabajo` is at the Visita stage
- WHEN its dashboard item renders
- THEN it shows the title, Visita as current stage, and the complete route line

#### Scenario: Compact item excludes secondary data

- GIVEN an active work item renders
- WHEN the item content is evaluated
- THEN it does not show metrics, client details, or stage payload details

### Requirement: Dashboard Creation Starts Through Agenda

The dashboard MUST provide quick new-work creation. Creation MUST register the Agenda-backed start of the `Trabajo`; its title MUST be generated from Agenda intake defaults and MUST be editable before completion.

#### Scenario: Operator creates work from the dashboard

- GIVEN an operator starts quick creation on `/admin`
- WHEN valid Agenda intake data is completed
- THEN a `Trabajo` and its Agenda-backed start are registered

#### Scenario: Operator edits the generated title

- GIVEN Agenda defaults generated a work title
- WHEN the operator changes the title before completion
- THEN the created `Trabajo` uses the edited title and remains registered through Agenda
