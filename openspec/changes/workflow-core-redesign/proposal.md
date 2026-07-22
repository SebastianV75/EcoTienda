# Proposal: Workflow Core Redesign

## Summary

Redesign the workflow core so EcoTienda reads as an admin-first operational tool instead of a modular internal portal. The new UI must center active `Trabajo` records, next-step clarity, and unblock actions across Admin Home, Agenda, Visits, and shared navigation.

## Problem

The product model already moved to a workflow-first structure:

- `Agenda -> Visita -> Cotizacion -> Venta -> Descargables`
- `Trabajo` is now the operational unit
- Admin is the primary user
- Technicians mostly enter or answer forms

The current UI still feels fragmented:

- too many boxes and decorative sections
- modules feel isolated instead of connected
- the next action in the workflow is not obvious
- `/admin` still behaves too much like a generic home screen

## Goals

1. Make `/admin` the operational board for active work and unblock actions.
2. Make Agenda feel like the entry point to a `Trabajo`, not a separate module.
3. Make Visits read as the next operational step in the same workflow.
4. Reduce visual noise and modular fragmentation across workflow-core screens.
5. Align navigation and hierarchy with the admin-first workflow.

## Non-Goals

1. Redesign the technician area beyond workflow forms they already use.
2. Rework business rules for stage progression.
3. Rebuild quotation or document generation logic outside workflow-facing surfaces.
4. Introduce a marketing-style visual identity pass.

## Scope

In scope:

- `/admin`
- `/agenda`
- `/agenda/new`
- `/agenda/[id]`
- `/agenda/[id]/edit`
- `/admin/visits`
- `/admin/visits/[trabajoId]`
- shared shell/navigation used by these screens

## Product Direction

- Primary user: admin
- Primary admin need: see active work and unblock what is next
- Design direction: operational, sober, low-noise
- UX constraint: if a screen is part of workflow core, it may be reshaped to serve the workflow

## Risks

1. A cosmetic-only pass would preserve the current fragmented mental model.
2. A large one-shot redesign would exceed safe review size.
3. Over-carding or decorative structure would conflict with the anti-slop direction.

## Delivery Strategy

Implement in small workflow slices, starting with Admin Home and shared navigation, then Agenda surfaces, then Visits continuity.
