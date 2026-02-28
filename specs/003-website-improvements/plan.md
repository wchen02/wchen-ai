# Implementation Plan: Website Improvements (Multi-Perspective)

**Branch**: `003-website-improvements` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/003-website-improvements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement multi-perspective improvements to wchen.ai: (1) clearer credibility and scannability on homepage and About; (2) full accessibility for forms and controls (labels, live regions, focus, theme state); (3) project filtering/grouping; (4) rich previews, canonical/locale, optional per-article images, and on-site search; (5) explicit performance targets and image optimization when the host supports it; (6) newsletter/RSS/contact prominence; (7) Read Next and share feedback; (8) automated a11y/metadata checks, centralized metadata defaults, and build-time link validation. All work stays static-first, content-driven, and Cloudflare-only.

## Technical Context

**Language/Version**: TypeScript 5.x, Node (build), React 19, Next.js 16  
**Primary Dependencies**: Next.js (static export), next-mdx-remote, Tailwind CSS 4, Framer Motion, Zod, gray-matter, rehype-slug, remark-gfm  
**Storage**: File-based only — content in `/content` (MDX), no database; optional static JSON search index generated at build time  
**Testing**: Vitest (unit), Playwright (e2e); CI runs typecheck, lint, build, tests  
**Target Platform**: Cloudflare Pages (static export); optional Pages Functions for contact/newsletter  
**Project Type**: Static site (web) with progressive enhancement (forms, theme, optional client-side search)  
**Performance Goals**: LCP ≤ 2.5s, CLS ≤ 0.1 on critical routes; minimal JS; motion non-blocking and respects reduced-motion  
**Constraints**: Static export only (`output: "export"`); no runtime content fetch for primary rendering; images currently unoptimized (host-dependent)  
**Scale/Scope**: Single-tenant personal site; ~tens of writings and projects; critical routes: homepage, About, writing index, one writing page, projects index

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Static-First**: No runtime server rendering. All content is build-time; on-site search uses a build-time-generated index and client-side filtering (progressive enhancement).
- [x] **Content Source**: No databases or CMS. All content remains in `/content` as MDX; theme descriptors and metadata defaults live in config or frontmatter.
- [x] **Infrastructure**: Cloudflare only (Pages, optional Functions). No Vercel, Netlify, AWS, or Firebase.
- [x] **Simplicity**: No new services. Additions are: config for metadata/theme descriptors, optional static search index script, and CI checks. No extra abstraction layers.
- [x] **Type Safety**: All new data (metadata defaults, theme descriptors, search index shape) will be typed and validated with Zod where applicable.
- [x] **Client Fetching**: Primary rendering does not depend on browser-time fetch. Search is enhancement over static HTML; if JS is disabled, writing index and theme links remain usable.
- [x] **Application Scope**: No user accounts, auth, or dashboards. Site remains a website (presentation + contact/newsletter forms).

## Project Structure

### Documentation (this feature)

```text
specs/003-website-improvements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — not created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                  # App Router: page.tsx, layout.tsx, writing/, projects/, about/
├── components/           # UI: NavLink, ThemeToggle, NewsletterSignup, ContactForm, etc.
└── lib/                  # mdx.ts, schemas.ts, site-config.ts; add metadata defaults, theme config

content/
├── writing/*.mdx         # Writing frontmatter: theme, tags; optional ogImage
└── projects/*.mdx        # Project frontmatter: type[], status

scripts/                  # validate-links.ts, fetch-github-data.ts, generate-rss.ts, generate-sitemap.ts
                          # Add: generate-search-index.ts (optional), metadata validation for CI

shared/                   # contact, newsletter payload schemas (existing)

public/                   # og-default.png, favicon, github-contributions.json
                          # Optional: search-index.json (build output)

tests/                    # Unit and e2e; add a11y and metadata checks for critical routes
```

**Structure Decision**: Single Next.js app. New work adds: centralized metadata and theme descriptor config under `src/lib`, optional search index script and output, and CI/prebuild steps for link and metadata validation. No new top-level apps or services.

## Complexity Tracking

No constitution violations. This section is intentionally empty.
