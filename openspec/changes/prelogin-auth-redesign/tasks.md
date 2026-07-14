# Tasks: Pre-login auth redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 260-360 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 landing shell/foundation → PR 2 sign-in alignment/parity |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Add shared pre-login framing and recompose `/` hierarchy around one dominant sign-in CTA | PR 1 (base = feature branch) | `npm run lint` | `npx ui-skills start`; manually review `/` at 320/375/1440 widths | `src/app/page.tsx`, `src/features/auth/components/prelogin-shell.tsx` |
| 2 | Align `/auth/sign-in` and `sign-in-form` to the same system without auth behavior changes | PR 2 (base = PR 1 branch) | `npm run lint && npm run build` | `npx ui-skills start`; manually verify sign-in configured/unconfigured, invalid error, and valid redirect parity | `src/app/auth/sign-in/page.tsx`, `src/features/auth/sign-in-form.tsx`, optional `src/app/globals.css` |

## Phase 1: Foundation

- [x] 1.1 Create `src/features/auth/components/prelogin-shell.tsx` as a presentational-only wrapper for eyebrow, heading, CTA zone, support content, and mobile-first stacking.
- [x] 1.2 If both pages repeat one missing value, add a single shared token in `src/app/globals.css`; otherwise keep styling local to avoid scope creep.

## Phase 2: Landing slice

- [x] 2.1 Update `src/app/page.tsx` so `/` uses the pre-login shell, keeps one primary `/auth/sign-in` CTA, and demotes `/admin` from first-view competition.
- [x] 2.2 Refine landing proof/support blocks in `src/app/page.tsx` for sober premium tone and direct mobile-first vertical flow at 320px.

## Phase 3: Sign-in alignment

- [x] 3.1 Update `src/app/auth/sign-in/page.tsx` to reuse the shared pre-login framing while preserving `hasSupabaseEnv`, `getCurrentUser`, and redirect behavior unchanged.
- [x] 3.2 Update `src/features/auth/sign-in-form.tsx` spacing, hierarchy, button emphasis, and error placement without changing fields, submit action, or validation semantics.

## Phase 4: Verification

- [x] 4.1 Run `npm run lint` and `npm run build`; fix any regressions inside the pre-login slice only.
- [ ] 4.2 Manual parity check with `npx ui-skills start`: verify `/` and `/auth/sign-in` at 320px, 375px, and desktop for no horizontal scroll and coherent visual tone.
- [ ] 4.3 Manual auth parity check on `/auth/sign-in`: configured vs unconfigured states, invalid-credential error visibility, and valid-login redirect unchanged from current behavior.

## Phase 5: Cleanup

- [ ] 5.1 Remove any redundant landing/sign-in wrapper classes left after shell extraction so the slice stays near `/`, `/auth/sign-in`, and `sign-in-form` only.
