# Content Schemas & Frontmatter Reference

The site now uses two content systems:

- Locale-scoped JSON bundles in `content/locales/<locale>/site/*.json` for site copy, UI labels, newsletter text, and system messages (supported locales: en, es, zh; see `src/lib/locales.ts`)
- MDX files for writing and project entries: for each locale, the app uses *either* `content/locales/<locale>/writing` or `content/writing` (and similarly `.../projects` or `content/projects`). If the locale folder exists, only that folder is used; otherwise the shared folder is used. No merging. See `src/lib/mdx.ts` (`getWritingDir`, `getProjectsDir`).

Zod validation happens at build time. Invalid frontmatter or invalid locale JSON content fails the build.

## Site Content Bundles (`content/locales/<locale>/site/*.json`)

These files are the source of truth for page copy and UI strings. They are imported and validated in `src/lib/content.ts`.

### Files

- `profile.json`: site identity, metadata defaults, social links, nav labels, CTA copy, contact copy, not-found copy
- `home.json`: homepage hero and section copy
- `about.json`: about-page intro, philosophy, expertise, background, principles
- `newsletter.json`: newsletter email templates, recurring digest labels, footer labels
- `ui.json`: interface strings for components like language switcher, theme toggle, search, project detail labels
- `forms.json`: form labels, placeholders, submission labels, success copy
- `system.json`: validation and API/system fallback messages

### Authoring rules for locale JSON

- Preserve the existing object shape unless the schema is being intentionally updated
- Translate content values, not key names
- Keep route values unprefixed, for example `/about` instead of `/es/about`
- Keep token placeholders intact, for example `{siteName}`, `{authorName}`, `{query}`
- Prefer editing all supported locales together when changing shared product copy

---

## Writing Entry (`content/writing/[slug].mdx` or `content/locales/<locale>/writing/[slug].mdx`)

```yaml
---
title: "string, required"           # Concise, evocative. Not clickbait.
publishDate: "ISO 8601 datetime"    # e.g. "2026-02-20T10:00:00Z"
updatedAt: "ISO 8601 datetime"      # optional, for revised pieces
theme: "string, required"           # Single theme. See Theme Values table below.
tags: ["array", "of", "strings"]    # Lowercase, specific. Default: []
investing:                          # optional; required by convention when theme is "Investing"
  kind: "learning"                  # see Investing Entries below
  summary: "string"
ogImage: "https://wchen.ai/writing/<slug>/feature.jpg" # required by content workflow for new entries
featured: false                     # boolean. Featured items appear first on homepage/index.
draft: false                        # boolean. If true, excluded from build.
---
```

### Writing body constraints
- **Length**: 200-1500 words (per spec)
- **Format**: MDX (markdown + optional JSX components)
- **Reading time**: Auto-calculated at build time from word count
- **Slug**: Derived from filename (e.g. `static-first.mdx` -> `/writing/static-first`, localized at runtime when needed)
- **Location**: Prefer `content/locales/<locale>/writing/[slug].mdx` for locale-specific pieces; use `content/writing/[slug].mdx` for shared/default content
- **Feature image**: New entries must include a `.jpg` or `.png` feature image under `public/writing/<slug>/`, an absolute `ogImage`, and a Markdown image reference in the body. Do not use SVG for feature images.

### Writing body structure
Typical pattern from existing content:
1. Opening observation or provocation (1-2 paragraphs)
2. The problem reframed (1-2 paragraphs)
3. The author's position or insight (1-2 paragraphs)
4. Closing conviction or forward-looking statement (1 paragraph)

No H1 in body (title is rendered from frontmatter). Use H2 sparingly for structure within longer pieces.

---

## Investing Entries (`theme: "Investing"`)

Investing entries are writing entries that appear under `/investing`. They use the same MDX location rules as writing:

- Shared/default: `content/writing/[slug].mdx`
- Locale-specific: `content/locales/<locale>/writing/[slug].mdx`

### Investing frontmatter

Use `theme: "Investing"` plus an `investing` object.

Minimum for lightweight investing notes:

```yaml
investing:
  kind: "learning" # stock-thesis | portfolio-journal | watchlist | postmortem | process-note | learning | advice | habit
  summary: "A concise description used on investing cards."
```

Decision-record entries opt in with `showDecisionRecord: true`:

```yaml
investing:
  kind: "stock-thesis"
  showDecisionRecord: true
  ticker: "AAPL"              # optional
  company: "Apple"            # optional
  status: "watching"          # watching | open | closed | review
  direction: "long"           # long | short | neutral
  horizon: "6-18 months"
  disclosure: "No current position"
  summary: "The setup in one sentence."
  thesis: "What I believe the market is missing."
  invalidation: "What evidence would prove the thesis wrong."
  catalysts:
    - "Upcoming event or company-specific trigger"
  decisionTriggers:
    - "Add, trim, exit, or avoid rule."
  risk: "The main way this can go wrong."
  lastReviewed: "2026-05-09T02:45:00Z"
```

### Kind guidance

