# Apply Progress: internal-panel-foundation-redesign

## Status

The corrected home direction is now implemented. The authenticated shell keeps navigation ownership, and `/admin` now behaves as a minimal operational dashboard instead of a repeated module-navigation surface.

## Completed tasks

- [x] 1. Re-audit `src/app/admin/page.tsx` for redundant navigation cards, repeated module descriptions, and meta/project/system copy.
- [x] 2. Remove home content that duplicated sidebar or mobile bottom-bar navigation.
- [x] 3. Rebuild `/admin` around pending/follow-up, upcoming work, and recent operational activity.
- [x] 4. Render an honest empty state for pending/follow-up because no implemented pending source is available for this slice.
- [x] 5. Anticipate Agenda through an appointment-oriented upcoming-work section.
- [x] 6. Keep upcoming work non-actionable and free of fake booking/calendar functionality.
- [x] 7. Show recent operational/customer activity only when grounded in existing data.
- [x] 8. Remove generic system activity and product-facing meta/project/status wording from `/admin`.
- [x] 9. Keep contextual links subordinate and section-specific.
- [x] 10. Preserve shell/sidebar/mobile navigation as the primary navigation model.
- [x] 11. Remove remaining header redundancy from `src/components/app-shell.tsx`.
- [x] 12. Review mobile navigation and keep it route-preserving with no duplication on the home.
- [x] 14. Run `npm run lint`.

## Work Unit Evidence

| Evidence | Result |
|----------|--------|
| Focused file scope | `src/app/admin/page.tsx`, `src/components/app-shell.tsx` |
| Focused validation command | `npm run lint` — pass |
| Navigation ownership | Sidebar and mobile bottom bar remain the primary navigation surfaces |
| Home correction | Removed repeated module cards and explanatory boxes from `/admin` |
| Empty-state honesty | Pending/follow-up and upcoming work use non-fake empty states |
| Real activity basis | Recent activity uses existing client activity summary only when available |

## Files changed

| File | Change |
|------|--------|
| `src/app/admin/page.tsx` | Rebuilt the home into a minimal operational dashboard with pending/follow-up, upcoming work, and recent operational activity. Removed the repeated module-navigation grid and explanatory boxes. |
| `src/components/app-shell.tsx` | Removed the redundant desktop header info card and kept the shell focused on navigation/orientation. |
| `openspec/changes/internal-panel-foundation-redesign/tasks.md` | Updated the corrected implementation tasks and recorded progress. |
| `openspec/changes/internal-panel-foundation-redesign/apply-progress.md` | Replaced the outdated module-first progress record with the corrected operational-dashboard record. |

## Behavior verification

- `/admin` no longer repeats sidebar or mobile navigation as module-description cards.
- The shell still owns navigation to Panel, Clientes, Descargables, Cotizaciones, Visitas técnicas, and Configuración.
- Pending/follow-up is currently an elegant empty state rather than fake operational data.
- Upcoming work anticipates Agenda around appointments, visits, and installations without exposing fake calendar or booking controls.
- Recent operational activity remains grounded in existing client activity data only; if there is no recent movement, the section stays honest.
- No auth/session, permissions, route definitions, or business workflow logic were changed.

## Remaining tasks

- [ ] 13. Make minimal presentation-only adjustments in `src/app/globals.css` only if later verification proves they are needed.
- [ ] 15. Manually verify `/admin` no longer repeats sidebar/mobile navigation as module-description cards.
- [ ] 16. Manually verify `/admin` prioritizes pending/follow-up, upcoming work, and recent operational activity.
- [ ] 17. Manually verify empty states are honest and polished when real pending/upcoming/activity data is unavailable.
- [ ] 18. Manually verify upcoming work anticipates Agenda appointment types without fake functionality or actionable booking/calendar controls.
- [ ] 19. Manually verify recent activity, if shown, is operational only and not generic system activity.
- [ ] 20. Manually verify shell and home copy contain no project-note, system-note, implementation-status, or meta explanatory wording.
- [ ] 21. Manually verify existing auth, routes, and business behavior remain unchanged.

## Notes for next step

- The next honest step is manual verification, not more UI invention.
- Only touch `src/app/globals.css` later if verification reveals a real visual-support gap.
- Do not widen scope into Agenda workflow, module internals, auth behavior, or fake dashboard data.
