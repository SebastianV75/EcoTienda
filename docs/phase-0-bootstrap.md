# Phase 0 bootstrap plan

This document defines the technical bootstrap for EcoTienda Phase 0.

## Goal

Create the shared foundation required to build the product safely, in order, and without rework.

## Quick path

1. Initialize the application and connect Supabase.
2. Build authentication and role protection.
3. Create the shared app shell and base schema.
4. Leave the project ready for Phase 1 (downloadable documents).

## Phase 0 scope

Included:

- project bootstrap
- coding base and folder structure
- Supabase connection
- authentication
- role model
- route protection
- shared layout
- mobile-first app shell
- base database schema
- initial admin skeleton

Excluded:

- document templates
- quotation builder
- technical visits workflow
- advanced reporting
- production hardening

## Deliverables

- running Next.js project
- Tailwind configured
- Supabase project connected
- working auth flow
- `admin` and `technician` role model
- protected routes by role
- base responsive layout
- initial dashboard shell
- foundational database tables
- developer setup instructions

## Recommended implementation order

## 1. Repository and app bootstrap

Tasks:

- create Next.js app with TypeScript
- configure Tailwind CSS
- configure linting/formatting basics
- define folder structure
- create `.env.example`

Expected result:

- the project runs locally for both developers

## 2. Supabase project setup

Tasks:

- create Supabase project
- define environment variables
- connect app to Supabase
- verify database and auth access
- define storage buckets strategy

Expected result:

- the app can talk to Supabase in development

## 3. Authentication

Tasks:

- implement sign-in flow
- define session handling
- add sign-out
- define protected route rules
- prepare password recovery path

Expected result:

- authenticated users can enter the app securely

## 4. Authorization and roles

Tasks:

- create user profile / role mapping
- define `admin` and `technician`
- implement server-side role checks
- restrict routes and actions by role

Expected result:

- users only see and access what their role allows

## 5. Shared app shell

Tasks:

- create responsive layout
- create top navigation / side navigation strategy
- define mobile navigation behavior
- create placeholder pages for main modules
- create shared UI primitives baseline

Expected result:

- the app feels like a coherent product shell on desktop and mobile

## 6. Base database schema

Tasks:

- define users/profile table
- define roles approach
- define audit metadata conventions
- define shared entities needed by later phases
- prepare migration strategy

Expected result:

- the schema supports future modules without guessing structure later

## 7. Dashboard skeleton

Tasks:

- create admin landing page
- create technician landing page
- add empty navigation entries for future modules
- add access guards and fallback screens

Expected result:

- each role lands in the correct base area of the product

## 8. Developer workflow setup

Tasks:

- define branch naming convention
- define local setup steps
- define review rules for small PRs
- define ownership boundaries between Sebas and Darian

Expected result:

- both developers can work without stepping on each other constantly

## Suggested folder baseline

```text
src/
  app/
  components/
  features/
  lib/
  services/
  types/
  styles/
```

Notes:

- `features/` should group business modules.
- `lib/` should hold shared low-level utilities.
- `services/` should hold integrations and server-side external access.
- Keep business code out of generic shared folders unless it is truly shared.

## Initial environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
GOOGLE_MAPS_API_KEY=
```

Notes:

- `GOOGLE_MAPS_API_KEY` will not be used in Phase 0 yet, but documenting it early avoids hidden future dependencies.
- Only server code should use privileged secrets.

## Initial role model

| Role | Access |
|------|--------|
| admin | full platform access |
| technician | assigned operational area only |

## Security baseline

- protect all authenticated routes
- validate role on server-side actions
- never trust client-only role checks
- store sensitive secrets only in server environment variables
- define basic audit fields on core records (`created_at`, `updated_at`, `created_by` when relevant)

## Exit criteria

Phase 0 is complete only if all of the following are true:

- app runs locally
- Supabase connection works
- login flow works
- roles work
- protected routes work
- mobile layout is usable
- both developers can set up the project from written instructions
- the project is ready to begin Phase 1 without revisiting auth/foundation decisions

## Risks to control early

| Risk | Why it matters |
|------|----------------|
| weak role boundaries | can break the entire internal security model |
| messy folder structure | creates friction in all later phases |
| auth coupled to UI only | false security, must be enforced on the server |
| unclear ownership | causes collisions between Sebas and Darian |
| overbuilding the base | delays real business value |

## Proposed Phase 0 task breakdown

| ID | Task | Owner |
|----|------|-------|
| P0-01 | Initialize Next.js app and base tooling | Sebas |
| P0-02 | Create Supabase project and env contract | Sebas |
| P0-03 | Implement auth flow | Sebas |
| P0-04 | Implement role model and route protection | Sebas |
| P0-05 | Build shared responsive shell | Sebas |
| P0-06 | Define base schema and migration strategy | Sebas + Darian |
| P0-07 | Document local setup | Sebas |
| P0-08 | Review handoff for module work split | Sebas + Darian |

## Definition of done

Phase 0 is done when the team can say:

- “We have a working private app foundation.”
- “Admin and technician access are already separated.”
- “The repository is ready for parallel feature work.”
- “Phase 1 can start without redesigning the base.”

## Next step

Create the concrete implementation checklist for `P0-01` to `P0-08` and start bootstrapping the real app in the repository.
