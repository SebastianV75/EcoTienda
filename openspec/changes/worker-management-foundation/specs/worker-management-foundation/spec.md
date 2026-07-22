# Worker Management Foundation Specification

## Purpose

Define the first workflow-backed worker-management slice that replaces free-text assignment with real internal worker selection, while keeping legacy client-backed areas operating during the transition.

## Requirements

### Requirement: Internal Workers Can Be Managed

The system MUST support internal worker records that admins can create, view, and update for company staff.

#### Scenario: Admin creates a worker record

- GIVEN an admin needs to register a company worker
- WHEN the admin submits valid worker information
- THEN the system stores a worker record
- AND the worker can represent an internal role such as admin, technician, or another staff type

#### Scenario: Admin updates a worker record

- GIVEN an existing worker record exists
- WHEN the admin edits its information
- THEN the worker record is updated
- AND existing workflow assignments can continue referencing that worker

### Requirement: Worker Login Linking Is Optional

A worker record MUST be allowed to exist without an auth-linked login in this slice.

#### Scenario: Admin creates a worker without auth

- GIVEN a worker has not yet been invited or linked to login
- WHEN the admin saves the worker record
- THEN the record is still valid and usable for assignment

#### Scenario: Admin links auth later

- GIVEN a worker record already exists without login linkage
- WHEN an auth-linked identity is added later
- THEN the worker remains the same operational worker record

### Requirement: Agenda Uses Real Worker Assignment

Agenda-backed workflow start MUST assign work to a real worker selection instead of a free-text assignee name.

#### Scenario: Admin assigns a worker during work creation

- GIVEN an admin is creating a workflow-backed Agenda item
- WHEN the assignment field is completed
- THEN the admin selects an existing worker record
- AND the workflow start stores that worker as the assignment

#### Scenario: Admin edits the assigned worker

- GIVEN a workflow-backed Agenda item already has a worker assignment
- WHEN the admin changes the assignment
- THEN the updated worker becomes the current assignment for that workflow start

### Requirement: Assignment Lives in the Agenda Stage

For this slice, the operational source of truth for worker assignment MUST live in the Agenda-stage start of the workflow.

#### Scenario: Workflow reads assignment from Agenda stage

- GIVEN a workflow-backed `Trabajo` has started from Agenda
- WHEN downstream workflow context needs the assigned technician/worker
- THEN the assignment is resolved from the Agenda-stage worker assignment

#### Scenario: Free-text assignment is no longer required for new workflow records

- GIVEN a new or edited workflow-backed Agenda record is validated
- WHEN assignment requirements are checked
- THEN real worker selection satisfies assignment requirements
- AND plain free-text assignment is not the required path for that record

### Requirement: Worker Assignment Prepares Technician Ownership

Stored worker assignment MUST be ready to support a later technician-facing “assigned jobs” view.

#### Scenario: Assigned work is attributable to one worker

- GIVEN a workflow-backed assignment exists
- WHEN the system evaluates which worker owns the job
- THEN the assignment resolves to one internal worker record

#### Scenario: Auth-linked technician can later resolve assigned work

- GIVEN a worker record is linked to an auth user
- WHEN a future technician view requests assigned work
- THEN the stored assignment can be used to find jobs for that worker

### Requirement: Legacy Client-Backed Areas Stay Usable

Client-backed document and legacy areas MUST remain usable during this slice.

#### Scenario: Legacy client-backed documents still work

- GIVEN existing document or legacy flows still depend on `clients`
- WHEN this worker-management slice is introduced
- THEN those flows continue operating without requiring worker migration first

#### Scenario: Worker assignment does not force full client removal

- GIVEN the new worker assignment model is active in Agenda/Trabajo
- WHEN older client-coupled areas are reviewed
- THEN they are allowed to remain unchanged in this slice

### Requirement: Legacy Text Assignments Stay Understandable

Existing records that only have legacy free-text assignment MUST remain understandable during the transition.

#### Scenario: Admin opens a legacy text-assigned record

- GIVEN a pre-existing workflow or agenda record uses only text assignment
- WHEN the admin reviews it
- THEN the assigned person remains readable
- AND the record does not become unusable only because it lacks a worker link
