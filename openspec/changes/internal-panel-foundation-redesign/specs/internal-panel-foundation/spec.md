# Internal Panel Foundation Specification

## Purpose

Define the required post-authentication shell and `/admin` home behavior so the shell owns navigation and the home becomes a minimal operational dashboard without changing existing business flows.

## Requirements

### Requirement: Authenticated foundation scope

The system MUST limit this change to the authenticated base shell and the internal home entry surface.

#### Scenario: User reaches the redesigned area after sign-in

- GIVEN an authenticated user has completed sign-in
- WHEN the user enters the internal panel
- THEN the redesigned experience SHALL begin at the authenticated shell and `/admin` home
- AND the change SHALL NOT require a landing-page or sign-in redesign

### Requirement: Shell-owned navigation

The authenticated shell, sidebar, and mobile bottom bar MUST own primary navigation for the internal panel.

#### Scenario: User needs to move between modules

- GIVEN an authenticated operational user is in the internal panel
- WHEN the user needs to navigate to available modules
- THEN the sidebar or mobile bottom bar MUST provide the primary navigation path
- AND the home MUST NOT repeat the same navigation hierarchy as module-description cards
- AND existing navigation destinations and access behavior MUST remain unchanged

### Requirement: Minimal operational dashboard home

The `/admin` home MUST function as a simple operational dashboard, not a module-first navigation surface.

#### Scenario: User opens the internal home

- GIVEN an authenticated user opens `/admin`
- WHEN the home content is displayed
- THEN the home MUST prioritize operational information over module promotion
- AND the home MUST focus on pending/follow-up work, upcoming work, and recent operational activity
- AND the home MUST NOT present a redundant grid of navigation/module-description cards

### Requirement: Pending and follow-up section

The home MUST include a pending/follow-up area that communicates work needing attention or an honest empty state.

#### Scenario: No pending source is implemented for the home

- GIVEN there is no implemented source of pending/follow-up data for this slice
- WHEN the pending/follow-up area is rendered
- THEN the UI MUST show an elegant operational empty state
- AND the UI MUST NOT invent pending counts, fake items, or simulated workflows

### Requirement: Upcoming work anticipates Agenda

The home MUST include an upcoming-work area shaped around future Agenda needs for appointments.

#### Scenario: Agenda workflow is not implemented yet

- GIVEN Agenda scheduling is not implemented in this change
- WHEN the upcoming-work area is rendered
- THEN the UI MUST frame upcoming work around appointments such as technical visits, installations, and other appointment types
- AND the UI MUST use an empty or unavailable state when no real source exists
- AND the UI MUST NOT imply that booking, calendar, appointment management, installation scheduling, or technician assignment is functional

### Requirement: Recent operational activity only

The home MAY show recent activity only when it is operationally meaningful and grounded in existing data.

#### Scenario: Recent activity is displayed

- GIVEN the home shows recent activity
- WHEN a user reads the activity section
- THEN the activity MUST relate to real operational/customer work
- AND it MUST NOT include generic system activity, implementation notes, project status, or meta activity

#### Scenario: No suitable operational activity exists

- GIVEN there is no suitable implemented source of recent operational activity
- WHEN the recent activity area is rendered
- THEN the UI MUST show an elegant empty state or omit the section
- AND the UI MUST NOT show fake activity

### Requirement: Product-facing copy discipline

Product-facing UI in the authenticated shell and home MUST avoid project-note, system-note, implementation-status, and meta explanatory copy.

#### Scenario: User reads shell and home text

- GIVEN an authenticated user is reading titles, descriptions, labels, helper text, or empty states
- WHEN product-facing copy is displayed
- THEN the copy MUST stay focused on operational use and user-facing meaning
- AND the copy MUST NOT include project-note, system-note, implementation-status, or meta-commentary language

### Requirement: Existing business behavior preserved

The system MUST preserve existing business flows, routes, permissions, and operational behavior for the affected surfaces.

#### Scenario: User accesses existing modules through the redesigned foundation

- GIVEN an authenticated user uses existing internal panel routes
- WHEN the user navigates through the redesigned shell or contextual home actions
- THEN the underlying business flows MUST behave as they did before this change
- AND no new business rule, permission, data model, or workflow SHALL be introduced by this redesign slice
