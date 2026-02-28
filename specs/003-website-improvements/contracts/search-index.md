# Contract: Static search index (optional)

**Feature**: 003-website-improvements  
**Producer**: Build script (e.g. `scripts/generate-search-index.ts`)  
**Consumer**: Client-side search UI (writing index or global search)

When on-site search is implemented, the index is generated at build time and consumed in the browser. No runtime API.

## Index shape (JSON)

```json
{
  "writings": [
    {
      "slug": "string",
      "title": "string",
      "theme": "string",
      "tags": ["string"]
    }
  ],
  "themes": ["string"]
}
```

- **writings**: One entry per non-draft writing; slug, title, theme, tags sufficient for client-side filter/match.
- **themes**: Unique list of theme keys; optional, for quick filter chips.

## Producer

- Reads all writings via existing `getWritings()` (or equivalent); outputs JSON to `public/search-index.json` or inlines in a script tag. Schema-validate before write.

## Consumer

- Loads index once (e.g. from `/search-index.json` or inlined); filters by substring match on title, theme, or tags. No network request after initial load if inlined. Empty query or no match shows empty state (spec: clear message, optional "browse by theme").

## Optional

- Add `excerpt` or `description` to each entry for richer result snippets; keep payload small (current spec does not require snippets).
