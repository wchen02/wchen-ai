# Content Schemas & Frontmatter Reference

All content lives in `/content/` as MDX files. Frontmatter is validated by Zod at build time — invalid frontmatter fails the build.

## Writing Entry (`content/writing/[slug].mdx`)

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
- **Length**: 200–1500 words (per spec)
- **Format**: MDX (markdown + optional JSX components)
- **Reading time**: Auto-calculated at build time from word count
- **Slug**: Derived from filename (e.g. `static-first.mdx` → `/writing/static-first`)

### Writing body structure
Typical pattern from existing content:
1. Opening observation or provocation (1-2 paragraphs)
2. The problem reframed (1-2 paragraphs)
3. Wilson's position or insight (1-2 paragraphs)
4. Closing conviction or forward-looking statement (1 paragraph)

No H1 in body (title is rendered from frontmatter). Use H2 sparingly for structure within longer pieces.

---

## Project Entry (`content/projects/[slug].mdx`)

```yaml
---
title: "string, required"                 # Clear project name
date: "ISO 8601 datetime"                 # Project date
status: "active" | "archived" | "in-progress"
type: ["app"] | ["agent"] | ["experiment"] | ["skill"] | ["library"] | ["tool"] | combinations  # At least one required
motivation: "string, min 10 chars"         # WHY Wilson built it. First-person, punchy.
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
