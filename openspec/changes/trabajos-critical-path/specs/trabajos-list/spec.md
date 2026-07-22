# Delta for Trabajos List

## ADDED Requirements

### Requirement: Trabajos List Page

The system MUST provide a `/admin/trabajos` route rendering every trabajo as a card in a responsive grid (desktop) that stacks vertically on mobile. Cards MUST be ordered by creation date, newest first. Each card MUST display client name, current stage, status, a brief description, and creation date.

#### Scenario: Admin opens the list and sees all trabajos

- GIVEN one or more trabajos exist in the database
- WHEN the admin navigates to `/admin/trabajos`
- THEN every trabajo is rendered as a card
- AND cards are ordered newest-first by creation date

#### Scenario: Empty state when no trabajos match

- GIVEN no trabajos match the active filters
- WHEN the list renders
- THEN an empty state message is shown with guidance to clear filters

### Requirement: Trabajo Card Navigation

Each card MUST be clickable and navigate to `/admin/trabajos/[id]`.

#### Scenario: Admin clicks a card

- GIVEN the list is visible
- WHEN the admin clicks a card
- THEN the application navigates to `/admin/trabajos/[id]` for that trabajo

### Requirement: List Filters

The list MUST offer filters by stage (agenda, visita, cotizacion, venta, descargables), by status (open, won, lost, archived), and by date range (creation date). Filters MUST combine (AND semantics).

#### Scenario: Admin filters by stage

- GIVEN trabajos in multiple stages exist
- WHEN the admin selects the `visita` stage filter
- THEN only trabajos whose `current_stage` equals `visita` are shown

#### Scenario: Admin combines filters

- GIVEN trabajos in mixed stages and statuses exist
- WHEN the admin selects stage `venta` and status `won`
- THEN only trabajos matching both criteria are shown

### Requirement: List Search

The list MUST provide a search input matching trabajo number, client name, or address (case-insensitive substring match).

#### Scenario: Admin searches by client name

- GIVEN a trabajo whose client name contains "García"
- WHEN the admin types "García" into the search input
- THEN only trabajos matching that term are shown