---
name: website-content
description: Write, rewrite, or improve content for the site owner's personal website (this repo). Use when the user asks to write a new writing entry, create a new project entry, update about page copy, update homepage copy, write frontmatter, draft an essay, add an image, find an image for a post, or use a user-provided image; or says "write content for," "new blog post," "add a project," "update the about page," "write a writing entry," or "draft copy for the site." This skill covers MDX content authoring, frontmatter construction, page copy, adding images to entries (sourcing royalty-free or placing user-provided), and handing shared writing/project entries off to the translation workflow when they are finished.
---

# Website Content

Write content for the site in the site owner's voice. The site splits content into two buckets:

- **Site copy**: Locale-scoped JSON only under `content/locales/<locale>/site/*.json`. The app loads these via `src/lib/content.ts`; there is no shared `content/site/` source for home, about, or UI copy. Supported locales: `en`, `es`, `zh` (see `src/lib/locales.ts`).
- **Writing and projects**: MDX entries. For each locale, the app uses *either* that locale’s folder *or* the shared folder—not both. If `content/locales/<locale>/writing` exists, that locale sees only files in it; otherwise it uses `content/writing`. Same for projects: `content/locales/<locale>/projects` or else `content/projects`. Shared entries in `content/writing` and `content/projects` are the canonical default; use the content-translation skill to produce locale-specific copies after creating or updating them.

## Before Writing

1. Read [references/voice-guide.md](references/voice-guide.md) to internalize the site owner's voice (customize that guide for your own voice if you forked this template).
2. Read [references/content-schemas.md](references/content-schemas.md) for the content type being written.
3. If updating homepage/about or other page-level copy, also read [references/page-patterns.md](references/page-patterns.md).
4. If the task involves adding, sourcing, or placing an image in a writing or project entry, read [references/images.md](references/images.md).

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
- Images: place files in `public/writing/<slug>/` and use `![alt](/writing/<slug>/filename.png)`. For **sourcing royalty-free images** or **using a user-provided image**, read [references/images.md](references/images.md). Mechanics (paths, syntax) in content-schemas.md.

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
- Images: place files in `public/projects/<slug>/` and use `![alt](/projects/<slug>/filename.png)`. For **sourcing royalty-free images** or **using a user-provided image**, read [references/images.md](references/images.md). Mechanics (paths, syntax) in content-schemas.md.

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

All editable site copy lives under `content/locales/<locale>/site/`. Use these files when the request is not an MDX entry:

- `content/locales/<locale>/site/profile.json`: site identity, metadata defaults, nav labels, CTA copy, contact copy, not-found copy
- `content/locales/<locale>/site/home.json`: homepage hero and section copy
- `content/locales/<locale>/site/about.json`: about-page copy
- `content/locales/<locale>/site/newsletter.json`: newsletter email subjects, previews, button labels, recurring digest copy
- `content/locales/<locale>/site/ui.json`: shared UI strings (language switcher, theme toggle, share button, search, writing/project labels)
- `content/locales/<locale>/site/forms.json`: contact/newsletter form labels, placeholders, button copy
- `content/locales/<locale>/site/system.json`: validation, API, and fallback system messages

Do not edit `content/site/newsletter-state.json` for copy—it is managed by the recurring-newsletter build script and tracks which slugs have been sent.

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
- [ ] Frontmatter or JSON shape matches the active schema (Zod in `src/lib/schemas.ts`; invalid content fails the build; see also `scripts/validate-links.ts`, `validate-theme-descriptors.ts`, `validate-metadata.ts`)

## File Placement

```text
public/
  writing/[slug]/                         -> Image assets for writing entry [slug]; reference as /writing/<slug>/filename.ext
  projects/[slug]/                        -> Image assets for project entry [slug]; reference as /projects/<slug>/filename.ext
content/
  writing/[slug].mdx                      -> Shared/default writing entries (canonical)
  projects/[slug].mdx                     -> Shared/default project entries (canonical)
  site/
    newsletter-state.json                 -> Script-managed; do not edit for copy
  locales/<locale>/site/                   -> Locales: en, es, zh
    profile.json                          -> Site identity, nav, CTA, metadata, contact, not-found
    home.json                             -> Homepage copy
    about.json                            -> About-page copy
    newsletter.json                       -> Newsletter email and flow copy
    ui.json                               -> Shared UI strings (share, search, theme, etc.)
    forms.json                            -> Form labels and placeholders
    system.json                           -> Validation and system messages
  locales/<locale>/writing/[slug].mdx     -> Locale-specific writing (used when present instead of shared)
  locales/<locale>/projects/[slug].mdx    -> Locale-specific projects (used when present instead of shared)
src/app/[locale]/
  page.tsx                                -> Homepage renderer
  about/page.tsx                          -> About-page renderer
```
