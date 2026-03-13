---
name: content-translation
description: Translate shared wchen.ai writing and project MDX entries into every locale defined under `content/locales`. Use after creating or updating canonical entries in `content/writing` or `content/projects`, or when the user asks to translate a writing/project entry across site locales.
---

# Content Translation

Translate shared `wchen.ai` MDX content into every locale directory under `content/locales`.

This skill is for MDX entries only:

- Shared writing entries in `content/writing/[slug].mdx`
- Shared project entries in `content/projects/[slug].mdx`

Do not use this skill for site JSON bundles under `content/locales/<locale>/site/*.json`.

## When To Run

Run this skill only when the source file is a canonical shared entry:

- `content/writing/[slug].mdx`
- `content/projects/[slug].mdx`

Do not fan out from locale-specific source files such as:

- `content/locales/<locale>/writing/[slug].mdx`
- `content/locales/<locale>/projects/[slug].mdx`

## Workflow

1. Read the source MDX file and confirm whether it is writing or project content.
2. Discover target locales from the directories that exist under `content/locales`.
3. Treat the source entry as the default locale version and translate into every other locale directory found on disk.
4. Write translated files to:
   - `content/locales/<locale>/writing/[slug].mdx`
   - `content/locales/<locale>/projects/[slug].mdx`
5. Preserve filename and slug exactly.
6. Verify every locale folder now has a translated file or explicitly report why one was not produced.

## Translation Rules

Before translating, read [translation-rules.md](translation-rules.md).

Apply these rules throughout:

- Keep frontmatter keys unchanged.
- Translate frontmatter values only when they are human-facing text.
- Preserve dates, booleans, arrays of machine-readable values, URLs, filenames, and slugs unless the source format clearly expects translated prose.
- Preserve MDX structure, heading levels, code fences, JSX, links, and inline formatting.
- Keep Wilson's voice and the original level of specificity.
- Match the target language naturally instead of doing word-for-word substitution.

## Content-Type Notes

### Writing

- Preserve the original argument, pacing, and closing conviction.
- Keep paragraphs short when the source is short.
- Reuse the source theme unless there is a clear existing localized convention that requires a translated label in frontmatter.
- Keep tags consistent with the repository's existing localized content strategy; when unsure, preserve the source tags.

### Projects

- Preserve the narrative arc: motivation, problem, approach, and result.
- Keep `type`, `status`, and other enum-like frontmatter values schema-compatible.
- Translate `motivation`, `problemAddressed`, and `learnings` as prose while preserving first-person voice.

## Verification Checklist

- [ ] Source file came from `content/writing` or `content/projects`
- [ ] Locales were discovered from `content/locales` on disk
- [ ] One translated MDX file was created or updated per non-source locale
- [ ] Frontmatter keys still match the source
- [ ] URLs, slugs, code blocks, JSX, and placeholders were preserved
- [ ] The final response lists the translated target files

## Example

If the completed source file is `content/writing/context-aware-agents.mdx` and locale folders include `en`, `es`, and `zh`, create or update:

- `content/locales/es/writing/context-aware-agents.mdx`
- `content/locales/zh/writing/context-aware-agents.mdx`

If the completed source file is `content/projects/agent-workbench.mdx`, create or update:

- `content/locales/es/projects/agent-workbench.mdx`
- `content/locales/zh/projects/agent-workbench.mdx`
