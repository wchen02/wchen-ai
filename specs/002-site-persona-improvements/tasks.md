# Tasks: Site Persona Improvements

**Input**: Design documents from `/specs/002-site-persona-improvements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec. Test tasks omitted. Validation via `pnpm typecheck` and `pnpm build` in Polish phase.

**Organization**: Tasks grouped by user story. Each story is independently implementable and testable after Setup completes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create shared config files used across multiple stories

- [x] T001 Install `rehype-slug` dependency via `pnpm add rehype-slug`
- [x] T002 Create site config with SocialLink type and SOCIAL_LINKS array in `src/lib/site-config.ts` — include X (`https://x.com/wchen_ai`), LinkedIn (`https://www.linkedin.com/in/wchen02/`), GitHub (`https://github.com/wenshengchen`), and SITE_URL constant (`https://wchen.ai`)

**Checkpoint**: Shared config and dependency ready. User story implementation can begin.

---

## Phase 2: User Story 1 — Visitor verifies founder credibility (Priority: P1) MVP

**Goal**: Add headshot, social links in header/footer, and rewrite about page background with specific career history.

**Independent Test**: Visit about page — see headshot near top, career narrative with company names. Visit any page — see X/LinkedIn/GitHub icons in header and text links in footer.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create `src/components/SocialIcons.tsx` — inline SVG icon component rendering X, LinkedIn, or GitHub icon based on a `platform` prop. Each icon should be 18-20px, inheriting text color via `currentColor`.
- [x] T004 [P] [US1] Add headshot to about page in `src/app/about/page.tsx` — add an `<img>` tag near the top of the page (after the header, before Philosophy section) for `/headshot.jpg` with alt text "Wilson Chen", rounded styling, and a fallback that shows initials "WC" if the image fails to load. Use a CSS fallback: render a `<div>` with centered initials text and neutral background behind the `<img>`, so if the image fails to load, the initials are visible without JavaScript. Avoids a client component wrapper per Constitution Principle 9.
- [x] T005 [US1] Rewrite the Background section in `src/app/about/page.tsx` — replace the existing three vague paragraphs with a narrative that names: Financial Times (junior engineer, ~5 years), Innovative Web Services (founded, CTO, ~3 years), Zume (engineer), HubSpot and FullStory (senior engineer), The Juicy Crab (CTO). Briefly mention bestpos.io and kloudeats.com as current ventures in 1 sentence. Preserve prose style — no bullet points, no resume formatting.
- [x] T006 [US1] Update header in `src/app/layout.tsx` — add social icons (X, LinkedIn, GitHub) to the right side of the header, visually separate from the text nav links. Import `SocialIcons` and `SOCIAL_LINKS` from site-config. Icons open in new tabs with `rel="noopener noreferrer"`. Use a `<div>` with `flex gap-3` containing icon links.
- [x] T007 [US1] Update footer in `src/app/layout.tsx` — replace the hardcoded GitHub link with links for all three social profiles from `SOCIAL_LINKS`, plus existing RSS and Contact links. All social links open in new tabs.

**Checkpoint**: Credibility signals visible on about page and all pages via header/footer. This is the MVP.

---

## Phase 3: User Story 2 — Active page indicated in navigation (Priority: P1)

**Goal**: Nav bar visually indicates the current page with a distinct active state.

**Independent Test**: Navigate to /projects, /writing, /about — each page highlights its corresponding nav link. Homepage shows no active link.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create `src/components/NavLink.tsx` — a `"use client"` component using `usePathname()` from `next/navigation`. Accepts `href` and `children` props. Renders a `<Link>` with emerald text color and font-semibold when the pathname starts with the `href` (exact match for `/`, prefix match for others). Falls back to the existing gray text style when inactive.
- [x] T009 [US2] Update nav in `src/app/layout.tsx` — replace the four `<Link>` elements in the nav with `<NavLink>` components. Keep the same `href` values: `/projects`, `/writing`, `/about`, `/#contact`. The Contact link remains a regular `<Link>` since it's an anchor, not a page.

