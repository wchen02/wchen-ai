# Feature Specification: Site Persona Improvements

**Feature Branch**: `002-site-persona-improvements`  
**Created**: 2026-02-27  
**Status**: Draft  
**Input**: Holistic persona review of wchen.ai identified gaps across four key audiences (collaborators, technical peers, investors/advisors, developers). This spec covers the high-impact and medium-impact improvements: credibility signals, content discoverability, SEO enhancements, and engagement features.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor verifies founder credibility (Priority: P1)

A potential collaborator, investor, or peer lands on the site and wants to quickly assess Wilson's background, track record, and current focus. They look for a photo, social presence, and career specifics to decide whether to engage further.

**Why this priority**: Without credibility signals, the site fails its primary purpose for the most valuable visitors. This is table-stakes for a founder's personal site.

**Independent Test**: Can be fully tested by visiting the homepage, about page, and footer and confirming that a headshot, social links, and background specifics are present and functional.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the about page, **When** they scroll to the background section, **Then** they see specific company names, roles, and approximate timelines.
2. **Given** a visitor is on any page, **When** they look at the header or footer, **Then** they see links to Twitter/X and LinkedIn that open in new tabs.
3. **Given** a visitor is on the about page, **When** they view the top of the page, **Then** they see a professional headshot of Wilson.
4. **Given** a visitor clicks a social link, **When** the new tab opens, **Then** it navigates to the correct social profile.

---

### User Story 2 - Active page is visually indicated in navigation (Priority: P1)

A visitor navigating the site wants to know which page they are currently on. The navigation bar should clearly indicate the active page.

**Why this priority**: This is basic UX hygiene that affects every single page view. Its absence makes the site feel unfinished.

**Independent Test**: Can be tested by navigating to each page (/, /projects, /writing, /about) and confirming the corresponding nav link has a distinct visual state.

**Acceptance Scenarios**:

1. **Given** a visitor is on the Projects page, **When** they look at the navigation bar, **Then** the "Projects" link has a visually distinct active state (e.g., different color, underline, or font weight).
2. **Given** a visitor navigates from Projects to Writing, **When** the page loads, **Then** the active indicator moves from "Projects" to "Writing."
3. **Given** a visitor is on the homepage, **When** they look at the navigation, **Then** no content page link is marked active (or the logo is highlighted).

---

### User Story 3 - Writing pages surface related content (Priority: P2)

A technical peer finishes reading an article and wants to discover more of Wilson's writing on the same topic. The site surfaces relevant posts so the reader continues exploring rather than leaving.

**Why this priority**: Content discoverability is the biggest engagement lever for technical peers, who are the most likely audience to share and return.

**Independent Test**: Can be tested by visiting any writing page and confirming that 2-3 related posts appear at the bottom, filtered by matching theme or tags.

**Acceptance Scenarios**:

1. **Given** a reader finishes a writing page, **When** they scroll past the content, **Then** they see a "Read Next" section with 2-3 related posts from the same theme or with overlapping tags.
2. **Given** a writing has no other posts in the same theme, **When** the reader reaches the bottom, **Then** the section shows the most recent posts from other themes as a fallback.
3. **Given** a reader clicks a related post, **When** the page loads, **Then** they see the full article with its own set of related posts.

---

### User Story 4 - Visitor can copy or share a writing URL (Priority: P2)

A reader wants to share a writing entry with colleagues or on social media. A share/copy-link button makes this frictionless without requiring the reader to manually select the URL bar.

**Why this priority**: Sharing drives organic reach. Removing friction for this action directly increases distribution of Wilson's writing.

**Independent Test**: Can be tested by visiting a writing page, clicking the share/copy button, and confirming the URL is copied to clipboard with visual feedback.

**Acceptance Scenarios**:

1. **Given** a reader is on a writing page, **When** they see the title area or bottom of the article, **Then** they see a subtle copy-link or share button.
2. **Given** a reader clicks the copy-link button, **When** the URL is copied, **Then** they see brief visual confirmation (e.g., "Copied!" tooltip that fades).
3. **Given** a reader is on a device that supports the Web Share API, **When** they click the share button, **Then** the native share sheet appears with the article title and URL pre-filled.

---

### User Story 5 - Twitter/X and search engines render rich previews (Priority: P2)

When Wilson's pages are shared on Twitter/X or indexed by search engines, the previews should be rich and informative, driving higher click-through rates.

**Why this priority**: Rich previews significantly increase click-through from social shares and search results, amplifying every piece of content Wilson publishes.

**Independent Test**: Can be tested by validating pages against Twitter Card Validator and Google Rich Results Test, confirming cards render and structured data is valid.

**Acceptance Scenarios**:

