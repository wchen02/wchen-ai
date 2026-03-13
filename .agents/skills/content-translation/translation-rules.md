# Translation Rules

Use this reference when translating shared writing or project MDX entries into locale-specific files.

## Preserve Structure

- Keep the same filename and slug.
- Keep frontmatter keys identical to the source.
- Preserve heading depth, paragraph breaks, blockquotes, lists, emphasis, and link structure.
- Preserve code fences, code content, JSX/MDX components, import statements, and inline code.

## Preserve Non-Translatable Values

Do not translate these unless the repository clearly stores localized prose in that field:

- URLs and email addresses
- file paths and route paths
- slugs
- ISO dates and timestamps
- booleans
- enum-like values such as `active`, `archived`, `in-progress`, `app`, `agent`, `experiment`, `skill`, `library`, `tool`
- placeholders and tokens such as `{siteName}`, `{authorName}`, or `<Component prop="value" />`

## Frontmatter Guidance

### Writing frontmatter

- Usually translate: `title`
- Usually preserve: `publishDate`, `updatedAt`, `theme`, `featured`, `draft`
- Preserve tags unless there is an established localized tagging convention in the repo

### Project frontmatter

- Usually translate: `title`, `motivation`, `problemAddressed`, `learnings`
- Preserve schema values like `date`, `status`, `type`, `featured`
- Preserve `url` and `github`

## Quality Bar

- Keep the author's first-person voice when the source is first person.
- Translate for clarity and idiomatic flow, not literal wording.
- Keep the same confidence level, technical precision, and rhetorical shape.
- Do not add new claims, examples, or sections that are not in the source.

## Safety Checks

- If the source file is already under `content/locales/<locale>/...`, stop and do not fan out translations from it.
- If a locale directory exists but the translated content would be unsafe or ambiguous, report that explicitly instead of silently skipping it.
- After writing translations, confirm the target files live under the correct locale and content-type directory.