**Checkpoint**: Active nav state works on all pages.

---

## Phase 4: User Story 3 — Writing pages surface related content (Priority: P2)

**Goal**: Each writing page shows 2-3 related posts at the bottom, matched by theme then tags then recency.

**Independent Test**: Visit any writing page — see "Read Next" section after the article with 2-3 related posts. Click one — the new page has its own related posts.

### Implementation for User Story 3

- [x] T010 [P] [US3] Add `getRelatedWritings(currentSlug: string, limit?: number)` function to `src/lib/mdx.ts` — takes the current writing's slug, loads all writings, excludes the current one, scores by: same theme (+3), overlapping tags (+1 each), then sorts by score descending, then by date descending as tiebreaker. Returns top 2-3 results as `Writing[]`. Falls back to most recent posts if no theme/tag matches.
- [x] T011 [P] [US3] Create `src/components/ReadNext.tsx` — server component that accepts a `writings` prop (`Writing[]`). Renders a section with heading "Read Next", containing `WritingCard` components for each related post. If the array is empty, render nothing (return `null`).
- [x] T012 [US3] Update `src/app/writing/[slug]/page.tsx` — call `getRelatedWritings(slug)` at build time, pass results to `ReadNext` component. Place it after the MDX content `<div>`, replacing or supplementing the existing `<ReachOutCTA />`.

**Checkpoint**: Related posts appear on all writing pages.

---

## Phase 5: User Story 4 — Copy or share a writing URL (Priority: P2)

**Goal**: A subtle share/copy-link button on writing pages lets readers copy the URL with one click.

**Independent Test**: Visit a writing page, click the share button — URL is copied to clipboard with "Copied!" confirmation. On mobile with Web Share API, native share sheet appears.

### Implementation for User Story 4

- [x] T013 [P] [US4] Create `src/components/ShareButton.tsx` — `"use client"` component accepting `url` and `title` props. Shows a small link/share icon button. On click: if `navigator.share` is available, use Web Share API with `{ title, url }`; otherwise, copy `url` to clipboard via `navigator.clipboard.writeText()`. Show "Copied!" tooltip/text that fades after 2 seconds using `useState` + `setTimeout`. Style: subtle, gray icon, emerald on hover, matches site design.
- [x] T014 [US4] Add `ShareButton` to `src/app/writing/[slug]/page.tsx` — place it in the article header area near the title, after the metadata row (date, reading time, theme). Pass the full URL (`https://wchen.ai/writing/${slug}`) and the writing title.

**Checkpoint**: Share/copy button works on all writing pages.

---

## Phase 6: User Story 5 — Rich Twitter/X and search engine previews (Priority: P2)

**Goal**: Pages shared on Twitter/X render summary cards. About and writing pages include JSON-LD structured data.

**Independent Test**: Validate root metadata has `twitter` fields. Check about page source for `<script type="application/ld+json">` with Person schema. Check writing pages for Article schema.

### Implementation for User Story 5

- [x] T015 [P] [US5] Add Twitter Card meta tags to root metadata in `src/app/layout.tsx` — add `twitter: { card: "summary_large_image", site: "@wchen_ai", creator: "@wchen_ai" }` to the base `metadata` export. Title, description, and image will be inherited from OpenGraph.
- [x] T016 [P] [US5] Add Twitter Card meta tags to `src/app/writing/[slug]/page.tsx` `generateMetadata` — add `twitter` object with `card: "summary_large_image"`, `title`, and `description` matching the OpenGraph values.
- [x] T017 [P] [US5] Add JSON-LD Person schema to `src/app/about/page.tsx` — render a `<script type="application/ld+json">` in the page body with `@type: "Person"`, `name`, `url`, `jobTitle: "Founder & Builder"`, `sameAs` array from `SOCIAL_LINKS` URLs, and `image` pointing to headshot. Import `SOCIAL_LINKS` and `SITE_URL` from site-config.
- [x] T018 [US5] Add JSON-LD Article schema to `src/app/writing/[slug]/page.tsx` — render a `<script type="application/ld+json">` with `@type: "Article"`, `headline`, `author` (Person with name and url), `datePublished`, `dateModified` (if updatedAt exists), `description` (excerpt), `url`, and `image`.

