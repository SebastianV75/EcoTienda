# Delta for Navigation

## MODIFIED Requirements

### Requirement: Workflow Navigation Prioritizes Work In Progress

The system MUST prioritize workflow continuity in shared navigation for workflow-core screens. Navigation labels, ordering, and active states MUST help the admin move between active work, Agenda intake, and the current operational stage without reinforcing a modular mental model.

#### Scenario: Shared navigation reflects workflow priority

- GIVEN the admin is on a workflow-core screen
- WHEN shared navigation renders
- THEN workflow entry and in-progress work routes are easier to reach than secondary modules

#### Scenario: Active state matches the current workflow surface

- GIVEN the admin moves between `/admin`, `/agenda`, and `/admin/visits`
- WHEN navigation updates
- THEN the active state clearly matches the current workflow surface
- AND the navigation does not imply that these screens are unrelated modules
