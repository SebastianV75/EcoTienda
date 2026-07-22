# Delta for Admin Home

## MODIFIED Requirements

### Requirement: Admin Home Is an Operational Board

The system MUST make `/admin` the primary operational board for the admin. The first screenful MUST prioritize active `Trabajo` records and the actions needed to unblock their next stage, ahead of secondary module browsing or generic overview content.

#### Scenario: Admin lands on active work first

- GIVEN an authenticated admin opens `/admin`
- WHEN the page renders
- THEN active `Trabajo` items appear before secondary summaries and navigation modules

#### Scenario: Empty active work still supports action

- GIVEN no active `Trabajo` records exist
- WHEN the admin opens `/admin`
- THEN the page shows a clear empty state
- AND it preserves a primary action to create or start work

### Requirement: Admin Home Reduces Modular Noise

The system MUST reduce visual fragmentation on `/admin`. Secondary summaries, module links, and informational content MUST be subordinate to active workflow content and MUST not compete with the primary worklist.

#### Scenario: Secondary content stays secondary

- GIVEN `/admin` renders active work, summaries, and workflow entry links
- WHEN the admin scans the page from top to bottom
- THEN active work is visually dominant
- AND summaries and module links read as supporting context instead of equal-weight sections

#### Scenario: Next-step actions are explicit

- GIVEN an active `Trabajo` is shown on `/admin`
- WHEN the admin reviews the item
- THEN the screen makes the current stage understandable
- AND preserves or links the most relevant next operational action for that work
