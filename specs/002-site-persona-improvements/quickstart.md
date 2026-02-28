# Quickstart: Site Persona Improvements

**Branch**: `002-site-persona-improvements`

## Prerequisites

- Node.js v18+
- pnpm
- Existing dev environment from `specs/001-personal-website`
- Resend account with API key ([resend.com](https://resend.com))

## Setup

### 1. Install new dependency

```bash
pnpm add rehype-slug
```

### 2. Environment variables

Add to `.env`:

```env
# Newsletter (Resend)
RESEND_API_KEY=re_xxxxxxxxx
RESEND_SEGMENT_ID=seg_xxxxxxxxx
NEWSLETTER_SECRET=your-random-32-char-secret-here
```

To get the segment ID:
1. Log into [resend.com](https://resend.com)
2. Navigate to Contacts → Segments
3. Create a segment named "Newsletter Subscribers"
4. Copy the segment ID

### 3. Headshot image

Place a professional headshot at `public/headshot.jpg`. Recommended dimensions: 400x400px, optimized for web.

If not available, the implementation will render a placeholder with initials.

### 4. Cloudflare Pages environment variables

Sync the new environment variables to Cloudflare Pages:

```bash
npx wrangler pages secret put RESEND_API_KEY
npx wrangler pages secret put RESEND_SEGMENT_ID
npx wrangler pages secret put NEWSLETTER_SECRET
```

## Development

```bash
pnpm dev          # Next.js dev server (all static features work)
pnpm dev:wrangler # Wrangler dev (for testing newsletter edge functions)
```

## Testing

```bash
pnpm typecheck    # Verify all new types compile
pnpm test         # Unit tests (extractHeadings, getRelatedWritings, etc.)
pnpm test:e2e     # E2E tests (active nav, dark mode toggle, share button)
```

## Key files to review after implementation

| File | What changed |
|------|-------------|
| `src/lib/site-config.ts` | New — social links config |
| `src/app/layout.tsx` | Social icons in header, active nav, theme toggle, twitter meta |
| `src/app/globals.css` | Class-based dark mode |
| `src/app/about/page.tsx` | Headshot, background narrative, JSON-LD Person |
| `src/app/writing/[slug]/page.tsx` | JSON-LD Article, TOC, share, read next, newsletter |
| `functions/api/newsletter.ts` | Newsletter subscribe endpoint |
| `functions/api/newsletter-confirm.ts` | Double opt-in confirmation endpoint |
