# Feature Specification: Website Improvements (Multi-Perspective)

**Feature Branch**: `003-website-improvements`  
**Created**: 2026-02-28  
**Status**: Draft  
**Input**: Multi-perspective analysis of what would make wchen.ai better: visitor experience, accessibility, SEO, performance, content strategy, conversion, and maintainability. Builds on existing persona work (spec 002).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-time visitor grasps who I am and why it matters (Priority: P1)

A potential collaborator, investor, or peer lands on the site and needs to decide within seconds whether to keep reading. They look for one concrete credibility signal above the fold, clear section structure they can scan, and one place (About) that delivers the full background.

**Why this priority**: The homepage is the main credibility moment. Without a quick, scannable narrative and a single credibility hub, high-value visitors leave before engaging.

**Independent Test**: Can be fully tested by visiting the homepage and About page: confirm one concrete proof point or outcome in the hero, short subheadings or one-line summaries per homepage section, and About page as the single place for headshot, background (companies, roles, timelines), and social links.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the homepage, **When** they read the hero area, **Then** they see at least one concrete credibility signal (e.g. previous role, thing built, or current initiative by name).
2. **Given** a visitor scans the homepage, **When** they look at each major section, **Then** each section has a clear heading and a brief summary or subheading so the 15-second scan is achievable.
3. **Given** a visitor wants full background, **When** they go to the About page, **Then** they find headshot, companies/roles/timelines, and social links in one place; the homepage summarizes and links to About.
4. **Given** content uses themes, **When** a visitor browses the writing index, **Then** each theme has a short descriptor so the site’s topical map is clear.

---

### User Story 2 - All visitors can use forms and controls with assistive tech (Priority: P1)

A visitor using a screen reader or keyboard needs to complete the newsletter signup and contact form, operate the theme toggle, and understand success and error feedback. All interactive elements must have visible focus and expose their purpose and state.

**Why this priority**: Forms and controls that fail for assistive tech exclude users and can create compliance risk. Fixing labels, live regions, focus, and toggle state is foundational.

**Independent Test**: Can be fully tested with a screen reader and keyboard: complete newsletter and contact flows, toggle theme, and confirm that labels exist, success/error messages are announced, focus order matches visual order, and the theme control exposes current mode.

**Acceptance Scenarios**:

1. **Given** a visitor uses a screen reader, **When** they focus the newsletter email field, **Then** the field has an associated label or accessible name and validation/success messages are announced via a live region.
2. **Given** a visitor uses a screen reader, **When** they focus the contact form, **Then** each required field has an associated label and any errors or success are announced.
3. **Given** a visitor navigates by keyboard, **When** they tab through the header, **Then** tab order matches visual order (logo, nav, social, theme toggle) and every interactive element has a visible focus indicator.
4. **Given** a visitor uses assistive tech, **When** they focus the theme toggle, **Then** the control exposes current state (e.g. dark or light) so the user knows the active mode without seeing the screen.

---

### User Story 3 - Visitors find relevant projects as the list grows (Priority: P2)

A visitor browsing projects wants to narrow or group the list by type, status, or category so they can find the kind of work that interests them instead of scrolling a single long list.

**Why this priority**: Content discoverability scales with the number of projects; a flat list becomes hard to use. Filtering or grouping keeps the projects page useful.

**Independent Test**: Can be tested by visiting the projects page and confirming that visitors can filter or group projects (e.g. by type or status) and that the default view is still sensible when no filter is applied.

**Acceptance Scenarios**:

1. **Given** the site has multiple projects, **When** a visitor is on the projects page, **Then** they can filter or group projects by at least one dimension (e.g. type or status).
2. **Given** a visitor applies a filter or selects a group, **When** the list updates, **Then** only matching projects are shown and the selection is clear.
3. **Given** a visitor clears the filter or views “all”, **When** the list updates, **Then** all projects are shown in a consistent order.

---

