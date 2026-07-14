# Admin Home Specification

## Purpose

The admin Home screen (`/admin`) is the primary landing page for EcoTienda operators. It MUST surface module navigation and a lightweight activity pulse above the fold on mobile, while preserving the current desktop experience.

## Requirements

### Requirement: Compact Module Grid on Mobile

The system MUST render the four quick module cards (Clientes, Descargables, Cotizaciones, Visitas técnicas) in a 2×2 grid layout on mobile viewports (below 768px). Each card MUST remain a tappable navigation element linking to its respective module route.

#### Scenario: Mobile operator sees all four modules without scrolling past activity content

- GIVEN a mobile viewport width of 375px
- WHEN the operator navigates to `/admin`
- THEN all four module cards (Clientes, Descargables, Cotizaciones, Visitas técnicas) are visible within the first viewport area alongside the activity summary, without requiring scroll past the activity summary section

#### Scenario: Module cards maintain adequate tap targets on mobile

- GIVEN a mobile viewport
- WHEN the module grid renders
- THEN each card's interactive area MUST be at least 44px in minimum dimension

#### Scenario: Module card descriptions are reduced on mobile

- GIVEN a mobile viewport
- WHEN the module cards render
- THEN card descriptions MUST be shortened or omitted to reduce vertical height while preserving the module title and navigation CTA

### Requirement: Activity Summary with Client Data Only

The system MUST display an activity summary section that shows operational counts derived exclusively from currently available Client data. The activity summary MUST include at minimum: total client count and recently created clients count.

#### Scenario: Activity summary renders real Client counts

- GIVEN the admin user is authenticated and Supabase is available
- WHEN the Home page loads
- THEN the activity summary displays the total number of clients and the count of recently created clients (fetched from the existing clients table)

#### Scenario: Quotations and Technical Visits do NOT appear in activity summary

- GIVEN the Home page renders the activity summary
- WHEN the activity summary content is evaluated
- THEN no counts, rows, cards, or placeholders for Quotations or Technical Visits are present in the activity summary section

#### Scenario: Activity summary handles zero clients gracefully

- GIVEN the clients table is empty
- WHEN the Home page loads
- THEN the activity summary renders with zero values (e.g., "0") without errors, placeholder text, or broken layout

### Requirement: Quick Module Card Set

The Home page MUST display exactly four module cards with the following modules: Clientes, Descargables, Cotizaciones, and Visitas técnicas. Each card MUST link to its corresponding admin route.

#### Scenario: All four module cards are present and correctly linked

- GIVEN the admin user is on the Home page
- WHEN the page renders
- THEN exactly four module cards are displayed with titles "Clientes", "Descargables", "Cotizaciones", and "Visitas técnicas", linking to `/admin/clients`, `/admin/documents`, `/admin/quotations`, and `/admin/visits` respectively

### Requirement: Hero Banner Reduction on Mobile

The system MUST collapse or remove the hero banner on mobile viewports. The hero banner MAY remain visible on desktop viewports (≥1024px).

#### Scenario: Hero banner is not present on mobile

- GIVEN a mobile viewport width below 768px
- WHEN the Home page renders
- THEN the large gradient hero banner with marketing copy is not displayed

#### Scenario: Hero banner is preserved on desktop

- GIVEN a desktop viewport width of 1024px or greater
- WHEN the Home page renders
- THEN the hero banner or a minimal greeting is visible

### Requirement: Support Card Removal on Mobile

The system MUST remove or hide the "Configuración" and "Operación centralizada" support cards on mobile viewports. These cards MAY remain on desktop viewports.

#### Scenario: Support cards are hidden on mobile

- GIVEN a mobile viewport width below 768px
- WHEN the Home page renders
- THEN the "Configuración" and "Operación centralizada" support cards are not displayed

#### Scenario: Support cards remain on desktop

- GIVEN a desktop viewport width of 1024px or greater
- WHEN the Home page renders
- THEN the support cards remain visible in the layout

### Requirement: Content Hierarchy Order

The system MUST render content in the following vertical order on mobile: (1) activity summary or minimal greeting, (2) module grid, (3) any remaining informational content. Module access and activity summary MUST appear above any decorative or informational content.

#### Scenario: Mobile content hierarchy places actionable content first

- GIVEN a mobile viewport
- WHEN the Home page renders
- THEN the activity summary and module grid appear before any remaining decorative or informational sections

### Requirement: Desktop Layout Preservation

The system MUST preserve the current desktop layout (≥1024px) without visual regression. The desktop experience MUST remain functionally and visually consistent with the pre-change design.

#### Scenario: Desktop layout is unchanged

- GIVEN a desktop viewport width of 1024px or greater
- WHEN the Home page renders
- THEN the hero banner, support cards, and module cards are displayed in a layout consistent with the current design

### Requirement: No New Client-Side JS Bundles

The system MUST NOT introduce additional client-side JavaScript bundles. All data fetching for the activity summary MUST use server components or server-side queries.

#### Scenario: Activity summary data is fetched server-side

- GIVEN the Home page loads
- WHEN the activity summary data is retrieved
- THEN the data is fetched via server-side queries (no new client-side JS bundles for this data)

### Requirement: Existing Design Token Usage

The system MUST use existing CSS variables, border radii, and color tokens for any new or modified components. No new design primitives or custom design tokens may be introduced.

#### Scenario: New components use existing design tokens

- GIVEN new presentational components are created for the compact grid or activity summary
- WHEN they render
- THEN they use only existing `var(--brand-*)`, `var(--surface-*)`, `var(--border-*)`, and `var(--muted)` tokens and existing border-radius values
