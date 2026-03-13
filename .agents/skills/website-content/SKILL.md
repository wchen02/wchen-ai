---
name: website-content
description: Write, rewrite, or improve content for the site owner's personal website (this repo). Use when the user asks to write a new writing entry, create a new project entry, update about page copy, update homepage copy, write frontmatter, draft an essay, or says "write content for," "new blog post," "add a project," "update the about page," "write a writing entry," or "draft copy for the site." This skill covers MDX content authoring, frontmatter construction, page copy, and handing shared writing/project entries off to the translation workflow when they are finished.
---

# Website Content

Write content for the site in the site owner's voice. The site splits content into two buckets:

- Locale-scoped JSON bundles for site copy under `content/locales/<locale>/site/*.json`
- MDX entries for writing and projects, loaded locale-first with fallback to shared content in `content/writing` and `content/projects`

## Before Writing

1. Read [references/voice-guide.md](references/voice-guide.md) to internalize the site owner's voice (customize that guide for your own voice if you forked this template).
2. Read [references/content-schemas.md](references/content-schemas.md) for the content type being written.
3. If updating homepage/about or other page-level copy, also read [references/page-patterns.md](references/page-patterns.md).

## Content Types

### Writing Entry (Essay / Quick Thought)

Choose the file location based on whether the piece is shared or locale-specific:

- Default/shared content: create or edit `content/writing/[slug].mdx`
- Locale-specific translation or locale-only piece: create or edit `content/locales/<locale>/writing/[slug].mdx`

Prefer the locale-specific path when the user explicitly wants translated or locale-specific writing. Use the shared path when the content is the canonical default entry consumed as fallback content.

After creating or updating a shared entry in `content/writing/[slug].mdx`, immediately read `.agents/skills/content-translation/SKILL.md` and use it to translate the finished entry into every other locale discovered under `content/locales`.

**Frontmatter requirements** (see `content-schemas.md` for full spec):
- `title`: evocative but honest; not clickbait
- `publishDate`: ISO 8601 datetime
- `theme`: reuse existing themes like `Architecture`, `Developer Tools`, `Infrastructure`, or `Workflow` when possible
- `tags`: 2-4 lowercase, specific tags
- `featured`: `true` only for foundational or especially important pieces
- `draft`: `true` for work-in-progress

**Body guidelines:**
- 200-1500 words
- No H1; the title renders from frontmatter
- Structure: provocation -> problem reframe -> position -> closing conviction
- Keep paragraphs short: 1-3 sentences
- Use *italics* sparingly for emphasis on key reframes
- End with a forward-looking conviction, not a summary

**Slug**: derive from the core concept in lowercase kebab case, for example `context-aware-agents.mdx`.

### Project Entry

Choose the file location based on whether the project entry is shared or locale-specific:

- Default/shared content: create or edit `content/projects/[slug].mdx`
- Locale-specific translation or locale-only entry: create or edit `content/locales/<locale>/projects/[slug].mdx`

Prefer the locale-specific path when the user asks for a translated or locale-only project entry. Use the shared path for the canonical default entry consumed as fallback content.

After creating or updating a shared entry in `content/projects/[slug].mdx`, immediately read `.agents/skills/content-translation/SKILL.md` and use it to translate the finished entry into every other locale discovered under `content/locales`.

**Frontmatter requirements** (see `content-schemas.md` for full spec):
- `motivation`: start with `I wanted to...` or `I needed...`
- `problemAddressed`: state the broken status quo vividly and concretely
- `learnings`: honest and specific; optional
- `type`: at least one of `app`, `agent`, `experiment`, `skill`, `library`, or `tool`
- `status`: `active`, `archived`, or `in-progress`

**Body guidelines:**
- Start with a brief context paragraph, then use structured H2 sections
- Common sections: `How it works`, `The Vision`, `Architecture`, `Results`
- Include code snippets only when they add real clarity
- Focus on narrative arc, not feature lists