### User Story 4 - Shared and searched content appears with rich previews and is discoverable (Priority: P2)

When a page is shared on social platforms or found via search, the preview should be rich and consistent. Visitors who want to find a specific piece of writing should be able to search within the site. Canonical URLs and locale should be defined so indexing and sharing are consistent.

**Why this priority**: Rich previews and on-site search increase click-through and return visits; canonical and locale reduce duplicate-content issues and help crawlers.

**Independent Test**: Can be tested by sharing key pages and checking previews, running a validator for metadata and structured data, and using on-site search to find writings by title, theme, or topic.

**Acceptance Scenarios**:

1. **Given** a visitor shares a writing or the About page, **When** the link is unfurled, **Then** the preview shows the correct title, description, and image (default or article-specific when available).
2. **Given** the site is indexed, **When** crawlers or validators check metadata, **Then** canonical URL form and locale (or language) are consistent across page types.
3. **Given** a visitor wants to find a specific piece of writing, **When** they use on-site search, **Then** they can search by title, theme, or tags and get relevant results.
4. **Given** a writing has an article-specific preview image, **When** that writing is shared, **Then** the shared preview uses that image when available; otherwise a default image is used.

---

### User Story 5 - Site stays fast and stable for all users (Priority: P2)

Visitors should experience fast load and minimal layout shift. The site must meet explicit performance targets (e.g. largest contentful paint and layout stability), and images should be delivered in an optimized way when the hosting environment supports it. Fonts and above-the-fold content must not cause noticeable layout shift.

**Why this priority**: Performance and stability directly affect bounce and engagement; measurable targets and optimization prevent regressions.

**Independent Test**: Can be tested by measuring core web vitals (or equivalent) on critical routes and confirming that images are optimized when the host supports it and that font/hero content does not cause meaningful layout shift.

**Acceptance Scenarios**:

1. **Given** a visitor loads the homepage or a writing page, **When** the page finishes loading, **Then** measured largest contentful paint and layout stability meet defined targets (e.g. within 2.5s and below 0.1 shift threshold where applicable).
2. **Given** the hosting environment supports image optimization, **When** images are served, **Then** they are optimized for the requesting device to improve load time and data use.
3. **Given** a visitor loads any page, **When** fonts and above-the-fold content render, **Then** there is no noticeable layout shift from webfont or hero content; reduced-motion preference is respected where motion is used.

---

### User Story 6 - Readers can subscribe and reach out easily (Priority: P2)

A reader who wants to follow updates or get in touch should see clear options: newsletter signup and RSS where content is consumed, and a prominent contact path (form or email) with clear next steps.

**Why this priority**: Subscription and contact are primary conversion goals; visibility and clear copy directly affect signup and inbound interest.

**Independent Test**: Can be tested by visiting the writing index and a writing page to confirm newsletter CTA placement and copy, RSS visibility near the CTA, and by confirming the contact section or page is prominent with a clear next step.

**Acceptance Scenarios**:

1. **Given** a visitor is on the writing index, **When** they view the initial screen, **Then** the newsletter signup is visible without scrolling (e.g. compact strip or sidebar) and the copy sets expectations (e.g. frequency or “no spam”).
2. **Given** a visitor prefers feeds over email, **When** they are on the writing index or footer, **Then** they see a “Subscribe via RSS” (or equivalent) option near the newsletter CTA.
3. **Given** a visitor wants to get in touch, **When** they follow the Contact link, **Then** they reach a prominent contact section or page with a clear next step (e.g. email address or form); if it’s a section on the homepage, it is easy to find.

---

### User Story 7 - Readers discover more and can share with clear feedback (Priority: P2)

After reading a piece of writing, a reader should see related posts (“Read Next”) and a way to share or copy the link, with obvious confirmation when the link is copied.

**Why this priority**: Discoverability and sharing drive engagement and distribution; clear feedback reduces confusion.