1. **Given** a writing page URL is shared on Twitter/X, **When** the tweet is rendered, **Then** a summary card appears with the article title, description, and OG image.
2. **Given** a search engine crawls the about page, **When** it parses the page, **Then** it finds valid JSON-LD Person schema with name, url, job title, and social links.
3. **Given** a search engine crawls a writing page, **When** it parses the page, **Then** it finds valid JSON-LD Article schema with headline, author, publish date, and description.

---

### User Story 6 - Reader subscribes to new writing (Priority: P3)

A technical peer who enjoyed a post wants to be notified when Wilson publishes new writing. They can enter their email to subscribe without needing to use RSS.

**Why this priority**: Audience retention is critical for building a following, but requires choosing and integrating with an email service, making it higher effort than other items.

**Independent Test**: Can be tested by entering an email in the signup form and confirming the subscription is registered with the email service.

**Acceptance Scenarios**:

1. **Given** a reader is on the writing index page or at the bottom of a writing page, **When** they look for a way to subscribe, **Then** they see a simple email input with a subscribe button.
2. **Given** a reader enters a valid email and submits, **When** the request completes, **Then** they see a message prompting them to check their inbox to confirm (e.g., "Check your email to confirm your subscription.").
3. **Given** a reader enters an invalid email, **When** they submit, **Then** they see an inline validation error.
4. **Given** a reader confirms their subscription via the confirmation email, **When** the confirmation link is clicked, **Then** they are added to the audience and see a success page.

---

### User Story 7 - Reader navigates long articles via table of contents (Priority: P3)

A reader opens a longer writing entry and wants to quickly scan the structure or jump to a specific section without scrolling through the entire article.

**Why this priority**: This becomes more valuable as content grows longer. Currently posts are 200-1500 words, making this a future-proofing investment.

**Independent Test**: Can be tested by visiting a writing page with multiple headings and confirming a TOC appears with clickable links that scroll to the correct sections.

**Acceptance Scenarios**:

1. **Given** a writing page has 3+ headings, **When** the page loads, **Then** a table of contents appears near the top of the article with links to each heading.
2. **Given** a writing page has fewer than 3 headings, **When** the page loads, **Then** no table of contents is shown (to avoid clutter).
3. **Given** a reader clicks a TOC link, **When** the page scrolls, **Then** the target heading is visible with appropriate scroll offset (accounting for sticky header).

---

### User Story 8 - Visitor toggles dark mode manually (Priority: P3)

A visitor whose system preference doesn't match their current reading preference (e.g., system is light but they're reading at night) wants to manually toggle dark mode.

**Why this priority**: System-preference dark mode already works. Manual toggle is a polish feature that respects user autonomy but is not critical.

**Independent Test**: Can be tested by clicking the toggle and confirming the entire site switches themes, and the preference persists across page navigations.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page, **When** they look at the header, **Then** they see a dark/light mode toggle icon.
2. **Given** a visitor clicks the toggle, **When** the theme changes, **Then** the entire page transitions smoothly to the opposite mode.
3. **Given** a visitor sets dark mode via toggle and navigates to another page, **When** the new page loads, **Then** the dark mode preference is preserved.
4. **Given** a visitor has not interacted with the toggle, **When** they visit the site, **Then** the theme follows their system preference (existing behavior preserved).

---

### Edge Cases

- What happens when a writing page has no related posts at all (only post on the site)? The "Read Next" section should be hidden entirely.
- What happens when the Web Share API is not available? The share button should fall back to copy-to-clipboard only.
- What happens when a visitor clears localStorage? The dark mode toggle should revert to system preference.
- What happens when the headshot image fails to load? An appropriate fallback (initials or empty state) should appear without layout shift.
- What happens when social profile URLs change? Social links should be centralized in one configuration location for easy updates.
- What happens when a subscriber enters an email that is already subscribed? The system should show a neutral message (e.g., "Check your email to confirm") to avoid revealing whether the email is already in the audience.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The about page MUST display a professional headshot image near the top of the page with appropriate alt text. The homepage hero does not include a headshot.
- **FR-002**: The site header MUST display social profile icons (X, LinkedIn, GitHub) on the right side, visually separate from the text navigation links. The footer MUST include the same profiles as text links alongside the existing RSS and Contact links. All social links MUST open in new tabs with `rel="noopener noreferrer"`.
- **FR-003**: The about page background section MUST be rewritten as a narrative that weaves in specific company names (Financial Times, Innovative Web Services, Zume, HubSpot, FullStory, The Juicy Crab), roles (engineer to founder to senior engineer to CTO), and approximate timelines — while preserving the existing prose style. The narrative MUST also briefly mention Wilson's current ventures bestpos.io (restaurant marketing agency) and kloudeats.com (online ordering platform) as part of his entrepreneurial activity.
- **FR-004**: The navigation bar MUST visually indicate which page is currently active.
- **FR-005**: All pages MUST include Twitter Card meta tags (`twitter:card`, `twitter:site`, `twitter:title`, `twitter:description`, `twitter:image`).
- **FR-006**: The about page MUST include JSON-LD structured data using the Person schema.
- **FR-007**: Writing pages MUST include JSON-LD structured data using the Article schema.
- **FR-008**: Writing pages MUST display a "Read Next" section with 2-3 related posts, prioritized by matching theme, then overlapping tags, then recency.
- **FR-009**: Writing pages MUST include a copy-link button that copies the page URL to clipboard with visual confirmation.
- **FR-010**: Writing pages SHOULD include a native share button on devices supporting the Web Share API.
- **FR-011**: The site MUST include a newsletter signup component on the writing index page and at the bottom of individual writing pages. The subscription will be handled via Resend's audience/contacts API with double opt-in (subscriber must confirm via email before being added).
- **FR-012**: Writing pages with 3 or more headings MUST display an auto-generated table of contents near the top of the article.
- **FR-013**: The site MUST include a manual dark/light mode toggle in the header that overrides system preference and persists across navigations.
- **FR-014**: Social profile URLs MUST be defined in a single configuration location and referenced throughout the site.

