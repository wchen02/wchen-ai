# Research: Website Improvements (003)

**Branch**: `003-website-improvements` | **Date**: 2026-02-28

Decisions made during Phase 0 to support the implementation plan. All items below were resolved; no NEEDS CLARIFICATION remain.

---

## 1. On-site search

**Decision**: Implement client-side search over a **static JSON index** generated at build time. The index includes title, slug, theme, and tags for each writing. The UI is a search input (e.g. on the writing index or header) that filters the index in memory; no server or runtime fetch for index data.

**Rationale**: Keeps the site static-first and compliant with "no runtime content fetching" for primary content. Search is progressive enhancement: the writing index already lists all posts and theme anchors; with JS, users get fast filtering. The index is small (tens of entries), so generating and shipping it is cheap.

**Alternatives considered**:
- Server-side search (e.g. Cloudflare Worker + KV): Rejected — adds runtime dependency and violates "content is source of truth" for search path.
- Third-party search (Algolia, etc.): Rejected — external dependency and ongoing cost; overkill for site size.
- No search, theme links only: Kept as fallback; adding a small static index improves discoverability with minimal complexity.

---

## 2. Image optimization with static export

**Decision**: Keep **build-time and host-level** strategy. Next.js `images: { unoptimized: true }` remains for static export. When the host (Cloudflare Pages) supports image resizing (e.g. Cloudflare Image Resizing or direct URL params), use a single default and optional per-article image URLs in metadata; do not rely on Next Image component for optimization until hosting supports it. Specify explicit LCP/CLS targets so regressions are measurable even with unoptimized images.

**Rationale**: Next.js image optimization requires a server; static export cannot use it. Cloudflare can optimize at the edge if enabled. Defining performance targets (e.g. LCP ≤ 2.5s, CLS ≤ 0.1) and optionally adding Cloudflare Image Resizing later keeps the spec satisfied whether or not optimization is enabled.

**Alternatives considered**:
- Switching to a server/SSR host for images: Rejected — constitution requires static-first and Cloudflare-only.
- Generating multiple image sizes at build: Acceptable for a small set of known images (e.g. og-default, headshot); can be added later without changing the decision.

---

## 3. Accessibility and SEO automation

**Decision**: Use **Playwright** (existing e2e) to load critical routes and run **axe-core** (or equivalent) for accessibility; add a **Node script** that parses built HTML or page metadata exports to validate required meta tags and JSON-LD presence. Run both in CI; fail the build or report clearly on failure. No new runtime services.

**Rationale**: The project already has Playwright. Adding an a11y step (e.g. `@axe-core/playwright` or similar) reuses the same stack. Metadata validation can be a small script that runs after build (or against generated route list) and checks for required og:title, og:description, canonical, and JSON-LD on about and writing pages. Keeps CI as the gatekeeper without introducing new infra.

**Alternatives considered**:
- Pa11y or Lighthouse CI: Acceptable alternatives; Playwright + axe was chosen to stay within the existing test runner.
- Manual checks only: Rejected — spec requires automated checks so quality does not regress as content grows.

---

## 4. Theme descriptors

**Decision**: Store **theme descriptors** in a single config file (e.g. `src/lib/theme-config.ts` or in `site-config`) as a map from theme slug/key to short description. Writing frontmatter continues to reference `theme` by key; the config supplies the human-readable descriptor for the writing index and any related-content UI.

**Rationale**: Avoids duplicating descriptors in every MDX file and keeps the topical map consistent. Adding a new theme is one line in config plus use in frontmatter.

**Alternatives considered**:
- Descriptor in each writing's frontmatter: Rejected — duplicated and can drift.
- Derive from first writing per theme: Rejected — fragile and not always a good label.

---

## 5. Canonical URL and locale

**Decision**: **Canonical**: Use a single form (e.g. no trailing slash) and emit `<link rel="canonical">` on all pages, using the existing `SITE_URL` from site-config. **Locale**: Keep `<html lang="en">`; add `og:locale` (e.g. `en_US`) to default metadata and ensure it is applied on all page types.

**Rationale**: Reduces duplicate-content risk and aligns with spec FR-011. Single source for base URL (site-config) keeps canonicals consistent.

**Alternatives considered**:
- Trailing-slash canonical: Either form is fine; pick one and document it.
- Multiple locales: Out of scope; site is English-only.
