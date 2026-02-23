# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Create a static-first personal website for Wilson Chen, establishing him as a founder and builder. The site will use Next.js (App Router, static export) with MDX content, deployed to Cloudflare Pages. Content is managed purely via local Markdown files with Zod validation. A Cloudflare Pages Function will handle contact form submissions. Performance, type safety, and minimal JS are paramount.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (strict) with Next.js (App Router)  
**Primary Dependencies**: Next.js, React, Tailwind CSS, Framer Motion (lazy loaded), Zod (frontmatter validation)  
**Storage**: None (Markdown/MDX files under `/content`)  
**Testing**: NEEDS CLARIFICATION (likely Vitest or Jest for unit testing logic/validation, plus Playwright/Cypress for E2E if needed)  
**Target Platform**: Cloudflare Pages (Static Export) + Cloudflare Workers/Pages Functions (API)  
**Project Type**: Personal Website (Static Site + Serverless Edge APIs)  
**Performance Goals**: Fast Lighthouse scores (90+), max 100KB initial JS payload, static HTML prioritized  
**Constraints**: No database, no third-party CMS, no runtime content fetching, static-first (pre-render at build time)  
**Scale/Scope**: ~50+ projects/writings initially, updated every few weeks. No auth, no user accounts.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Static-First**: Does the feature rely on runtime server rendering? (If yes, it must be rejected or redesigned for build-time/edge). *No, Next.js output='export' is enforced.*
- [x] **Content Source**: Are we adding databases or CMS dashboards? (Forbidden, use `/content` MDX). *No, strict local MDX parsing.*
- [x] **Infrastructure**: Does this require AWS, Vercel, Netlify, or Firebase? (Forbidden, must use Cloudflare only). *No, using Cloudflare Pages.*
- [x] **Simplicity**: Does this add unnecessary abstraction layers or services? *No, lightweight file-system based routing.*
- [x] **Type Safety**: Are data shapes fully validated and typed? *Yes, Zod schemas block the build on invalid content.*
- [x] **Client Fetching**: Does rendering depend on browser-time content fetching? (Forbidden). *No, GitHub stats are fetched pre-build.*
- [x] **Application Scope**: Does this add user accounts, auth systems, or dashboards? (Forbidden, must remain a website). *No.*

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/
├── content/              # MDX files (projects/, writing/)
├── public/               # Static assets (images, github-data.json)
├── src/
│   ├── app/              # Next.js App Router (pages, layout)
│   ├── components/       # React components (UI, MDX wrappers)
│   └── lib/              # Utilities (Zod schemas, MDX parsers)
├── functions/            # Cloudflare Pages Functions (api/contact.ts)
├── scripts/              # Pre-build scripts (fetch-github.ts, generate-rss.ts)
└── tests/                # Vitest/Playwright tests
```

**Structure Decision**: A Next.js App Router application structure with adjacent `/content` (for MDX source of truth) and `/functions` (for Cloudflare Pages Functions API) to ensure strict separation of build-time content, frontend views, and edge API logic.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No constitution violations present. Architecture strictly adheres to all core principles.*
