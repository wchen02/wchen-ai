# Data Model: Site Persona Improvements

**Branch**: `002-site-persona-improvements` | **Date**: 2026-02-27

## Entities

### SocialLink

Centralized in `src/lib/site-config.ts`. Static configuration, not content.

| Field    | Type   | Required | Description                          |
|----------|--------|----------|--------------------------------------|
| platform | string | Yes      | Identifier: "github", "x", "linkedin" |
| label    | string | Yes      | Display label: "GitHub", "X", "LinkedIn" |
| url      | string | Yes      | Full profile URL                     |

**Concrete values**:
- `{ platform: "x", label: "X", url: "https://x.com/wchen_ai" }`
- `{ platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/wchen02/" }`
- `{ platform: "github", label: "GitHub", url: "https://github.com/wenshengchen" }`

### TOCItem

Generated at build time from MDX heading content. Used by `TableOfContents` component.

| Field | Type   | Required | Description                               |
|-------|--------|----------|-------------------------------------------|
| id    | string | Yes      | Slugified heading text (matches rehype-slug output) |
| text  | string | Yes      | Plain text of the heading                 |
| level | number | Yes      | Heading depth: 2 for `##`, 3 for `###`   |

**Extraction**: Parsed from raw MDX content via regex `^(#{2,3})\s+(.+)$` per line. Level 1 headings (`#`) are excluded (reserved for article title). Levels deeper than 3 are excluded for simplicity.

### ThemePreference

Client-side only. Stored in `localStorage` under key `theme`.

| Value    | Meaning                                      |
|----------|----------------------------------------------|
| `"light"` | User explicitly chose light mode             |
| `"dark"`  | User explicitly chose dark mode              |
| (absent) | No user preference; follow system preference |

**State transitions**:
- Initial state: absent (system preference)
- User clicks toggle → stored value cycles: absent → "dark" → "light" → "dark" → ...
- User clears localStorage → reverts to absent (system preference)

### NewsletterPayload

Shared schema in `shared/newsletter.ts`.

| Field   | Type   | Required | Validation                |
|---------|--------|----------|---------------------------|
| email   | string | Yes      | Valid email format (Zod)  |
| _honey  | string | Yes      | Must be empty (honeypot)  |

### NewsletterToken (derived, not stored)

Stateless HMAC token embedded in confirmation URL. Not stored anywhere.

| Component | Type   | Description                                       |
|-----------|--------|---------------------------------------------------|
| email     | string | The subscriber's email (URL-encoded)              |
| ts        | string | Unix timestamp of token creation                  |
| sig       | string | HMAC-SHA256(NEWSLETTER_SECRET, email + "|" + ts)  |

**Validity**: Token expires 24 hours after `ts`. Signature is verified by recomputing HMAC.

## Relationships

```
SocialLink[] ──referenced by──▶ layout.tsx (header icons, footer links)
                               ──▶ about/page.tsx (JSON-LD Person sameAs)
                               ──▶ site-config.ts (single source of truth)

Writing ──has many──▶ TOCItem[] (extracted at build time from content)
Writing ──related to──▶ Writing[] (matched by theme, then tags, then recency)

NewsletterPayload ──validated by──▶ functions/api/newsletter.ts
NewsletterToken ──verified by──▶ functions/api/newsletter-confirm.ts
```

## Existing Entities (unchanged)

- **Writing**: No schema changes. The `theme` and `tags` fields are used for related post matching.
- **Project**: No changes.
- **ContactPayload**: No changes. Newsletter uses a separate schema and endpoint.
