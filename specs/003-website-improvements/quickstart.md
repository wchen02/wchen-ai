# Quickstart: Implementing 003-website-improvements

**Branch**: `003-website-improvements`  
**Audience**: Developer implementing the feature or onboarding to the codebase

## Prerequisites

- Node 20+, pnpm
- Repository root: `wchen.ai` (Next.js 16, static export)

## Commands

```bash
# Install
pnpm install

# Dev (no prebuild required for local content)
pnpm dev

# Full build (runs prebuild: validate-links, fetch-github-data, generate-rss, generate-sitemap)
pnpm build

# Typecheck and lint
pnpm typecheck
pnpm lint

# Tests
pnpm test          # Unit (Vitest)
pnpm test:e2e      # E2E (Playwright)
```

## Where to change what

| Spec area | Primary locations |
|-----------|-------------------|
| **Credibility & scannability (US1)** | `src/app/page.tsx` (hero, section summaries); `src/app/about/page.tsx` (headshot, background, social) |
| **Accessibility (US2)** | `src/components/NewsletterSignup.tsx`, `src/components/ContactForm.tsx` (labels, live regions); `src/components/ThemeToggle.tsx` (state); header in `src/app/layout.tsx` (focus order, focus-visible) |
| **Project filter/group (US3)** | `src/app/projects/page.tsx`; optional client component for filter UI; data from `getProjects()` (type, status) |
| **SEO & search (US4)** | Metadata: `src/app/layout.tsx`, per-route `metadata` / `generateMetadata`; canonical + locale in defaults. Search: `scripts/generate-search-index.ts` (optional), search UI on writing index or layout |
| **Performance (US5)** | `next.config.ts` (images when host supports); LCP/CLS targets in CI or constants; fonts/hero in `globals.css` and hero component (no layout shift) |
| **Newsletter / RSS / Contact (US6)** | Writing index + footer: `NewsletterSignup`, RSS link; Contact: `src/app/page.tsx` (section) or nav target |
| **Read Next & share (US7)** | `src/app/writing/[slug]/page.tsx` (Read Next, ShareButton); ensure confirmation dismisses (existing or add timeout) |
| **Quality automation (US8)** | CI: Playwright + axe for a11y; Node script for metadata/JSON-LD validation; extend `scripts/validate-links.ts` if needed. Centralized metadata: `src/lib/metadata-defaults.ts` or extend `site-config.ts` |

## New files to add (reference)

- `src/lib/metadata-defaults.ts` (or extend `src/lib/site-config.ts`): siteName, defaultOgImageUrl, locale, canonicalBaseUrl
- `src/lib/theme-config.ts`: map theme key → descriptor
- `scripts/generate-search-index.ts`: optional; outputs `public/search-index.json`
- Metadata validation script (e.g. `scripts/validate-metadata.ts`) for CI
- A11y test(s) in Playwright for critical routes

## Content

- **Writing frontmatter**: Optional `ogImage: "https://..."` for article-specific preview (schema change in `src/lib/schemas.ts` if added).
- **Theme descriptors**: Add theme keys and descriptions to theme config; ensure every `theme` in writings has an entry (warn in build or lint).
- **Hero credibility**: Edit copy in `src/app/page.tsx` (or pull from a small content file) to add one concrete signal.

## Constitution reminders

- No runtime content fetch for primary render; search is over static index (progressive enhancement).
- All content in `/content`; no database or CMS.
- Cloudflare only; static export; CI must pass (typecheck, lint, build, tests).
