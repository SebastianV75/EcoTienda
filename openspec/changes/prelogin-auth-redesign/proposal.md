# Pre-login auth redesign — align landing and sign-in for a premium mobile-first first impression

Redesign the pre-login experience as a small, reviewable first slice centered on landing and sign-in coherence, so EcoTienda presents a more premium, sober, reliable, and faster-feeling entry point before broader UI/UX work expands deeper into the product.

## Business problem

The current pre-login/auth entry does not yet carry the product direction now confirmed for EcoTienda: a serious redesign with stronger first impression, clearer access hierarchy, and a faster mobile feel. This is the first surface new and returning users see, so if it feels generic, visually noisy, or like a shrunk desktop layout, it weakens trust before the product has a chance to demonstrate value.

Because `formato-cfe` is paused, the next highest-leverage workstream is the UI/UX redesign starting at pre-login/auth. This slice should establish the tone and constraints for the broader redesign without overreaching into a large implementation batch.

## Target users and situations

- New visitors evaluating EcoTienda from the landing entry point
- Returning users trying to access sign-in quickly from mobile
- Operational users who need the path to access to feel immediate and unambiguous
- Stakeholders reviewing whether the redesign direction feels premium, sober, and product-appropriate before larger rollout

## Current-state gap

- Landing and sign-in do not yet read as one coherent entry experience
- Access hierarchy can be clearer, especially on small screens where priority and flow matter more
- The mobile feel needs to be faster and more operational, not a compressed desktop composition
- The visual language needs stronger discipline to avoid generic SaaS cues, AI-slop styling, and decorative excess

## Product outcome

EcoTienda should gain a more credible and differentiated first impression before login: sober editorial tone balanced with technical premium signals, clearer sign-in priority, and a mobile-first interaction rhythm that feels reliable and fast.

This slice should also create a stable reference point for future redesign work, so later pre-login and auth-adjacent changes inherit a consistent direction instead of re-deciding the tone each time.

## In scope

- Proposal and planning for a redesign slice focused on landing and sign-in alignment
- Clarifying the intended visual and interaction direction for pre-login/auth
- Defining the first slice boundary around first impression, access hierarchy, and mobile feel
- Allowing minimal adjacent non-functional adjustments when they materially improve coherence of the landing/sign-in experience
- Identifying the main product areas and files likely affected by later implementation

## Non-goals

- No implementation in this change
- No spec, design, or tasks artifacts in this step
- No broader authenticated-app redesign
- No expansion into unrelated product flows just because they are visually nearby
- No decorative redesign driven by trends rather than clarity, trust, and mobile operational feel

## Constraints

- Keep the slice small and reviewable
- Preserve focus on pre-login/auth as the starting point of the redesign workstream
- Target feel: premium, sober, reliable, clear, fast on mobile
- Design language: premium technical + sober editorial + operational mobile
- Avoid generic SaaS aesthetics, excessive gradients, AI-slop patterns, and desktop-first mobile compression
- Future implementation should use `npx ui-skills start`
- Future implementation may consider these optional design aids if available: `anthropics/frontend-design`, `nextlevelbuilder/ui-ux-pro-max`, `leonxlnx/redesign-skill`, `pbakaus/adapt`

## Affected areas and files

This proposal does not implement changes, but later work is expected to touch the pre-login entry surfaces and supporting UI foundations around them.

- Landing page entry UI and content structure
- Sign-in screen layout, hierarchy, and affordances
- Shared pre-login layout/styling primitives that influence coherence across landing and sign-in
- Mobile-first spacing, typography, and interaction treatment for the auth entry path
- `openspec/changes/prelogin-auth-redesign/proposal.md`

## Risks and tradeoffs

- Starting with landing + sign-in may create pressure to redesign adjacent screens too early; the slice must stay disciplined
- A strong premium direction can drift into over-styling unless reliability and clarity remain the governing criteria
- Tight mobile optimization may require saying no to desktop compositions that look impressive but slow down access intent on phones
- Allowing minimal adjacent coherence adjustments is useful, but it introduces judgment calls that must stay non-functional and bounded

## Rollback

Because this artifact is proposal-only, rollback is straightforward:

- Abandon the change before implementation if the direction is not approved
- Narrow the slice further if reviewers judge the scope too broad
- Re-prioritize another redesign slice if business needs change before design work begins

## Success criteria

- [ ] The proposal clearly frames why pre-login/auth is the correct first redesign slice
- [ ] The business problem, current gap, and target product outcome are explicit and reviewable
- [ ] Scope is intentionally small, with landing + sign-in alignment as the center of gravity
- [ ] Non-goals prevent accidental expansion into implementation or broader redesign work
- [ ] Constraints capture the approved design language and anti-patterns to avoid
- [ ] Future implementation guidance explicitly references `npx ui-skills start` and the optional design aids