### Homepage Copy

Do not edit `src/app/page.tsx`; it is a locale redirect shell. Update locale content instead:

- Hero and section copy: `content/locales/<locale>/site/home.json`
- Shared identity and contact labels used on the page: `content/locales/<locale>/site/profile.json`

See `page-patterns.md` for the rendered section structure in `src/app/[locale]/page.tsx`.

Key constraints:
- Hero: intro plus two short supporting paragraphs
- Current Focus: short description plus two paragraphs
- A new visitor should understand who the site owner is, what they are building, and how to reach them within 15 seconds
- For route values like the about link, store the unprefixed path such as `/about`; localization is applied at runtime

### About Page Copy

Do not edit `src/app/about/page.tsx`; it is a locale redirect shell. Update locale content instead:

- Page copy: `content/locales/<locale>/site/about.json`
- Shared CTA/contact strings used near the page: `content/locales/<locale>/site/profile.json`

See `page-patterns.md` for the rendered section structure in `src/app/[locale]/about/page.tsx`.

Key constraints:
- Philosophy: 3 paragraphs on core beliefs about building software
- Interests: 4 cards, each with a strong H3 topic and 1-2 sentence description
- Background: 3 paragraphs; tell the career arc as a story, not a resume
- Principles: 3 items, each with a short imperative phrase plus a one-sentence expansion

### Shared Site Copy

Use these locale-scoped JSON files when the request is not an MDX entry:

- `content/locales/<locale>/site/profile.json`: site identity, metadata defaults, nav labels, CTA copy, contact copy
- `content/locales/<locale>/site/home.json`: homepage hero and section copy
- `content/locales/<locale>/site/about.json`: about-page copy
- `content/locales/<locale>/site/newsletter.json`: newsletter email subjects, previews, button labels, recurring digest copy
- `content/locales/<locale>/site/ui.json`: shared UI strings, labels, status text, theme descriptors
- `content/locales/<locale>/site/forms.json`: contact/newsletter form labels, placeholders, button copy
- `content/locales/<locale>/site/system.json`: validation, API, and fallback system messages

## Translation Handoff

Use the translation handoff only for shared MDX entries:

- Trigger it after finishing `content/writing/[slug].mdx`
- Trigger it after finishing `content/projects/[slug].mdx`
- Do not trigger it for `content/locales/<locale>/...` source files
- Do not trigger it for homepage, about, newsletter, UI, forms, or system JSON copy

## Voice Checklist

Run this check against every piece of content before finalizing:

- [ ] First person throughout when the content is narrative copy
- [ ] No corporate filler like `leverage`, `synergy`, `innovative`, `cutting-edge`
- [ ] No hedging language like `kind of`, `sort of`, `maybe`
- [ ] No exclamation points unless the user explicitly wants that tone
- [ ] No emojis in body copy
- [ ] Every paragraph advances one idea
- [ ] Paragraphs are 1-3 sentences when writing prose
- [ ] The ending lands on conviction, not recap
- [ ] Frontmatter or JSON shape matches the active schema

## File Placement

```text
content/
  writing/[slug].mdx                      -> Shared/default writing entries
  projects/[slug].mdx                     -> Shared/default project entries
  locales/<locale>/site/
    profile.json                          -> Site identity, nav, CTA, metadata, contact
    home.json                             -> Homepage copy
    about.json                            -> About-page copy
    newsletter.json                       -> Newsletter email and flow copy
    ui.json                               -> Shared UI strings
    forms.json                            -> Form labels and placeholders
    system.json                           -> Validation and system messages
  locales/<locale>/writing/[slug].mdx     -> Locale-specific writing entries
  locales/<locale>/projects/[slug].mdx    -> Locale-specific project entries
src/app/[locale]/
  page.tsx                                -> Homepage renderer
  about/page.tsx                          -> About-page renderer
```