**Independent Test**: Can be tested by visiting writing pages and confirming “Read Next” (with fallback when no related posts), presence of a share/copy control, and visible “Copied!” (or equivalent) feedback that dismisses or times out.

**Acceptance Scenarios**:

1. **Given** a writing has related posts, **When** the reader scrolls past the article, **Then** they see a “Read Next” section with 2–3 related items; when there are no related posts, the section is hidden.
2. **Given** a reader is on a writing page, **When** they use the share or copy-link control, **Then** the URL is copied or the native share sheet is shown, and brief visual confirmation (e.g. “Copied!”) appears and then dismisses or times out.
3. **Given** the device does not support the native share API, **When** the reader uses the share control, **Then** the copy-to-clipboard path still works and shows the same confirmation.

---

### User Story 8 - Quality stays consistent as content grows (Priority: P3)

As writings and projects are added, accessibility and SEO quality must not regress. Required metadata and structured data should be validated automatically where possible, and shared defaults (e.g. site name, default images) should come from one place. Internal links should be validated at build time so broken links are caught early.

**Why this priority**: Manual checks do not scale; automation and a single source of truth keep quality consistent and reduce errors when adding pages or content.

**Independent Test**: Can be tested by running automated checks (e.g. accessibility and metadata validation on critical routes) and by confirming that adding a new page type or content uses centralized defaults and that internal link checks run at build time.

**Acceptance Scenarios**:

1. **Given** a change is made to the site, **When** automated checks run (e.g. in CI or pre-commit), **Then** critical routes pass accessibility and required meta/structured-data validation, with failures reported clearly.
2. **Given** a new page or content type is added, **When** metadata is set, **Then** default values (site name, default preview image) come from a single source so they stay consistent.
3. **Given** content or links are updated, **When** the site is built, **Then** internal links (e.g. writing or project slugs) are validated and broken links cause a build failure or clear warning.

---

### Edge Cases

- What happens when a writing has no related posts? The “Read Next” section is hidden; no empty section is shown.
- What happens when the theme toggle is used and the user has no stored preference? System preference (e.g. prefers-color-scheme) is used on first load without a visible flash.
- What happens when newsletter signup fails (e.g. server or rate limit)? The user sees a user-friendly error message and can retry; no sensitive detail is revealed.
- What happens when a project filter returns zero results? The UI shows an empty state (e.g. “No projects match”) and a way to clear the filter.
- What happens when on-site search returns no results? The user sees a clear “no results” message and optional suggestions (e.g. clear query or browse by theme).
- What happens when image optimization is not available from the host? Images are still served in a usable form; performance targets are met where possible with unoptimized assets.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage hero MUST display at least one concrete credibility signal (e.g. previous role, thing built, or current initiative by name).
- **FR-002**: Each major homepage section MUST have a clear heading and a brief summary or subheading (e.g. one line or short phrase) to support a 15-second scan.
- **FR-003**: The About page MUST be the single place for headshot, background (companies, roles, timelines), and social links; the homepage MUST link to it for “more about me.”
- **FR-004**: Each writing theme used on the site MUST have a short descriptor available for the writing index (and related content) so the topical map is clear.
- **FR-005**: The newsletter email field MUST have an associated label or accessible name; success and error messages MUST be announced to assistive tech (e.g. via a live region).
- **FR-006**: The contact form MUST have associated labels or accessible names for required fields; success and error messages MUST be announced to assistive tech.
- **FR-007**: Tab order in the header MUST match visual order (logo, nav, social, theme toggle); every interactive element MUST have a visible focus indicator.
- **FR-008**: The theme toggle MUST expose current state (dark or light) to assistive tech (e.g. via attribute or label).
- **FR-009**: The projects page MUST allow visitors to filter or group projects by at least one dimension (e.g. type or status) when multiple projects exist.
- **FR-010**: Shared pages MUST show correct title, description, and image in previews; article-specific preview images MUST be used when provided, otherwise a default.
- **FR-011**: The site MUST declare a consistent canonical URL form and locale (or language) for metadata across page types.
- **FR-012**: The site MUST provide on-site search over writings (e.g. by title, theme, or tags) returning relevant results. Relevant results are those matching the query as substring or exact match on title, theme, or tags; ordering may be by relevance or recency.
- **FR-013**: The site MUST meet defined performance targets for largest contentful paint and layout stability on critical routes; when the host supports image optimization, images MUST be optimized for the requesting context.
- **FR-014**: Font and above-the-fold content MUST not cause noticeable layout shift (layout stability threshold is defined in the implementation plan, e.g. CLS ≤ 0.1); reduced-motion preference MUST be respected for motion.
- **FR-015**: The newsletter signup MUST be visible without scrolling on the writing index and MUST use copy that sets expectations (e.g. frequency or “no spam”).
- **FR-016**: “Subscribe via RSS” (or equivalent) MUST be visible near the newsletter CTA on the writing index or in the footer.
- **FR-017**: The Contact destination MUST be prominent (e.g. reachable from main navigation and, if on the homepage, within the initial scroll) and MUST offer a clear next step (e.g. email or form).
- **FR-018**: Each writing page MUST show a “Read Next” section when related posts exist (2–3 items) and MUST hide it when none exist; each writing page MUST offer a share or copy-link control with visible confirmation that dismisses or times out.
- **FR-019**: Automated checks MUST run for critical routes to validate accessibility and required metadata/structured data; failures MUST be reported.
- **FR-020**: Default metadata (site name, default preview image) MUST be defined in a single source and reused across page types.
- **FR-021**: Internal links (e.g. to writings or projects) MUST be validated at build time; broken links MUST cause a build failure or clear warning.

