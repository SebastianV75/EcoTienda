# Delta for Visits

## MODIFIED Requirements

### Requirement: Visits Continue the Same Work Flow

The system MUST present Visits as the next operational step after Agenda for a `Trabajo`. Visit pages MUST read as workflow continuation, not as a detached module.

#### Scenario: Admin opens the visits worklist

- GIVEN workflow-backed `Trabajo` records are awaiting or progressing through visit capture
- WHEN the admin opens `/admin/visits`
- THEN the screen groups or orders visit work around operational progress
- AND it remains visually consistent with the workflow-first hierarchy used on `/admin`

#### Scenario: Admin opens a visit record

- GIVEN an admin opens `/admin/visits/[trabajoId]`
- WHEN the page renders
- THEN the visit capture form is framed as the current workflow stage for that work
- AND the page clarifies what stage comes after a completed visit

### Requirement: Visit Surfaces Minimize Noise Around Data Entry

Visit capture screens MUST reduce ornamental structure and focus on the fields, status, and completion conditions needed to move the work forward.

#### Scenario: Visit form emphasizes completion

- GIVEN the visit form includes stage-specific fields and blocking rules
- WHEN the admin fills the page
- THEN supporting copy and layout help the admin understand what is required to continue
- AND non-essential visual containers do not compete with the form itself
