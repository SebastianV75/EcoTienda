# Apply Progress: prelogin-auth-redesign

## Status

Landing and sign-in now share the same premium pre-login system: the landing remains warmer and more monumental, and `/auth/sign-in` now uses the shared framing with a clearer form-first desktop layout.

## Completed tasks

The landing tasks already marked complete in `tasks.md` remain valid for this batch, and the landing stayed within the allowed slice without shared global tokens or auth changes:

- [x] 1.1 Shared pre-login shell exists and is presentation-only.
- [x] 1.2 No shared global token was needed; styling stayed local.
- [x] 2.1 `/` now uses a fuller editorial composition, keeps one primary `/auth/sign-in` CTA, and demotes `/admin`.
- [x] 2.2 Landing proof/support content is sober, warmer, premium, and mobile-first.
- [x] 3.1 `/auth/sign-in` now reuses the shared pre-login framing while preserving `hasSupabaseEnv`, `getCurrentUser`, and redirect behavior unchanged.
- [x] 3.2 `SignInForm` now has stronger hierarchy, spacing, button emphasis, and visible error placement without changing fields or action semantics.

## Work Unit Evidence

| Evidence | Result |
|----------|--------|
| Focused test command | `npm run lint` — pass |
| Focused test command | `npm run build` — pass |
| Runtime harness | `npx ui-skills start` — returned UI Skills root guidance; no browser session was opened in this batch |
| Rollback boundary | `src/app/page.tsx` |
| Rollback boundary | `src/app/auth/sign-in/page.tsx`, `src/features/auth/sign-in-form.tsx`, `src/features/auth/components/prelogin-shell.tsx` |

## Files changed

| File | Change |
|------|--------|
| `src/app/page.tsx` | Reworked the landing into a warmer, fuller editorial composition with larger visual mass, a more monumental support panel, and one dominant sign-in CTA. |
| `src/app/auth/sign-in/page.tsx` | Reframed the sign-in page through the shared pre-login shell while keeping config, current-user, and redirect behavior unchanged. |
| `src/features/auth/sign-in-form.tsx` | Increased spacing, hierarchy, button emphasis, and error visibility without changing form fields or action semantics. |
| `src/features/auth/components/prelogin-shell.tsx` | Loosened the right rail width so the shared shell can support a real sign-in form without desktop shrinkage. |

## Test commands run

| Command | Result |
|---------|--------|
| `npm run lint` | Pass. |
| `npm run build` | Pass. |

## Behavior verification

- Primary action remains `/auth/sign-in` and is visually dominant.
- `/admin` is still secondary text-only access.
- No auth/session/middleware code changed.
- No global CSS token was needed.
- `npx ui-skills start` was invoked, but it only returned the UI Skills root guidance; no browser-based runtime review was performed in this batch.
- Sign-in configured vs unconfigured handling stays behaviorally identical; only presentation changed.
- Invalid-credential errors remain visible inside the form and are no longer cramped by the old boxed layout.

## Deviations from design

None. The landing slice stayed within the approved boundary and only deepened the presentation.

## Remaining tasks

- [ ] 4.2 Manual runtime review with `npx ui-skills start`.
- [ ] 4.3 Auth parity checks on `/auth/sign-in`.
- [ ] 5.1 Remove any redundant wrapper classes after the full slice is done.
