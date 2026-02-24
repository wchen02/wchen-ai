---
name: website-content
description: Write, rewrite, or improve content for Wilson Chen's personal website (wchen.ai). Use when the user asks to write a new writing entry, create a new project entry, update about page copy, update homepage copy, write frontmatter, draft an essay, or says "write content for," "new blog post," "add a project," "update the about page," "write a writing entry," or "draft copy for the site." This skill covers MDX content authoring, frontmatter construction, and page copy — not marketing/conversion copy (use copywriting skill for that).
---

# Website Content

Write content for wchen.ai in Wilson Chen's voice. All content is MDX with Zod-validated frontmatter, rendered statically via Next.js.

## Before Writing

1. Read [references/voice-guide.md](references/voice-guide.md) to internalize Wilson's voice
2. Read [references/content-schemas.md](references/content-schemas.md) for the content type being written
3. If writing page-level copy (homepage, about), also read [references/page-patterns.md](references/page-patterns.md)

## Content Types

### Writing Entry (Essay / Quick Thought)

Create a new file at `content/writing/[slug].mdx`.

**Frontmatter requirements** (see content-schemas.md for full spec):
- `title`: Evocative but honest. Not clickbait. Pattern: noun phrase or "The X Between Y and Z"
- `publishDate`: ISO 8601 datetime
- `theme`: Reuse existing themes ("Architecture", "Developer Tools") when possible
- `tags`: 2-4 lowercase, specific tags
- `featured`: Set true only for foundational/important pieces
- `draft`: Set true for work-in-progress

**Body guidelines:**
- 200–1500 words (hard constraint from spec)
- No H1 (title renders from frontmatter)
- Structure: provocation → problem reframe → position → closing conviction
- Short paragraphs (1-3 sentences each)
- Use *italics* for emphasis on key reframes
- Use rhetorical questions to redirect attention
- End with a forward-looking conviction, not a summary
- No "In conclusion" patterns

**Slug**: Derive from the core concept, hyphenated lowercase (e.g. `context-aware-agents.mdx`)

### Project Entry

Create a new file at `content/projects/[slug].mdx`.

**Frontmatter requirements** (see content-schemas.md for full spec):
- `motivation`: Start with "I wanted to..." or "I needed...". The personal itch.
- `problemAddressed`: State the broken status quo vividly. Be concrete.
- `learnings`: Honest, specific. What surprised you. Optional.
- `type`: At least one of `app`, `agent`, `experiment`
- `status`: `active`, `archived`, or `in-progress`

**Body guidelines:**
- Brief context paragraph, then structured H2 sections
- Typical sections: "How it works", "The Vision", "Architecture", "Results"
- Include code snippets (TypeScript) where they add clarity
- Focus on narrative (motivation → approach → outcome), not feature lists

### About Page Copy

Edit `src/app/about/page.tsx` directly. See page-patterns.md for section structure.

Key constraints:
- Philosophy: 3 paragraphs on core beliefs about building software
- Interests: 4 cards, each with a bold H3 topic name + 1-2 sentence description
- Background: 3 paragraphs, career arc told as a story, not a resume
- Principles: 3 items, each with a short imperative phrase + 1-sentence expansion

### Homepage Copy

Edit `src/app/page.tsx` directly. See page-patterns.md for section structure.

Key constraints:
- Hero: Two paragraphs. (1) What Wilson is exploring now. (2) Primary focus area.
- Current Focus: Two paragraphs. (1) The problem he's obsessed with. (2) His thesis.
- Must pass the 15-second test: a new visitor should immediately understand who Wilson is, what he does, and how to reach him.

## Voice Checklist

Run this check against every piece of content before finalizing:

- [ ] First person throughout ("I build..." not "Wilson builds...")
- [ ] No corporate filler (leverage, synergy, innovative, cutting-edge)
- [ ] No hedging language (kind of, sort of, I think maybe)
- [ ] No exclamation points
- [ ] No emojis in body copy
- [ ] Every paragraph advances exactly one idea
- [ ] Paragraphs are 1-3 sentences
- [ ] Contrasts and dash-separated asides feel natural
- [ ] Ends with conviction, not summary
- [ ] Frontmatter validates against Zod schema (check content-schemas.md)

## File Placement

```
content/
  writing/[slug].mdx     → Writing entries
  projects/[slug].mdx    → Project entries
src/app/
  page.tsx                → Homepage copy
  about/page.tsx          → About page copy
```
