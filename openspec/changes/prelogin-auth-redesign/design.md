# Design: Pre-login auth redesign

## Technical Approach

Implement a presentation-only pre-login slice that makes `/` and `/auth/sign-in` feel like one entry system while preserving all existing auth behavior. The slice stays inside the current Next.js app routes, reuses existing CSS variables from `src/app/globals.css`, and introduces at most one shared pre-login presentational component under `src/features/auth` to avoid touching protected-shell code. This satisfies the spec requirements for cohesive identity, clear landing access hierarchy, focused sign-in, mobile-first flow, and strict slice boundaries.

## Architecture Decisions

| Decision | Options | Choice / Rationale |
|---|---|---|
| Shared pre-login structure | Duplicate page markup; shared shell component | Use a small shared pre-login shell/component for layout rhythm, hero framing, and CTA zone. It keeps landing and sign-in coherent without introducing app-wide abstractions. |
| Styling scope | New global tokens; local utilities on existing tokens | Prefer local Tailwind classes referencing existing `:root` vars. Add global tokens only if one missing value is reused on both pages. This keeps the slice reviewable. |
| Auth preservation | Restyle form and actions together; isolate presentation from logic | Keep `signInAction`, `getCurrentUser`, redirects, inputs, validation, and session flow unchanged. Only wrappers, copy hierarchy, spacing, and affordance styling move. |

## Data Flow

Landing page remains a static entry and routes users to sign-in. Sign-in keeps the same server/client auth path.

    LandingPage ──Link──> SignInPage ──renders──> SignInForm
                                              │
                                              └──useActionState──> signInAction
                                                                    │
                                                                    └──Supabase auth + existing redirect

## File Changes

| File | Action | Description |
|---|---|---|
| `src/app/page.tsx` | Modify | Recompose landing into a calmer premium mobile-first entry with one dominant sign-in CTA and supporting proof content. |
| `src/app/auth/sign-in/page.tsx` | Modify | Align page framing, copy hierarchy, and responsive structure with landing while preserving the current redirect/config checks. |
| `src/features/auth/sign-in-form.tsx` | Modify | Keep fields/action intact; refine spacing, labels, button emphasis, and error placement to fit the new pre-login system. |
| `src/features/auth/components/prelogin-shell.tsx` | Create | Optional small shared presentational shell for common pre-login container, heading, support panel, and mobile stacking rules. |
| `src/app/globals.css` | Maybe modify | Only if one shared pre-login token is clearly missing and reused; otherwise leave untouched. |

Untouched by design: `src/features/auth/actions.ts`, `src/features/auth/session.ts`, `src/lib/supabase/**`, `middleware.ts`, `src/components/app-shell.tsx`, authenticated routes.

## Interfaces / Contracts

No auth or route contract changes. If a shared shell is added, keep it presentational-only:

```ts
type PreloginShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta?: React.ReactNode;
  secondaryContent?: React.ReactNode;
  children?: React.ReactNode;
};
```

`SignInForm` keeps the same fields (`email`, `password`) and submits to `signInAction` unchanged.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | None new unless a shared shell extracts conditional rendering | Add a minimal render test only if a new component contains branching. |
| Integration | Auth preservation | Verify valid login, invalid login, configured/unconfigured env states, and existing redirects still behave the same. |
| E2E/manual | Mobile-first presentation | Check 320px, 375px, and desktop widths for no horizontal scroll, clear primary CTA, and form-first sign-in flow. Run `npm run lint` and `npm run build`. |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Roll out as a single chained PR slice under the 400-line review budget.

## Open Questions

- [ ] Is one new shared pre-login component acceptable, or should the slice stay inside the two route files plus form only?
- [ ] Should the existing `/admin` shortcut on landing be visually demoted or removed from the first viewport for stricter access hierarchy?