### Key Entities

- **SocialLinks**: A centralized configuration object containing platform name, URL, and optional icon for each social profile: Twitter/X (@wchen_ai → https://x.com/wchen_ai), LinkedIn (https://www.linkedin.com/in/wchen02/), GitHub (https://github.com/wenshengchen).
- **RelatedPost**: A subset of Writing metadata (slug, title, theme, tags, publishDate) used for the "Read Next" section.
- **ThemePreference**: User's chosen theme mode (light, dark, system) stored in client-side storage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four personas (collaborator, technical peer, investor, developer) can identify Wilson's background specifics, photo, and at least two social profiles within 15 seconds of landing on the site.
- **SC-002**: Every page on the site displays a correct active navigation state corresponding to the current route.
- **SC-003**: Writing pages shared on Twitter/X render a summary card with title, description, and image (validated via Twitter Card Validator).
- **SC-004**: About page and writing pages pass Google Rich Results Test for Person and Article structured data respectively.
- **SC-005**: Readers who reach the bottom of a writing page see at least 2 related posts 100% of the time (when more than 1 post exists on the site).
- **SC-006**: The copy-link button successfully copies the URL to clipboard and shows visual confirmation within 500ms.
- **SC-007**: The dark mode toggle switches theme within 100ms with no visible flash of incorrect theme on subsequent page loads.
- **SC-008**: Newsletter signup successfully registers a subscription with the chosen email service.

## Clarifications

### Session 2026-02-27

- Q: How much career detail should appear in the about page background section? → A: Narrative with names — keep the prose style but weave in company names (Financial Times, Innovative Web Services, Zume, HubSpot, FullStory, The Juicy Crab), roles (engineer → founder → senior engineer → CTO), and approximate years. Not a resume-style list.
- Q: Where should the headshot appear on the site? → A: About page only (near the top or background section). Homepage hero stays text-first.
- Q: How should social links (X, LinkedIn, GitHub) be placed in the site layout? → A: Small icons in the header (right side, visually separate from nav text links), plus text links in the footer (expanding existing GitHub/RSS/Contact set).
- Q: Should the newsletter signup require double opt-in? → A: Yes, double opt-in. Subscriber must confirm via email before being added (GDPR-compliant).
- Q: Should bestpos.io and kloudeats.com appear in the background narrative? → A: Brief mention — name them as current ventures in 1 sentence alongside The Juicy Crab CTO role, without detailed descriptions.

## Assumptions

- Wilson will provide a professional headshot image to be placed in the `public/` directory. If not available at implementation time, a placeholder with initials will be used.
- Resend will be used as the newsletter email service, integrated via its audience/contacts API through a Cloudflare Pages Function (consistent with the existing contact form pattern).
- The site's static-first architecture will be preserved; all new features will work with `output: "export"` and build-time generation.
- The dark mode toggle will use localStorage for persistence, which is compatible with the static export approach.
- The table of contents will be generated at build time from MDX heading structure, not at runtime.

## Scope Boundaries

**In scope**:
- All items listed in the "High impact, low effort" and "Medium impact" sections of the persona review plan.

**Out of scope**:
- Expanding the project portfolio (content decision, not a feature).
- Enabling Cloudflare Web Analytics (dashboard-only change, no code needed).
- Adding canonical URLs (separate small task).
- Print/PDF stylesheet (separate small task).
- Comments system or discussion features.
- Search functionality for writings.
- A dedicated "/now" page (can be added as a separate feature; the background specifics partially address this need).
