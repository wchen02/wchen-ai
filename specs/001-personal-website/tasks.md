---
description: "Task list for implementing the Personal Website feature"
---

# Tasks: Personal Website

**Input**: Design documents from `/specs/001-personal-website/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure.

- [X] T001 Initialize Next.js (App Router) project with TypeScript, Tailwind CSS, and ESLint in `/src`
- [X] T002 [P] Install core dependencies: `zod`, `next-mdx-remote`, `framer-motion`
- [X] T003 [P] Configure `next.config.mjs` for static export (`output: 'export'`)
- [X] T004 Create core directory structure (`/content/projects`, `/content/writing`, `/functions/api`, `/scripts`) per plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 [P] Create Zod schemas for `Project` and `Writing` entities in `src/lib/schemas.ts` per data-model.md
- [X] T006 Implement local MDX file reading and validation utility in `src/lib/mdx.ts` (using `fs` and Zod)
- [X] T007 [P] Create GitHub GraphQL fetch script in `scripts/fetch-github-data.ts` to output `public/github-contributions.json`
- [X] T008 Update `package.json` build script to run the GitHub fetch script before `next build`
- [X] T009 Set up GitHub Actions CI workflow in `.github/workflows/ci.yml` (typecheck, lint, fetch data, build, deploy to Cloudflare Pages)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - 15-Second Homepage Overview (Priority: P1) 🎯 MVP

**Goal**: Establish Wilson primarily as a founder and secondarily as a builder by prioritizing "what I'm exploring now", past work, and contact info in a scannable format.

**Independent Test**: The homepage renders statically, displays validated GitHub contribution data, lazy-loads Framer Motion animations, and clearly emphasizes the founder persona above all else.

### Implementation for User Story 1

- [X] T010 [P] [US1] Create a mock `public/github-contributions.json` for local development
- [X] T011 [P] [US1] Build lazy-loaded `HeroMotion` wrapper component in `src/components/HeroMotion.tsx` using `framer-motion`
- [X] T012 [P] [US1] Build `GitHubGraph` UI component in `src/components/GitHubGraph.tsx` to display cached contribution data
- [X] T013 [US1] Implement the homepage layout in `src/app/page.tsx` integrating `HeroMotion` and `GitHubGraph`
- [X] T014 [US1] Refine homepage typography and layout in `src/app/page.tsx` to explicitly prioritize "what I'm exploring now" over past builds

**Checkpoint**: At this point, the homepage should be fully functional, static, and pass Lighthouse performance targets independently.

---

## Phase 4: User Story 2 - Low-Barrier Contact (Priority: P1)

**Goal**: Provide a highly accessible way for visitors to reach out for collaboration, backed by a secure edge API.

**Independent Test**: A user can submit the form on the UI; bots triggering the honeypot are rejected by the Cloudflare Pages Function; valid payloads are forwarded to the configured webhook.

### Implementation for User Story 2

- [X] T015 [P] [US2] Create Zod schema for `ContactPayload` in `src/lib/schemas.ts` per `api-contact.md` contract
- [X] T016 [P] [US2] Implement the Cloudflare Pages Function in `functions/api/contact.ts` with honeypot and rate-limiting
- [X] T017 [P] [US2] Build `ContactForm` React component in `src/components/ContactForm.tsx` (using semantic HTML and the honeypot field)
- [X] T018 [US2] Integrate `ContactForm` component into the homepage (`src/app/page.tsx`)
- [X] T019 [US2] Add subtle "reach out" call-to-action components for placement at the bottom of dedicated project/writing pages

**Checkpoint**: The contact API and form should now work locally via Wrangler, successfully blocking bots and accepting valid submissions.

---

## Phase 5: User Story 3 - Exploring Project Stories (Priority: P2)

**Goal**: Provide a structured way to explore projects, focusing on narratives (motivation, problem, learnings) rather than just feature lists.

**Independent Test**: Navigating to `/projects` lists all projects; clicking a project navigates to `/projects/[slug]` which renders the MDX content and narrative frontmatter statically.

### Implementation for User Story 3

- [X] T020 [P] [US3] Add 2-3 sample project MDX files in `/content/projects/` to test rendering
- [X] T021 [P] [US3] Build `ProjectCard` UI component in `src/components/ProjectCard.tsx`
- [X] T022 [US3] Implement the Projects index page in `src/app/projects/page.tsx` (fetching and listing all validated projects)
- [X] T023 [US3] Implement the dynamic Project detail page in `src/app/projects/[slug]/page.tsx` using `next-mdx-remote` and `generateStaticParams`
- [X] T024 [US3] Integrate the subtle "reach out" CTA (from T019) at the bottom of `src/app/projects/[slug]/page.tsx`

**Checkpoint**: The Projects section is now fully static, rendering narrative-driven MDX files without runtime server logic.

---

## Phase 6: User Story 4 - Browsing Ongoing Thinking (Priority: P2)

**Goal**: Publish written ideas over time so the site becomes a living record of evolving thoughts.

**Independent Test**: Navigating to `/writing` lists ideas grouped by themes; clicking an idea navigates to `/writing/[slug]` and displays the static 200-1500 word MDX content.

### Implementation for User Story 4

- [X] T025 [P] [US4] Add 2-3 sample writing MDX files in `/content/writing/` to test rendering
- [X] T026 [P] [US4] Build `WritingCard` UI component in `src/components/WritingCard.tsx`
- [X] T027 [US4] Implement the Writing index page in `src/app/writing/page.tsx` (fetching, sorting by date, and grouping by theme)
- [X] T028 [US4] Implement the dynamic Writing detail page in `src/app/writing/[slug]/page.tsx` using `next-mdx-remote` and `generateStaticParams`
- [X] T029 [US4] Integrate the subtle "reach out" CTA (from T019) at the bottom of `src/app/writing/[slug]/page.tsx`

**Checkpoint**: The Writing section is now fully static, highlighting recent reflections and overarching themes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, ensuring adherence to the constitution (e.g., performance, static constraints).

- [X] T030 [P] Implement a global navigation header and footer in `src/app/layout.tsx` to link all sections
- [X] T030.5 [P] Conduct a UI/copywriting pass to ensure the 15-second homepage metric (clarity of founder role, current explorations, and contact info) is met
- [X] T031 Run a local Lighthouse performance audit to ensure scores > 90 and verify initial JS payload sizes (< 100KB)
- [X] T032 Verify "no-JS degradation" by disabling JavaScript in the browser and confirming core content readability
- [X] T033 Add SEO metadata (Title, Description, OpenGraph) to `src/app/layout.tsx` and dynamic pages
- [X] T034 Run local test build (`pnpm build`) to ensure all MDX schemas validate and `output: export` succeeds without errors
- [X] T035 [US4] Implement an RSS feed generator in `scripts/generate-rss.ts` (run pre-build) to allow users to follow ongoing writing

---

## Phase 8: Gap Fixes & Quality Hardening

**Purpose**: Address gaps identified during spec-vs-codebase review. Ensures data model contracts are honored, E2E coverage exists, and developer onboarding is smooth.

- [X] T036 Fix `readingTimeMinutes` fallback bug (`|| 100` → `|| 1`) in `src/lib/mdx.ts`
- [X] T037 Remove stray `roundedForm` CSS class typo from `src/app/page.tsx`
- [X] T038 Fix responsive padding typo (`md-24` → `md:py-24`) in `src/app/projects/[slug]/page.tsx`
- [X] T039 Prioritize `featured` items on homepage before date-sorting for projects and writings in `src/app/page.tsx`
- [X] T040 Visually highlight featured writings in `src/components/WritingCard.tsx` and sort featured-first within theme groups on `src/app/writing/page.tsx`
- [X] T041 Create `.env.example` with documented environment variables and exclude from `.gitignore`
- [X] T042 Add SVG favicon to `/public/favicon.svg` and reference in layout metadata
- [X] T043 Set up Playwright E2E test infrastructure: config, `e2e/smoke.spec.ts` (16 tests covering homepage, projects, writing, 404, no-JS degradation, SEO)
- [X] T044 Add `test:e2e` script to `package.json` and integrate Playwright into CI pipeline (`.github/workflows/ci.yml`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion. They can proceed in parallel or sequentially.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities

- **Phase 1**: Dependency installation (T002) and Next.js config (T003) can be done while setting up folders.
- **Phase 2**: Zod schemas (T005) and GitHub script (T007) are completely independent and can be built in parallel.
- **Phase 3-6**: Once Phase 2 is done, the Contact API (T016), Homepage UI (T011, T012), and MDX mock data (T020, T025) can all be built simultaneously by different agents/developers.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 - Homepage).
3. **STOP and VALIDATE**: Ensure the homepage builds statically and looks correct. This is the minimum viable identity hub.

### Incremental Delivery

1. Deliver the MVP (Homepage).
2. Complete Phase 4 (Contact API). The site can now receive collaboration requests.
3. Complete Phase 5 (Projects). The site now has depth regarding past work.
4. Complete Phase 6 (Writing). The site is now a full "thinking hub."
5. Complete Phase 7 (Polish) before the final production launch on Cloudflare Pages.