### Key Entities

- **Credibility signal**: A short, concrete fact shown in the hero (e.g. “Previously at X,” “Built Y,” “Working on Z”).
- **Theme descriptor**: A short text describing a writing theme, used on the index and for related content.
- **Preview image**: Default image for generic pages; optional per-article image for writings used in social and search previews.
- **Performance target**: Defined thresholds for largest contentful paint and layout stability, measurable on critical routes.
- **Metadata defaults**: Site name, default preview image URL, and optionally locale, stored once and reused.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can complete a 15-second scan of the homepage and identify who the site is for and one concrete credibility signal.
- **SC-002**: A screen reader user can complete newsletter signup and contact form and understand all success and error messages without sighted help.
- **SC-003**: A keyboard-only user can reach and operate all header controls (logo, nav, social, theme) with visible focus and correct tab order.
- **SC-004**: Shared links to the About page and at least one writing show the correct title, description, and image in a standard preview validator.
- **SC-005**: A visitor can find a specific piece of writing using on-site search by title or theme in under three actions.
- **SC-006**: Critical routes meet defined largest contentful paint and layout stability targets in production (or in a representative test environment).
- **SC-007**: Newsletter signup is visible above the fold on the writing index and RSS is discoverable near the CTA; contact path is reachable from the main navigation and has a clear next step.
- **SC-008**: On every writing page with related content, “Read Next” shows 2–3 items; share/copy control shows confirmation that dismisses within 5 seconds or on user action.
- **SC-009**: A build or CI run fails or warns when required accessibility or metadata checks fail on critical routes, or when internal link validation finds broken links.

## Assumptions

- Spec 002 (site persona improvements) is implemented or in progress; this spec extends it with additional perspectives rather than replacing it.
- The hosting environment for the site may or may not support image optimization; FR-013 and success criteria allow for “when the host supports it.”
- “Critical routes” for performance and automation include at least the homepage, About, writing index, one writing page, and projects index.
- Writing and project content already use frontmatter that can support theme descriptors, types, and status for filtering/grouping and search.
- Automated checks may run in CI or as a pre-commit step; the exact trigger is an implementation choice.
