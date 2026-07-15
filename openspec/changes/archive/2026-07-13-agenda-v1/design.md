# Design: EcoTienda Agenda v1

## Overview

Agenda v1 adds an internal operational planning surface backed by real persisted `agenda_items`. The first slice should stay small: a hand-rolled monthly calendar as the default view, a secondary pending list, item detail viewing, and admin-only editing. It must not introduce fake records, client-facing scheduling, recurrence, notifications, or a heavy calendar dependency.

The implementation should follow the existing Next.js App Router + Supabase pattern used by the clients module: server pages load data through `features/*/data.ts`, client forms submit server actions from `features/*/actions.ts`, and protected pages call `requireRole` before rendering.

## Route structure

Use a shared internal route instead of making Agenda admin-only by path:

- `src/app/agenda/page.tsx`
  - Default monthly calendar view.
  - Requires `requireRole(["admin", "technician"])` when Supabase env exists.
  - Reads `?month=YYYY-MM` for month navigation.
  - Reads `?view=pending` only for the secondary pending list state, or renders the pending list as a secondary panel below/next to the calendar.
- `src/app/agenda/[id]/page.tsx`
  - Item detail/read view.
  - Requires internal staff.
  - Shows edit action only when `user.role === "admin"`.
- `src/app/agenda/[id]/edit/page.tsx`
  - Edit form.
  - Requires `requireRole(["admin"])`.
  - Updates allowed fields only; no create/delete workflow in v1.

Visits route behavior for v1:

- Keep `src/app/admin/visits/page.tsx` as a compatibility/legacy operational entry point, but do not build a separate visits data model there.
- Change it to point staff to Agenda filtered/summarized for visit-type items, or render the same Agenda data filtered to `tipo = "visita_tecnica"` if that route must remain visible.
- The canonical planning UI is Agenda; Visits must not create or maintain duplicate scheduled records.

## Likely file/component layout

```text
src/app/agenda/page.tsx
src/app/agenda/[id]/page.tsx
src/app/agenda/[id]/edit/page.tsx

src/features/agenda/data.ts
src/features/agenda/actions.ts
src/features/agenda/agenda-calendar.tsx
src/features/agenda/agenda-month-controls.tsx
src/features/agenda/agenda-pending-list.tsx
src/features/agenda/agenda-item-card.tsx
src/features/agenda/agenda-item-detail.tsx
src/features/agenda/agenda-item-form.tsx
src/features/agenda/calendar-utils.ts

src/types/agenda.ts
docs/sql/create-agenda-items-table.sql
```

Keep calendar date math in `calendar-utils.ts` and UI rendering in `agenda-calendar.tsx`. This avoids a calendar package for v1 while making month-grid behavior easy to test.

## Data model shape

Create `public.agenda_items` in `docs/sql/create-agenda-items-table.sql`.

Recommended columns:

- `id uuid primary key default gen_random_uuid()`
- `fecha date not null`
- `titulo text not null`
- `tipo text not null check (tipo in ('cita', 'visita_tecnica', 'instalacion', 'recordatorio_interno'))`
- `estado text not null default 'pendiente' check (estado in ('pendiente', 'en_proceso', 'finalizado'))`
- `descripcion text`
- `client_id uuid null references public.clients(id) on delete set null`
- `visit_id uuid null` reserved for future one-to-one visit linkage; do not populate with fake records in v1
- `created_at timestamptz not null default timezone('utc', now())`
- `updated_at timestamptz not null default timezone('utc', now())`

Indexes:

- `(fecha)` for calendar range queries and pending ordering.
- `(estado, fecha)` for the pending list.
- `(tipo, fecha)` for visit/installation filters.
- `(client_id)` when client context is shown.

RLS:

- `admin` and `technician` can `select` agenda items.
- only `admin` can `update` agenda items.
- Do not add insert/delete policies unless implementation needs seeded operational records from an external/admin SQL process. V1 UI has no create/delete flow.

TypeScript types should expose UI-safe labels separately from database enum values, for example `visita_tecnica` in SQL and `Visita técnica` in UI. Avoid storing accented display labels as enum values.

## Data access contracts

`src/features/agenda/data.ts` should provide cached server functions:

- `getAgendaItemsForMonth(year: number, month: number)`
  - Query `fecha >= firstDay` and `fecha <= lastDay`.
  - Order by `fecha`, then `created_at` or `titulo` for deterministic display.
- `getPendingAgendaItems()`
  - Query `estado = 'pendiente'`.
  - Order by `fecha` ascending.
