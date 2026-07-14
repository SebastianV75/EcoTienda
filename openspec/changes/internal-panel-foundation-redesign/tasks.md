# Internal Panel Foundation Redesign Tasks

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 120-260 |
| 400-line budget risk | Low-Medium |
| Chained PRs recommended | No |
| Suggested split | Single correction slice: `/admin` home operational dashboard cleanup, with shell/mobile touched only if copy or navigation separation requires it. |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: feature-branch-chain
400-line budget risk: Low-Medium

## Direction correction

The previous module-first home direction is superseded. The shell/sidebar/mobile bottom bar own navigation. The `/admin` home must not repeat navigation with module-description cards. The next apply work must correct the home into a minimal operational dashboard focused on pending/follow-up, upcoming work, and recent operational activity, using elegant empty states where real data/workflows do not exist.

## Implementation plan

### Slice 1 — `/admin` operational dashboard correction

- [x] 1. Re-audit `src/app/admin/page.tsx` for redundant navigation cards, repeated module descriptions, project-note copy, system-note copy, implementation-status copy, and generic explanatory blocks.
- [x] 2. Remove home content that duplicates sidebar or mobile bottom-bar navigation, including module-first card grids for existing routes.
- [x] 3. Rebuild the `/admin` home around three operational sections: pending/follow-up, upcoming work, and recent operational activity.
- [x] 4. For pending/follow-up, show real operational data only if already available without new business behavior; otherwise render an elegant empty state.
- [x] 5. For upcoming work, anticipate Agenda as the future center for appointments such as technical visits, installations, and other appointment types.
- [x] 6. Ensure upcoming work does not expose booking, calendar, appointment management, installation scheduling, technician assignment, fake routes, fake controls, or fake data.
- [x] 7. For recent activity, show only operational/customer activity grounded in existing behavior; otherwise render an elegant empty state or omit the section.
- [x] 8. Remove generic system activity and all product-facing meta/project/status explanatory language from `/admin`.
- [x] 9. Keep any contextual action links subordinate and section-specific; do not recreate a navigation grid.

### Slice 2 — shell and mobile navigation preservation

- [x] 10. Preserve the already-correct shell/navigation direction where sidebar and mobile bottom bar own navigation.
- [x] 11. Review `src/components/app-shell.tsx` only for remaining product-facing project/system/meta copy or header redundancy related to the home correction.
- [x] 12. Review `src/components/mobile-bottom-navigation.tsx` only if needed to preserve route clarity and separation from home content.
- [ ] 13. If visual support is necessary, make minimal presentation-only adjustments in `src/app/globals.css` and avoid broad theme churn.

## Verification

- [x] 14. Run `npm run lint` and record the result for this correction.
- [ ] 15. Manually verify `/admin` no longer repeats sidebar/mobile navigation as module-description cards.
- [ ] 16. Manually verify `/admin` prioritizes pending/follow-up, upcoming work, and recent operational activity.
- [ ] 17. Manually verify empty states are honest and polished when real pending/upcoming/activity data is unavailable.
- [ ] 18. Manually verify upcoming work anticipates Agenda appointment types without fake functionality or actionable booking/calendar controls.
- [ ] 19. Manually verify recent activity, if shown, is operational only and not generic system activity.
- [ ] 20. Manually verify shell and home copy contain no project-note, system-note, implementation-status, or meta explanatory wording.
- [ ] 21. Manually verify existing auth, routes, and business behavior remain unchanged.

## Notes for apply

- Keep scope bounded to `/admin` home plus shell/mobile copy or navigation-separation adjustments only if necessary.
- Do not modify `src/features/auth/session.ts`, `src/features/auth/roles.ts`, document internals, quotation internals, visit internals, or create Agenda workflow files.
- Do not add fake data, fake counters, fake appointments, fake activity, new database tables, notifications, or scheduling behavior.
- The correction should replace the already-implemented wrong home direction before further apply work proceeds.
