# EcoTienda development plan

This document defines the initial technical base, delivery phases, ownership, and implementation priorities for the EcoTienda internal web platform.

## Quick path

1. Use the official stack defined in this document.
2. Build the project in phases, starting with the shared foundation.
3. Deliver modules in this order: downloadable documents, quotations, technical visits.

## Project goal

Build a private internal web platform for EcoTienda that works well on mobile devices for field workers and provides a full administration area for internal operations.

## Product priorities

1. Downloadable documents
2. Quotations
3. Technical visits

## Team ownership

| Area | Owner | Notes |
| ------ | ------- | ------- |
| Downloadable documents | Sebas | Highest priority |
| Quotations | Darian | Second priority |
| Technical visits | Shared later | Third priority, depends on foundation |

## User roles

| Role | Scope |
|------|-------|
| Admin | Full access to users, roles, products, quotations, documents, visits, settings |
| Technician | Mobile-first access to assigned visits, forms, geolocation, and generated reports |

## Official stack

| Layer | Decision |
| ------- | ---------- |
| App framework | Next.js |
| Language | TypeScript |
| UI | Tailwind CSS |
| Database | PostgreSQL |
| Backend platform | Supabase |
| Authentication | Supabase Auth |
| File storage | Supabase Storage |
| ORM / DB access | Prisma or direct Supabase access (to be decided during setup) |
| Maps / geolocation | Google Maps API |
| PDF generation | Server-side PDF generation from HTML templates |
| Hosting | To be defined after the first working milestone |

## Why this stack

- One web application for desktop and mobile use.
- Lower delivery risk for a two-person team.
- Faster implementation of auth, storage, and database.
- Good fit for role-based internal workflows.
- Easy first delivery without premature DevOps complexity.

## Authentication and access model

### Authentication

The system will use Supabase Auth for:

- sign in
- session management
- password recovery
- protected routes

### Authorization

Authorization will be handled in the application layer with role checks.

Initial roles:

- `admin`
- `technician`

Rules:

- Admin can access all modules.
- Technician can only access assigned operational views and actions.
- Every sensitive route and server action must validate the current role.

## Core modules

## 1. Shared foundation

Includes the base needed by every module:

- project setup
- auth
- role model
- layout and navigation
- mobile-first responsive shell
- shared UI primitives
- database schema base
- audit-friendly data structure

## 2. Downloadable documents

Priority 1.

Scope:

- 5 to 10 internal document templates
- autofill from stored business data
- PDF generation
- document history
- document download from admin flows

Expected users:

- admin

## 3. Quotations

Priority 2.

Scope:

- product catalog
- product search and filters
- quotation builder
- automatic calculations
- quotation PDF export
- quotation status tracking

Expected users:

- admin

## 4. Technical visits

Priority 3.

Scope:

- visit calendar
- worker assignment
- mobile visit forms
- realtime geolocation capture
- technical report PDF generation

Expected users:

- admin
- technician

## Delivery phases

## Phase 0 — Foundation

Objective: create the base that all modules depend on.

Deliverables:

- Next.js project initialized
- Tailwind configured
- Supabase project connected
- auth working
- role-based route protection
- base database schema
- responsive app shell
- initial admin dashboard skeleton

Exit criteria:

- admin can log in
- protected routes work
- mobile layout is usable
- development environment is stable for both developers

## Phase 1 — Downloadable documents

Objective: deliver the first business-useful module.

Deliverables:

- internal document data model
- template selection
- autofill workflow
- PDF generation for each template
- download history or saved records

Exit criteria:

- admin can generate and download at least one real internal document flow end to end

## Phase 2 — Quotations

Objective: deliver the sales/quotation workflow.

Deliverables:

- product catalog management
- product search/filtering
- quotation builder
- totals and calculation rules
- quotation PDF export

Exit criteria:

- admin can create a quotation from products and export a professional PDF

## Phase 3 — Technical visits

Objective: deliver the operational mobile workflow for field workers.

Deliverables:

- visit scheduling
- worker assignment
- technician mobile view
- visit form completion
- geolocation capture
- generated PDF report

Exit criteria:

- technician can complete an assigned visit on mobile and admin can review the result

## Phase 4 — Hardening and delivery

Objective: prepare the system for production use.

Deliverables:

- permission review
- data validation pass
- backup strategy
- admin settings review
- technical documentation
- usage guide for the client team

Exit criteria:

- critical flows are stable
- permissions are consistent
- the team has basic operational documentation

## Proposed first milestones

| Milestone | Goal |
| ----------- | ------ |
| M1 | Repo + app bootstrap + Supabase connection |
| M2 | Auth + roles + protected app shell |
| M3 | First downloadable document end to end |
| M4 | Quotations foundation |
| M5 | Technical visits foundation |

## Working rules

- Keep one private repository.
- Work by small reviewable increments.
- Finish shared foundation before parallelizing complex module work.
- Do not start technical visits before auth, roles, PDF flow, and shared data patterns are stable.
- Protect review scope to avoid oversized changes.

## Workflow compatibility notes

The current workflow is centered on `Trabajo` while preserving a temporary compatibility bridge for legacy data.

- Agenda still bridges into `agenda_items` where needed.
- `client_id` can remain optional for late compatibility on legacy records.
- Document previews should prefer `trabajoId` templates and fall back to older client-based entry points only when required.

## Open decisions

These items still need explicit definition before implementation starts:

1. Final hosting target
2. Whether DB access will use Prisma, Supabase client, or a hybrid approach
3. Exact list of downloadable document templates
4. Exact quotation calculation rules
5. Whether technical visits need offline support for weak connectivity

## Next step

Create the project bootstrap plan for Phase 0: repository structure, initial dependencies, Supabase setup, and first implementation tasks.
