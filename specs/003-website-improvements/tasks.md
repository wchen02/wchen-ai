# Tasks: Website Improvements (Multi-Perspective)

**Input**: Design documents from `specs/003-website-improvements/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in the spec; automation tasks (US8) implement a11y and metadata validation as part of the feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US8)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js app: `src/app/`, `src/components/`, `src/lib/` at repository root
- Content: `content/writing/`, `content/projects/`
- Scripts: `scripts/` at repository root

---

## Phase 1: Setup

**Purpose**: Feature context and shared config used by multiple stories

- [ ] T001 Add metadata defaults module with siteName, defaultOgImageUrl, locale, canonicalBaseUrl in src/lib/metadata-defaults.ts (or extend src/lib/site-config.ts)
- [ ] T002 [P] Add theme descriptor config (map theme key to short description) in src/lib/theme-config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Single source of truth for metadata and themes; required before US1, US4, US8

**Checkpoint**: After this phase, all user stories can consume metadata defaults and theme config

- [ ] T003 Wire layout and page metadata to use metadata defaults (canonical base URL, locale, default OG image) from src/lib/metadata-defaults.ts in src/app/layout.tsx and relevant page metadata exports
- [ ] T004 Add optional ogImage field to WritingSchema in src/lib/schemas.ts for article-specific preview images

---

## Phase 3: User Story 1 - First-time visitor grasps who I am and why it matters (Priority: P1) — MVP

**Goal**: One concrete credibility signal in hero, clear section headings/summaries on homepage, About as single hub (headshot, background, social), theme descriptors on writing index.

**Independent Test**: Visit homepage and About; confirm one credibility signal in hero, each section has heading + brief summary, About has headshot/background/social; writing index shows theme descriptors.

- [ ] T005 [P] [US1] Add at least one concrete credibility signal (e.g. previous role, thing built, current initiative) to hero in src/app/page.tsx
- [ ] T006 [US1] Add clear heading and brief summary or subheading for each major homepage section (Current Focus, Selected Work, Recent Writing, GitHub, Contact) in src/app/page.tsx
- [ ] T007 [US1] Ensure About page is the single place for headshot, companies/roles/timelines, and social links; ensure homepage links to About with “more about me” in src/app/about/page.tsx and src/app/page.tsx
- [ ] T008 [US1] Use theme config to render short descriptors for each theme on the writing index in src/app/writing/page.tsx
- [ ] T009 [US1] Add build or lint check that warns when a writing theme has no descriptor in src/lib/theme-config.ts (optional script or in existing validation)

**Checkpoint**: User Story 1 independently testable — 15-second scan, one credibility signal, About hub, theme descriptors visible

---

## Phase 4: User Story 2 - All visitors can use forms and controls with assistive tech (Priority: P1)

**Goal**: Newsletter and contact forms have labels and live regions; header tab order and focus-visible; theme toggle exposes current state to assistive tech.

**Independent Test**: Use screen reader and keyboard; complete newsletter and contact flows; tab through header; confirm labels, announcements, focus order, and theme toggle state.

- [ ] T010 [US2] Add associated label or accessible name for newsletter email field and wrap success/error messages in a live region (aria-live) in src/components/NewsletterSignup.tsx
- [ ] T011 [US2] Add associated labels or accessible names for contact form required fields and announce errors/success via live region in src/components/ContactForm.tsx
- [ ] T012 [US2] Ensure header tab order is logo, nav, social, theme toggle and add visible focus indicator (e.g. focus-visible:ring) for all interactive elements in src/app/layout.tsx
- [ ] T013 [US2] Expose theme toggle current state (dark or light) to assistive tech via aria-pressed or aria-label including mode in src/components/ThemeToggle.tsx

**Checkpoint**: User Story 2 independently testable — forms and header fully usable with keyboard and screen reader

---

## Phase 5: User Story 3 - Visitors find relevant projects (Priority: P2)

**Goal**: Filter or group projects by at least one dimension (type or status); clear selection state; empty state and way to clear when zero results. When only one project exists, filter/group UI may be hidden or show only “All”.

**Independent Test**: Visit projects page; filter/group by type or status; confirm list updates and selection is clear; clear filter and see all projects in consistent order; zero results shows empty state and clear option. With one project, default view shows that project without redundant filter.

- [ ] T014 [P] [US3] Add client component for project filter or group UI (by type or status from frontmatter) in src/app/projects/page.tsx or new src/components/ProjectsFilter.tsx; when only one project exists, hide or simplify filter per FR-009
- [ ] T015 [US3] Implement filter/group logic and pass filtered or grouped list to project cards; show “All” / clear state in src/app/projects/page.tsx
- [ ] T016 [US3] Add empty state (e.g. “No projects match”) and visible way to clear filter when zero results in src/app/projects/page.tsx (or ProjectsFilter component)

**Checkpoint**: User Story 3 independently testable — projects page supports filter/group and empty state

---

## Phase 6: User Story 4 - Rich previews and on-site search (Priority: P2)

**Goal**: Correct title/description/image for shared pages; canonical and locale consistent; optional article ogImage; on-site search by title/theme/tags with static index.

**Independent Test**: Share About and one writing; validate previews; run metadata validator; use on-site search to find a writing by title or theme; confirm canonical and locale on page types.

- [ ] T017 [US4] Add canonical link (no trailing slash) and og:locale to all page metadata using metadata defaults in src/app/layout.tsx and per-route metadata/generateMetadata
- [ ] T018 [US4] Use article ogImage when present in writing frontmatter for og:image and twitter:image in src/app/writing/[slug]/page.tsx generateMetadata
- [ ] T019 [P] [US4] Add scripts/generate-search-index.ts that outputs public/search-index.json (slug, title, theme, tags) from getWritings() with Zod schema validation
- [ ] T020 [US4] Add search index generation to prebuild in package.json (e.g. after generate-sitemap) when on-site search is implemented (T019 + T021)
- [ ] T021 [US4] Add search UI (input + client-side filter over static index) on writing index or layout; show “no results” message and optional “browse by theme” in src/app/writing/page.tsx or new SearchWriting component
- [ ] T022 [US4] Ensure writing index and projects index have correct metadata (title, description, default or section image) per contracts/page-metadata in src/app/writing/page.tsx and src/app/projects/page.tsx

**Checkpoint**: User Story 4 independently testable — rich previews, canonical/locale, optional search working

---

## Phase 7: User Story 5 - Site stays fast and stable (Priority: P2)

**Goal**: Explicit LCP/CLS targets; image optimization when host supports; no noticeable layout shift from fonts/hero; reduced-motion respected.

**Independent Test**: Measure LCP and CLS on critical routes; confirm font/hero do not cause layout shift; verify reduced-motion disables or simplifies motion.

- [ ] T023 [US5] Document or add constants for LCP (e.g. ≤2.5s) and CLS (e.g. ≤0.1) targets for critical routes (e.g. in specs/003-website-improvements/plan.md or src/lib/constants.ts)
- [ ] T024 [US5] Ensure hero and above-the-fold content have dimensions or font fallback to avoid layout shift in src/app/globals.css and hero component (e.g. src/components/HeroMotionClient.tsx or HeroMotion)
- [ ] T025 [US5] Confirm reduced-motion preference is respected for motion (hero, section reveal) via existing prefers-reduced-motion handling in src/app/globals.css and motion components
- [ ] T026 [US5] If host supports image optimization (e.g. Cloudflare Image Resizing), wire default and article images to use it; otherwise leave images unoptimized per research in next.config.ts or metadata URLs

**Checkpoint**: User Story 5 independently testable — performance targets documented; layout shift and motion handled

---

## Phase 8: User Story 6 - Readers can subscribe and reach out (Priority: P2)

**Goal**: Newsletter signup visible above the fold on writing index with expectation-setting copy; RSS link near CTA; contact prominent with clear next step.

**Independent Test**: Open writing index; see newsletter without scrolling and RSS near CTA; follow Contact to prominent section or page with clear next step.

- [ ] T027 [US6] Make newsletter signup visible without scrolling on writing index (e.g. compact strip or sidebar near top) in src/app/writing/page.tsx
- [ ] T028 [US6] Add copy that sets expectations (e.g. frequency or “no spam”) to NewsletterSignup in src/components/NewsletterSignup.tsx
- [ ] T029 [US6] Add “Subscribe via RSS” (or equivalent) link near newsletter CTA on writing index and in footer in src/app/writing/page.tsx and src/app/layout.tsx
- [ ] T030 [US6] Ensure Contact link leads to prominent contact section or page with clear next step (email or form) in src/app/page.tsx and nav

**Checkpoint**: User Story 6 independently testable — newsletter, RSS, and contact discoverable and clear

---

## Phase 9: User Story 7 - Read Next and share feedback (Priority: P2)

**Goal**: Read Next section (2–3 items) when related posts exist, hidden when none; share/copy control with confirmation that dismisses or times out.

**Independent Test**: Open a writing with related posts — see Read Next; open writing with no related — section hidden; use share/copy and see “Copied!” (or equivalent) that dismisses.

- [ ] T031 [US7] Ensure Read Next shows 2–3 related items and is hidden when no related posts in src/app/writing/[slug]/page.tsx
- [ ] T032 [US7] Ensure share/copy control exists on writing pages and shows brief visual confirmation (e.g. “Copied!”) that dismisses or times out (e.g. within 5s) in src/components/ShareButton.tsx
- [ ] T033 [US7] Ensure Web Share API unavailability falls back to copy-to-clipboard with same confirmation in src/components/ShareButton.tsx

**Checkpoint**: User Story 7 independently testable — Read Next and share with feedback working

---

## Phase 10: User Story 8 - Quality automation and single source (Priority: P3)

**Goal**: Automated a11y and metadata validation on critical routes; metadata from single source; build-time link validation fails or warns on broken links.

**Independent Test**: Run CI; trigger a11y and metadata checks on critical routes; add new page using centralized defaults; break an internal link and run build to see failure or warning.

- [ ] T034 [US8] Add Playwright a11y check (e.g. axe-core) for critical routes (home, about, writing index, one writing, projects index) in tests/ or e2e
- [ ] T035 [US8] Add scripts/validate-metadata.ts (or equivalent) that validates required meta and JSON-LD on critical routes (run after build or in CI)
- [ ] T036 [US8] Ensure all page metadata imports default values from src/lib/metadata-defaults.ts (or site-config); remove duplicated default OG image and site name from layout and pages
- [ ] T037 [US8] Extend or confirm scripts/validate-links.ts validates internal writing/project slugs and fails build or emits clear warning on broken links
- [ ] T038 [US8] Wire a11y and metadata validation into CI (e.g. in package.json scripts or GitHub Actions) so failures are reported clearly

**Checkpoint**: User Story 8 independently testable — automation runs; single source used; link validation blocks or warns

---

## Phase 11: Polish & Cross-Cutting

**Purpose**: Final consistency and validation

- [ ] T039 [P] Update quickstart or README if new scripts or config locations were added in specs/003-website-improvements/quickstart.md
- [ ] T040 Run full build and typecheck; fix any regressions (pnpm build, pnpm typecheck)
- [ ] T041 Run quickstart validation: dev, build, and manual pass of critical routes per quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — create metadata and theme config modules.
- **Phase 2 (Foundational)**: Depends on Phase 1 — wire metadata and optional ogImage schema.
- **Phases 3–10 (User Stories)**: Depend on Phase 2. US1–US8 can be implemented in priority order (P1 then P2 then P3) or, where independent, in parallel.
- **Phase 11 (Polish)**: Depends on completed user story phases.

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — uses theme config and metadata defaults.
- **US2 (P1)**: After Phase 2 — no dependency on US1.
- **US3 (P2)**: After Phase 2 — no dependency on US1/US2.
- **US4 (P2)**: After Phase 2 — uses metadata defaults, optional search index.
- **US5 (P2)**: After Phase 2 — can run in parallel with US3, US4, US6, US7.
- **US6 (P2)**: After Phase 2 — touches writing index and layout.
- **US7 (P2)**: After Phase 2 — touches writing [slug] page and ShareButton.
- **US8 (P3)**: After Phase 2 — validates what US1–US7 produce; benefits from centralized metadata (Phase 2).

### Parallel Opportunities

- T001 and T002 can run in parallel (different files).
- Within US1: T005 can run in parallel with T008 after T003–T004.
- Within US4: T019 (search index script) can run in parallel with T017, T018.
- US3, US5, US6, US7 can be implemented in parallel by different developers after Phase 2.
- T039 (docs) can run in parallel with T040–T041.

---

## Parallel Example: User Story 1

```text
# After Phase 2 complete:
T005: Add credibility signal in src/app/page.tsx
T008: Use theme config on writing index in src/app/writing/page.tsx
# Then:
T006, T007: Section summaries and About link in page.tsx and about/page.tsx
T009: Optional theme warning in build/lint
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) and Phase 4 (US2).
3. Validate: 15-second scan, credibility signal, About hub, theme descriptors; then forms/header/toggle with assistive tech.
4. Deploy or demo.

### Incremental Delivery

1. Phase 1–2 → foundation.
2. US1 (P1) → test independently → ship.
3. US2 (P1) → test independently → ship.
4. US3–US7 (P2) in any order → each testable independently.
5. US8 (P3) → automation and link validation last.

### Parallel Team Strategy

- After Phase 2: Developer A — US1; Developer B — US2; Developer C — US3 or US4.
- US4 (search) and US5 (performance) can overlap with US3, US6, US7.

---

## Notes

- [P] = safe to run in parallel (different files or no shared state).
- [USn] = task belongs to that user story for traceability.
- Each user story phase is independently testable per spec Independent Test.
- Commit after each task or logical group; stop at checkpoints to validate.
- Paths assume repo root is wchen.ai (Next.js app under src/, content/, scripts/).