- `getAgendaItemById(id: string)`
  - Include minimal client fields if `client_id` exists.

`src/features/agenda/actions.ts` should provide:

- `updateAgendaItemAction(previousState, formData)`
  - Validates `id`, `fecha`, `titulo`, `tipo`, and `estado`.
  - Accepts optional `descripcion` and `client_id`.
  - Revalidates `/agenda`, `/agenda/[id]`, `/agenda/[id]/edit`, and `/admin/visits` if it remains linked.
  - Redirects to `/agenda/[id]` on success.

Server page access control is the primary UI guard, but RLS must be the final enforcement for admin-only editing.

## Visits linkage in v1

Because the current visits area is a placeholder, v1 should define Agenda as the source of truth for scheduled visit-like work. That means:

- A technical visit shown in Agenda is an `agenda_items` row with `tipo = 'visita_tecnica'`.
- An installation shown in Agenda is an `agenda_items` row with `tipo = 'instalacion'`.
- The existing Visits route should not write separate scheduled visit records.
- If a future dedicated `visits` table is added, it should link one-to-one from `agenda_items.visit_id` or from `visits.agenda_item_id` with a uniqueness constraint. At that point one record owns scheduling, and the other references it; both must not independently store competing schedule state.

For v1 detail screens, show visit context from the agenda item itself plus optional client summary. Do not invent a visit detail record when no linked visit exists.

## Navigation integration

Update navigation through the existing shell/mobile patterns:

- Add Agenda to desktop navigation in `src/components/app-shell.tsx`.
- Add Agenda to mobile navigation in `src/components/mobile-bottom-navigation.tsx`.
- Prefer making Agenda a primary mobile item if replacing the placeholder Quotes/Visits priority is acceptable; otherwise put it in the secondary “More” sheet.
- Ensure active route checks include `/agenda` and nested detail/edit routes.
- Keep labels operational and user-facing only; no project notes, system notes, TODO placeholders, or fake counters.

Since Agenda is shared by admin and technician roles, `AppShell` should either receive role-aware navigation or include only links valid for the current role. Do not show admin-only destinations to technician users if those routes redirect to unauthorized.

## Editing flow

- Staff can open calendar items and pending-list items into the detail page.
- Admin users see an edit action on detail.
- Non-admin staff see read-only detail and no edit action.
- The edit page is protected by `requireRole(["admin"])` and RLS update policies.
- Form fields for v1:
  - required: `fecha`, `titulo`, `tipo`, `estado`
  - optional: `descripcion`, `client_id`
- No create button, delete button, fake seed controls, or “coming soon/project note” cards in Agenda UI.

## Calendar design

Use a hand-rolled month grid:

- Build a 6-row grid from the first visible week day through trailing days.
- Mark days outside the selected month visually but keep them inert or low-emphasis.
- Group fetched agenda items by ISO date (`YYYY-MM-DD`).
- Render compact item chips/cards inside each day.
- Month navigation updates `?month=YYYY-MM`.
- Today and selected/current month states are presentation-only; no client-only data source required.

This is enough for v1 and avoids dependency weight. A calendar dependency is only justified later if requirements add drag/drop, recurrence, complex localization, resource scheduling, or timezone-heavy behavior.

## Validation and testing approach

Strict TDD is active for implementation. Start with focused tests before UI wiring where the project test harness supports it.

Recommended validation points:

- Unit-test `calendar-utils.ts` for month boundaries, leading/trailing days, leap years, and grouping by date.
- Test agenda input validation for required `fecha`, `titulo`, `tipo`, and valid `estado`.
- Verify data query filters:
  - month view only fetches selected date range,
  - pending list only fetches `pendiente`,
  - ordering is deterministic by scheduled date.
- Verify access rules manually or with integration coverage where available:
  - admin can access edit route,
  - technician can view but cannot edit,
  - unauthenticated users redirect to sign-in.
- Run `npm run lint` and the configured test command when implementation adds tests.

## Key risks

- **Role/navigation mismatch:** current `/admin/*` patterns are admin-only, but Agenda view must support non-admin staff. Use a shared `/agenda` route and role-aware navigation.
- **Visits duplication:** building a separate visits store in parallel would violate the spec. Keep visit-like work represented through Agenda in v1.
- **RLS drift:** UI guards are not enough. Supabase policies must enforce staff read and admin update.
- **Date bugs:** month-grid boundaries and date serialization can regress easily. Keep date utilities pure and tested.
- **Scope creep:** create/delete, recurrence, notifications, client booking, and fake/demo data are explicitly out of v1.
