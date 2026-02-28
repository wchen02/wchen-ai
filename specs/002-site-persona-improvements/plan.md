# Implementation Plan: Site Persona Improvements

**Branch**: `002-site-persona-improvements` | **Date**: 2026-02-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-site-persona-improvements/spec.md`

## Summary

Add credibility signals (headshot, social links, background narrative), navigation UX (active nav state), SEO enhancements (Twitter cards, JSON-LD), content engagement features (read next, share button, table of contents), newsletter signup via Resend, and a manual dark mode toggle. All features are compatible with the static-first architecture — pages are still statically generated, with two new Cloudflare Pages Functions for newsletter subscribe and confirm.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.1.6, React 19.2.3  
**Primary Dependencies**: Tailwind CSS 4, Framer Motion, Zod 4, next-mdx-remote 6, gray-matter  
**New Dependencies**: rehype-slug (heading IDs for TOC); Resend API called via fetch, icons are inline SVGs  
**Storage**: localStorage (theme preference), Cloudflare Pages Functions (newsletter)  
**Testing**: Vitest (unit), Playwright (E2E)  
**Target Platform**: Cloudflare Pages (static export + Pages Functions)  
**Project Type**: Static website with edge functions  
**Performance Goals**: <100ms theme toggle, <500ms clipboard copy feedback, minimal JS added  
**Constraints**: `output: "export"` (static), no KV/database, Cloudflare-only  
**Scale/Scope**: ~10 files modified, ~8 new files created

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Static-First**: All pages remain statically generated. TOC and related posts computed at build time. Newsletter and theme toggle are progressive enhancements.
- [x] **Content Source**: No databases or CMS. Social links live in a TypeScript config file. Background narrative is updated directly in the about page component.
- [x] **Infrastructure**: Cloudflare only. Resend is called from Cloudflare Pages Functions (same pattern as existing Mailgun contact form). No KV needed — double opt-in uses stateless HMAC tokens.
- [x] **Simplicity**: Minimal new abstractions. Social config is a plain object. TOC is a utility function. Theme toggle is a single client component. No new libraries added.
- [x] **Type Safety**: All new data shapes (SocialLink, TOCItem, NewsletterPayload) validated with Zod and typed with TypeScript.
- [x] **Client Fetching**: No content depends on browser-time fetching. Newsletter signup and share button are progressive enhancements that work via user interaction only.
- [x] **Application Scope**: No user accounts, dashboards, or persistent application state. Newsletter is email collection only.

## Project Structure

### Documentation (this feature)

```text
specs/002-site-persona-improvements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── newsletter-subscribe.md
│   └── newsletter-confirm.md
└── checklists/
    └── requirements.md  # Already created
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                    # MODIFY: social icons, active nav, theme toggle, twitter meta
│   ├── globals.css                   # MODIFY: class-based dark mode for Tailwind v4
│   ├── about/page.tsx                # MODIFY: headshot, background narrative, JSON-LD Person
│   ├── writing/
│   │   ├── page.tsx                  # MODIFY: add newsletter signup
│   │   └── [slug]/page.tsx           # MODIFY: JSON-LD Article, TOC, share, read next, newsletter
│   └── newsletter-confirmed/page.tsx # NEW: static confirmation success page
├── components/
│   ├── NavLink.tsx                   # NEW: client component with active state (usePathname)
│   ├── SocialIcons.tsx               # NEW: inline SVG social icons component
│   ├── ThemeToggle.tsx               # NEW: dark/light mode toggle (client component)
│   ├── ShareButton.tsx               # NEW: copy-link + Web Share API (client component)
│   ├── TableOfContents.tsx           # NEW: TOC from heading list (server component)
│   ├── ReadNext.tsx                  # NEW: related posts section (server component)
│   └── NewsletterSignup.tsx          # NEW: email signup form (client component)
└── lib/
    ├── site-config.ts                # NEW: centralized social links + site metadata
    ├── mdx.ts                        # MODIFY: add getRelatedWritings(), extractHeadings()
    └── schemas.ts                    # MODIFY: add NewsletterPayloadSchema re-export

functions/api/
├── newsletter.ts                     # NEW: POST handler — validate, sign token, send confirm email
└── newsletter-confirm.ts             # NEW: GET handler — verify HMAC token, add contact to Resend

shared/
└── newsletter.ts                     # NEW: NewsletterPayloadSchema (shared between FE and edge fn)

public/
└── headshot.jpg                      # NEW: Wilson's headshot (user-provided, placeholder if absent)
```

**Structure Decision**: Follows existing single-project Next.js App Router structure. New components added to `src/components/`, new utility functions to `src/lib/`, new edge functions to `functions/api/`. No structural changes to the repository layout.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