| Kind | Use when |
|---|---|
| `stock-thesis` | A ticker/company-specific long, short, or neutral thesis |
| `portfolio-journal` | Portfolio process, allocation, concentration, cash, or public accountability |
| `watchlist` | A company being monitored but not necessarily owned |
| `postmortem` | A closed position, broken thesis, or mistake review |
| `process-note` | A general investing/trading process note |
| `learning` | A lesson learned from markets, behavior, or research |
| `advice` | A reusable recommendation or principle |
| `habit` | A recurring operating habit or checklist |

Only use `showDecisionRecord: true` for decision-oriented posts. Do not force decision-record fields onto learning, advice, habit, or light process notes.

### Investing body structure

- Always create a `.jpg` or `.png` feature image for investing entries using the same writing image path: `public/writing/<slug>/feature.jpg` or similar. Do not use SVG for feature images.
- Generate investing feature images in the bold editorial thumbnail style from [images.md](images.md): high-contrast 16:9 composition, large short headline text when legible, market charts, red/green risk contrast, and visuals tied to the specific watchlist, trade setup, lesson, or process note.
- Always include a short public disclaimer for stock/trading content: `Nothing here is financial advice.`
- For stock theses: cover why now, what the market may be missing, what is already priced in, key catalysts, invalidation, and add/trim/exit/avoid rules.
- For learning/advice/habit notes: focus on the behavior, mistake pattern, or operating rule; avoid pretending there is a ticker-specific thesis.
- Avoid performance theater. Track decision quality, thesis integrity, review cadence, and mistake type instead.

---

## Project Entry (`content/projects/[slug].mdx` or `content/locales/<locale>/projects/[slug].mdx`)

```yaml
---
title: "string, required"                 # Clear project name
date: "ISO 8601 datetime"                 # Project date
status: "active" | "archived" | "in-progress"
type: ["app"] | ["agent"] | ["experiment"] | ["skill"] | ["library"] | ["tool"] | combinations  # At least one required
motivation: "string, min 10 chars"         # Why the author built it. First-person, punchy.
problemAddressed: "string, min 10 chars"   # The specific problem. Concrete, not abstract.
learnings: "string, optional"              # What was discovered. Honest, specific.
url: "valid URL, optional"                 # Live app link
github: "valid URL, optional"              # GitHub repo link
ogImage: "https://wchen.ai/projects/<slug>/hero.jpg" # required by content workflow for new entries
featured: true | false                     # Featured items appear first on homepage
---
```

### Project body structure
Typical pattern from existing content:
1. Brief context (1 paragraph)
2. Feature image near the opening
3. "How it works" or "The Vision" section (H2 + technical explanation)
4. Optional: "Architecture" or "Results" section
5. Code snippets where relevant (TypeScript)

### Project location rules
- Prefer `content/locales/<locale>/projects/[slug].mdx` for locale-specific entries
- Use `content/projects/[slug].mdx` for shared/default content that should act as fallback

### Narrative fields style guide
- **motivation**: Start with "I wanted to..." or "I needed...". Focus on the personal itch.
- **problemAddressed**: State the broken status quo. Be vivid: "Note-taking apps become black holes where information goes to die."
- **learnings**: Be honest and specific. Not "I learned a lot" but "Automatic tagging using LLMs works surprisingly well."

---

## Images in writing and project MDX

Writing, investing, and project entries must include a `.jpg` or `.png` feature image. Bodies support standard Markdown images. The site serves images from `public/` at build time (static export). Do not use SVG for feature images.

**Where to put image files**
- Writing: `public/writing/<slug>/` (e.g. `public/writing/my-post/feature.jpg`)
- Projects: `public/projects/<slug>/` (e.g. `public/projects/my-project/hero.png`)

**How to reference them in MDX**  
Use root-relative URLs in Markdown image syntax and set `ogImage` to the absolute `https://wchen.ai/...` URL:

- Writing: `![Alt text](/writing/my-post/feature.jpg)`
- Projects: `![Diagram](/projects/my-project/hero.png)`

Images are rendered with lazy loading and responsive styling. Always provide meaningful `alt` text for accessibility.

---

## Theme Values

Themes for writing entries. Not strictly enumerated — new themes can be added, but prefer reusing existing ones:

| Theme | Covers |
|---|---|
| Architecture | Systems design, static-first, data flow, rendering strategy |
| Developer Tools | DX, productivity, tooling, agents, cursor, skills, friction reduction |
| Infrastructure | Hosting, deployment, email, platform choice, migration, CDN |
| Workflow | Process, spec-kit, vibe coding, agent-augmented development |
| Investing | Stock theses, portfolio journals, watchlists, postmortems, habits, and investing lessons |

Add new themes only when content genuinely doesn't fit existing ones.

## Project Types

| Type | Use when |
|---|---|
| app | Web app, site, or deployable product |
| agent | AI agent, bot, or agentic workflow |
| experiment | One-off or exploratory build |
| skill | Reusable agent instruction set (e.g. Cursor skill, SKILL.md package) |
| library | Reusable code package or module |
| tool | CLI, utility, or small standalone tool |

---

## Tag Conventions

- Lowercase, hyphenated for multi-word: `"nextjs"`, `"static"`, `"dev-tools"`
- Specific over generic: `"agents"` not `"ai"`, `"nextjs"` not `"javascript"`
- 2-4 tags per entry
