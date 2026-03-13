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

### Writing body structure
Typical pattern from existing content:
1. Opening observation or provocation (1-2 paragraphs)
2. The problem reframed (1-2 paragraphs)
3. The author's position or insight (1-2 paragraphs)
4. Closing conviction or forward-looking statement (1 paragraph)

No H1 in body (title is rendered from frontmatter). Use H2 sparingly for structure within longer pieces.

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
featured: true | false                     # Featured items appear first on homepage
---
```

### Project body structure
Typical pattern from existing content:
1. Brief context (1 paragraph)
2. "How it works" or "The Vision" section (H2 + technical explanation)
3. Optional: "Architecture" or "Results" section
4. Code snippets where relevant (TypeScript)

### Project location rules
- Prefer `content/locales/<locale>/projects/[slug].mdx` for locale-specific entries
- Use `content/projects/[slug].mdx` for shared/default content that should act as fallback

### Narrative fields style guide
- **motivation**: Start with "I wanted to..." or "I needed...". Focus on the personal itch.
- **problemAddressed**: State the broken status quo. Be vivid: "Note-taking apps become black holes where information goes to die."
- **learnings**: Be honest and specific. Not "I learned a lot" but "Automatic tagging using LLMs works surprisingly well."

---

## Theme Values

Themes for writing entries. Not strictly enumerated — new themes can be added, but prefer reusing existing ones:

| Theme | Covers |
|---|---|
| Architecture | Systems design, static-first, data flow, rendering strategy |
| Developer Tools | DX, productivity, tooling, agents, cursor, skills, friction reduction |
| Infrastructure | Hosting, deployment, email, platform choice, migration, CDN |
| Workflow | Process, spec-kit, vibe coding, agent-augmented development |

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
