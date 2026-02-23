<!-- Sync Impact Report
- Version change: [CONSTITUTION_VERSION] -> 1.0.0
- List of modified principles:
  - Added: 1. Static-First Architecture
  - Added: 2. Content Is Source of Truth
  - Added: 3. Cloudflare-Only Infrastructure
  - Added: 4. Deterministic Builds
  - Added: 5. Simplicity Over Cleverness
  - Added: 6. Type-Safe by Default
  - Added: 7. No Runtime Content Fetching
  - Added: 8. Edge-Native Enhancements Only
  - Added: 9. Performance Is a Feature
  - Added: 10. CI Is the Gatekeeper
  - Added: 11. The Project Must Remain a Website
- Added sections: Core Principles, Guiding Principle
- Removed sections: [SECTION_2_NAME], [SECTION_3_NAME] (consolidated)
- Templates requiring updates (✅ updated / ⚠ pending):
  - `.specify/templates/plan-template.md` (✅ updated)
  - `.specify/templates/spec-template.md` (✅ updated)
  - `.specify/templates/tasks-template.md` (✅ updated)
  - `.cursor/commands/speckit.constitution.md` (✅ updated - no outdated refs)
- Follow-up TODOs: none
-->

# wchen.ai Constitution

This document defines the permanent engineering principles of the `wchen.ai` project.
All specifications, plans, and implementations MUST comply.
If a task conflicts with this constitution, the constitution overrides the task.

## Core Principles

### 1. Static-First Architecture
This project follows a **Static-First** approach.

Rules:
1. All content pages MUST be statically generated at build time.
2. Runtime server rendering is forbidden unless absolutely unavoidable.
3. If dynamic behavior is required → prefer build-time generation.
4. If build-time is impossible → use cached edge functions.
5. True dynamic runtime logic is the last resort and MUST be justified.

Priority order:
`Build-time generation > Edge cache > Edge compute > Runtime compute`

This site MUST function as a fully browsable static site if all APIs fail.

### 2. Content Is Source of Truth
This is a **Content-Driven Site**.

Rules:
1. All site content MUST live in `/content` as markdown or MDX.
2. No database is allowed for site content.
3. No CMS dashboard is allowed.
4. Adding a markdown file MUST create a page.
5. Invalid content MUST fail the build.

Frontmatter schemas are contracts, not suggestions.

### 3. Cloudflare-Only Infrastructure
This project follows a **Single-Provider Edge Architecture**.

Allowed platforms:
* Cloudflare Pages
* Cloudflare Workers / Pages Functions
* Cloudflare KV / Cache (if justified)

Forbidden:
* Vercel
* Netlify
* AWS server infrastructure
* Firebase
* External hosting servers

The site MUST be deployable entirely within Cloudflare.

### 4. Deterministic Builds
Builds MUST be reproducible and predictable.

Rules:
1. Same commit → same output.
2. No hidden runtime data dependencies.
3. No client-side fetching required for page rendering.
4. External data MUST be cached at build time or edge cached.
5. Broken external APIs MUST never break page rendering.

The website MUST degrade gracefully.

### 5. Simplicity Over Cleverness
This project follows a **Low-Complexity Principle**.

Preferred:
* Fewer moving parts
* Fewer services
* Static generation
* Explicit logic

Avoid:
* Over-engineering
* Abstraction layers without need
* Plugin ecosystems when a utility function suffices

The site is a personal website, not a platform.

### 6. Type-Safe by Default
This project is **strictly typed**.

Rules:
1. TypeScript strict mode required.
2. No `any` types.
3. Frontmatter MUST be typed and validated.
4. Build fails on type errors.

If data shape is unknown → validate and narrow.

### 7. No Runtime Content Fetching
Pages MUST never depend on browser-time content fetching to render.

Allowed:
* Build-time data fetching
* Cached edge endpoints for enhancements

Forbidden:
* Client fetching for primary content
* Hydration-dependent page rendering

The site MUST remain readable with JavaScript disabled.

### 8. Edge-Native Enhancements Only
Server features exist only as progressive enhancement.

Examples allowed:
* Contact form submission
* Cached GitHub activity
* Lightweight APIs

Examples forbidden:
* User accounts
* Dashboards
* Persistent application state

This is a presentation site, not an application backend.

### 9. Performance Is a Feature
The site MUST feel instant.

Targets:
* Minimal JS shipped
* Static HTML prioritized
* Motion MUST not block rendering
* Respect reduced-motion preferences

Prefer CSS and server components over client JS.

### 10. CI Is the Gatekeeper
Nothing ships without passing CI.

CI MUST fail on:
* Type errors
* Invalid content schema
* Build errors

Successful deploys MUST originate only from the main branch pipeline.

### 11. The Project Must Remain a Website
This project MUST never evolve into a SaaS platform.

Disallowed expansions:
* Authentication systems
* User data storage
* Multi-tenant logic
* Admin dashboards

If a feature turns the site into an application, it MUST be rejected.

## Guiding Principle

> The purpose of this project is to publish ideas and showcase work, not to run software services.

All decisions SHOULD bias toward longevity, clarity, and zero maintenance burden.

## Governance

All PRs/reviews MUST verify compliance. Complexity MUST be justified. 

Amendments require documentation, approval, and a migration plan. The Constitution versioning policy follows semantic versioning:
- **MAJOR**: Backward incompatible governance/principle removals or redefinitions.
- **MINOR**: New principle/section added or materially expanded guidance.
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements.

**Version**: 1.0.0 | **Ratified**: 2026-02-22 | **Last Amended**: 2026-02-22