**Checkpoint**: Rich previews validated via Twitter Card Validator and Google Rich Results Test.

---

## Phase 7: User Story 6 — Reader subscribes to new writing (Priority: P3)

**Goal**: Readers can subscribe via email with double opt-in. Subscription flows through Resend's Contacts API.

**Independent Test**: Enter email in signup form → see "Check your email" message. Click confirmation link in email → redirected to /newsletter-confirmed. Contact appears in Resend segment.

### Implementation for User Story 6

- [x] T019 [P] [US6] Create `shared/newsletter.ts` — define `NewsletterPayloadSchema` with Zod: `email` (string, email validation), `_honey` (string, max length 0). Export type `NewsletterPayload`.
- [x] T020 [P] [US6] Add `NewsletterPayloadSchema` re-export to `src/lib/schemas.ts` — add `export { NewsletterPayloadSchema, type NewsletterPayload } from "../../shared/newsletter";`
- [x] T021 [P] [US6] Create `src/components/NewsletterSignup.tsx` — `"use client"` component with email input, honeypot field (hidden), and subscribe button. Mirrors the pattern in `ContactForm.tsx`: manages idle/loading/success/error states, posts to `/api/newsletter`, shows "Check your email to confirm your subscription" on success, shows inline validation error on failure. Style consistent with site design (emerald accents, same input styles as ContactForm).
- [x] T022 [P] [US6] Create `functions/api/newsletter.ts` — POST handler per `contracts/newsletter-subscribe.md`. Follow the exact pattern from `functions/api/contact.ts` for CORS, validation, and error handling. On valid submission: generate HMAC-SHA256 signature from email + timestamp + NEWSLETTER_SECRET, send confirmation email via Resend `POST https://api.resend.com/emails` with confirmation link, return 200 with neutral message. Env vars: RESEND_API_KEY, RESEND_SEGMENT_ID, NEWSLETTER_SECRET, NEWSLETTER_FROM (optional).
- [x] T023 [P] [US6] Create `functions/api/newsletter-confirm.ts` — GET handler per `contracts/newsletter-confirm.md`. Extract email, ts, sig from query params. Verify timestamp within 24h. Recompute HMAC and compare with timing-safe comparison. On success: call Resend `POST https://api.resend.com/contacts` with `{ email, segments: [RESEND_SEGMENT_ID] }`. Redirect to `/newsletter-confirmed`. On failure: return HTML error page.
- [x] T024 [P] [US6] Create `src/app/newsletter-confirmed/page.tsx` — simple static page with success message ("You're subscribed!"), brief description, and link back to writing. Include metadata title. Style consistent with the 404 page pattern.
- [x] T025 [US6] Add `NewsletterSignup` component to `src/app/writing/page.tsx` — place it before the `<ReachOutCTA />` at the bottom of the writing index page.
- [x] T026 [US6] Add `NewsletterSignup` component to `src/app/writing/[slug]/page.tsx` — place it after the ReadNext section (or after MDX content if ReadNext isn't implemented yet), before any remaining CTA.

**Checkpoint**: Full newsletter flow works end-to-end with double opt-in.

---

## Phase 8: User Story 7 — Table of contents for long articles (Priority: P3)

**Goal**: Writing pages with 3+ headings show an auto-generated TOC near the top that links to each section.

**Independent Test**: Visit a writing page with 3+ headings — TOC appears with clickable links. Click a link — page scrolls to heading with offset for sticky header. Visit a page with <3 headings — no TOC shown.

### Implementation for User Story 7

- [x] T027 [P] [US7] Add `extractHeadings(content: string)` function to `src/lib/mdx.ts` — parse raw MDX content for `##` and `###` headings using regex `^(#{2,3})\s+(.+)$`. Return `TOCItem[]` with `{ id, text, level }` where `id` is the slugified heading text (matching `rehype-slug` output: lowercase, spaces to hyphens, strip special chars). Export the `TOCItem` type.
- [x] T028 [P] [US7] Create `src/components/TableOfContents.tsx` — server component accepting `headings: TOCItem[]` prop. Renders a `<nav>` with an ordered list of anchor links. Level 3 headings indented under level 2. Links use `href="#heading-id"`. Style: subtle border-left, small text, gray colors, emerald on hover. Add `scroll-mt-24` class to the link targets (via the heading IDs set by rehype-slug).
- [x] T029 [US7] Update `src/app/writing/[slug]/page.tsx` — add `rehypePlugins: [rehypeSlug]` to the `MDXRemote` `options` prop. Call `extractHeadings(writing.content)` at build time. If 3+ headings, render `TableOfContents` between the article header and the prose content div.

**Checkpoint**: TOC renders on appropriate pages with working scroll-to-heading navigation.

---

## Phase 9: User Story 8 — Manual dark mode toggle (Priority: P3)

**Goal**: A toggle in the header lets visitors switch between light/dark mode. Preference persists across navigations. System preference remains the default when no explicit choice is made.

**Independent Test**: Click toggle — theme switches instantly. Navigate to another page — theme persists. Clear localStorage — reverts to system preference. No FOUC on page load.

### Implementation for User Story 8

- [x] T030 [US8] Update `src/app/globals.css` — replace `@media (prefers-color-scheme: dark)` CSS variable block with `.dark` class-based selectors. Add `@custom-variant dark (&:where(.dark, .dark *));` for Tailwind v4 class-based dark mode. Keep the existing CSS variables but scope the dark values under `.dark` instead of the media query.
- [x] T031 [US8] Create `src/components/ThemeToggle.tsx` — `"use client"` component. Renders a button with sun/moon icon (inline SVG). On click: reads current theme from `localStorage.getItem("theme")`, cycles to next value (system→dark, dark→light, light→dark), writes to localStorage, and toggles the `dark` class on `document.documentElement`. Icon reflects current effective theme. Use `useEffect` to sync initial state from DOM on mount (to avoid hydration mismatch).
- [x] T032 [US8] Add blocking theme script and toggle to `src/app/layout.tsx` — add an inline `<script dangerouslySetInnerHTML>` in the `<head>` section that runs before first paint: reads `localStorage.getItem("theme")`, falls back to `window.matchMedia("(prefers-color-scheme: dark)").matches`, and adds/removes `dark` class on `<html>`. Add `<ThemeToggle />` to the header, positioned between the nav links and the social icons (or after social icons).

**Checkpoint**: Dark mode toggle works without FOUC. System preference respected when no explicit choice.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, CSP updates, and build verification

- [x] T033 [P] Update `public/_headers` CSP — add `https://api.resend.com` to `connect-src` directive to allow newsletter API calls from Cloudflare Pages Functions
- [x] T034 [P] Verify `src/app/globals.css` has smooth scroll behavior with `scroll-margin-top` for headings targeted by TOC links (accounting for 64px sticky header)
- [x] T035 Run `pnpm typecheck` and fix any TypeScript errors across all new and modified files
- [x] T036 Run `pnpm build` and verify static export succeeds with all new pages, components, and metadata
- [x] T037 Manually verify the full site in dev: check headshot, social links, active nav, read next, share button, dark mode toggle, TOC, newsletter form, and 404 page still works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **User Stories (Phases 2-9)**: All depend on Setup (Phase 1) completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
  - Within each priority tier, stories can run in parallel
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Setup only. No dependencies on other stories.
- **US2 (P1)**: Depends on Setup only. No dependencies on other stories. Can run parallel with US1.
- **US3 (P2)**: Depends on Setup only. No dependencies on other stories.
- **US4 (P2)**: Depends on Setup only. No dependencies on other stories. Can run parallel with US3.
- **US5 (P2)**: Depends on Setup only (uses `site-config.ts`). Can run parallel with US3/US4.
- **US6 (P3)**: Depends on Setup only. No dependencies on other stories.
- **US7 (P3)**: Depends on Setup only (uses `rehype-slug`). Can run parallel with US6.
- **US8 (P3)**: Depends on Setup only. Can run parallel with US6/US7.

### Shared File Awareness

`src/app/layout.tsx` is modified by US1 (T006, T007), US2 (T009), US5 (T015), and US8 (T032). Each modifies distinct sections:
- US1: header social icons div + footer links
- US2: nav Link → NavLink swap
- US5: metadata export twitter fields
- US8: head script + ThemeToggle in header

If implementing sequentially (recommended), no conflicts. If parallel, coordinate on this file.

`src/app/writing/[slug]/page.tsx` is modified by US3 (T012), US4 (T014), US5 (T016, T018), US6 (T026), and US7 (T029). Each modifies distinct sections:
- US3: adds ReadNext after content
- US4: adds ShareButton in header
- US5: adds twitter meta + JSON-LD script
- US6: adds NewsletterSignup after ReadNext
- US7: adds rehype-slug option + TOC before content

### Parallel Opportunities

Within each story phase, tasks marked `[P]` can be launched in parallel:
- US1: T003, T004, T005 all in parallel (different files)
- US5: T015, T016, T017, T018 all in parallel (different files/sections)
- US6: T019, T020, T021, T022, T023, T024 all in parallel (different files)
- US7: T027, T028 in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# These three tasks modify different files and can run in parallel:
Task: "Create SocialIcons.tsx component in src/components/SocialIcons.tsx"
Task: "Add headshot to about page in src/app/about/page.tsx"
Task: "Rewrite Background section in src/app/about/page.tsx"
# Note: T004 and T005 both touch about/page.tsx but modify different sections

# Then sequentially (depend on T003 SocialIcons component):
Task: "Update header with social icons in src/app/layout.tsx"
Task: "Update footer with social links in src/app/layout.tsx"
```

---

## Parallel Example: User Story 6

```bash
# All six tasks modify different files and can run in parallel:
Task: "Create shared/newsletter.ts schema"
Task: "Add re-export to src/lib/schemas.ts"
Task: "Create NewsletterSignup component"
Task: "Create newsletter subscribe endpoint"
Task: "Create newsletter confirm endpoint"
Task: "Create newsletter-confirmed page"

# Then sequentially (depend on NewsletterSignup component):
Task: "Add NewsletterSignup to writing index page"
Task: "Add NewsletterSignup to writing slug page"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: US1 — Credibility signals (headshot, social links, background)
3. Complete Phase 3: US2 — Active nav state
4. **STOP and VALIDATE**: Verify headshot, social links, background narrative, and active nav
5. Deploy if ready — these two stories deliver the highest-value improvements

### Incremental Delivery

1. Setup → US1 + US2 → Deploy (credibility + nav polish)
2. Add US3 + US4 + US5 → Deploy (content engagement + SEO)
3. Add US6 + US7 + US8 → Deploy (newsletter + TOC + dark mode)
4. Each increment adds value without breaking previous stories

### Single Developer (Recommended Order)

P1 stories first, then P2, then P3:
1. Setup → US1 → US2 (P1 complete)
2. US5 → US3 → US4 (P2 complete — US5 first since it's metadata-only, quick win)
3. US8 → US7 → US6 (P3 complete — US8 first since it's self-contained, US6 last since it needs Resend account setup)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- `layout.tsx` and `writing/[slug]/page.tsx` are touched by multiple stories — implement sequentially to avoid merge conflicts
- Commit after each story phase to maintain clean history
- Stop at any checkpoint to validate story independently
- The newsletter (US6) requires a Resend account and environment variables before testing the full flow
