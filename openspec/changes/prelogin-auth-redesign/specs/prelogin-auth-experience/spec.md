# Pre-login Auth Experience Specification

## Purpose

Define a coherent, premium, mobile-first entry experience across the landing and sign-in surfaces while preserving all existing authentication behavior.

## Requirements

### Requirement: Cohesive Pre-login Product Identity

The system MUST present the landing and sign-in surfaces as one recognizable EcoTienda entry experience. Both surfaces SHALL use a restrained, sober visual language that balances editorial clarity with technical reliability.

#### Scenario: Visitor moves from landing to sign-in

- GIVEN a visitor is viewing the landing surface
- WHEN the visitor opens the sign-in surface
- THEN the two surfaces present consistent brand, typography, spacing, and visual tone

#### Scenario: Visual style is reviewed

- GIVEN either pre-login surface is rendered
- WHEN it is reviewed against the product direction
- THEN it avoids generic SaaS motifs, excessive gradients, AI-generated decorative patterns, and project-log-style content

### Requirement: Landing Access Hierarchy

The landing surface MUST establish a credible product first impression and SHALL make the primary sign-in path unambiguous. Primary access MUST be visually more prominent than secondary actions or supporting content.

#### Scenario: New visitor chooses access

- GIVEN a visitor reaches the landing surface
- WHEN the visitor scans its initial content
- THEN the product proposition and primary sign-in action are identifiable without competing equal-priority actions

#### Scenario: Supporting content is present

- GIVEN the landing surface includes supporting information
- WHEN a visitor views it
- THEN it reinforces trust and product value without displacing the primary access path

### Requirement: Focused Sign-in Experience

The sign-in surface MUST prioritize the existing sign-in form and its supporting guidance as the sole primary task. The redesigned presentation MUST NOT change authentication inputs, submission behavior, validation, errors, success handling, routes, or session behavior.

#### Scenario: Returning user signs in

- GIVEN a returning user opens the sign-in surface
- WHEN the user provides valid existing credentials and submits the form
- THEN the authentication outcome remains identical to the behavior before this redesign

#### Scenario: Sign-in fails

- GIVEN a user submits invalid credentials
- WHEN authentication rejects the submission
- THEN the existing error outcome remains available and visually understandable without obscuring the form

### Requirement: Mobile-first Access Rhythm

The landing and sign-in surfaces MUST support a 320 CSS-pixel-wide viewport without horizontal scrolling or desktop-only compression. On small screens, the primary access action or sign-in form SHALL be reachable with a direct, obvious vertical flow.

#### Scenario: Visitor uses a narrow mobile viewport

- GIVEN the landing surface is rendered at 320 CSS pixels wide
- WHEN the visitor navigates to sign-in
- THEN content remains legible, interactive targets remain usable, and the access path does not require horizontal scrolling

#### Scenario: Returning user accesses sign-in on mobile

- GIVEN the sign-in surface is rendered at 320 CSS pixels wide
- WHEN the user needs to enter credentials
- THEN the form is presented as the immediate task rather than as a shrunk desktop composition

### Requirement: Redesign Slice Boundary

The system MUST limit this slice to landing and sign-in presentation plus strictly necessary non-functional shared styling. It MUST NOT redesign authenticated routes, the application shell, protected experiences, or authentication/session infrastructure.

#### Scenario: Adjacent styling is needed

- GIVEN a shared presentational adjustment is necessary for landing/sign-in coherence
- WHEN the adjustment is introduced
- THEN it does not alter authentication logic, middleware, session handling, or protected application behavior
