# Quickstart

This repository is a static-first personal site template built with Next.js, MDX content, and Cloudflare Pages.

## Prerequisites

- Node.js 18+
- `pnpm`
- Optional: a GitHub personal access token for fetching contribution data during builds
- Optional: Cloudflare Pages and Mailgun/Resend accounts if you plan to use the contact form or newsletter in production

## Installation

1. Clone the repository and enter the project directory.
2. Install dependencies:

```bash
pnpm install
```

3. Copy `.env.example` to `.env` and fill in the values you need.

## Environment Variables

Common local variables:

```env
# Build-time GitHub contributions fetch
GH_TOKEN=github_pat_your_token_here
GH_USERNAME=your-github-username

# Site URL used by some local email flows
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Contact form
CONTACT_TO_EMAIL=you@yourdomain.com
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_API_KEY=mailgun_api_key_here

# Newsletter
RESEND_API_KEY=re_your_api_key_here
RESEND_SEGMENT_ID=seg_your_segment_id_here
NEWSLETTER_SECRET=your-random-32-char-secret-here
# Optional
# NEWSLETTER_FROM=Your Name <newsletter@yourdomain.com>
```

Use the dedicated guides for full provider setup and production environment configuration:

- [Contact form setup](./contact-form-setup.md)
- [Newsletter setup](./newsletter-setup.md)

## Main Content Entry Points

Most rebranding and site copy updates happen here:

- `content/locales/en/site/profile.json` for site identity, social links, metadata defaults, and locale settings
- `content/locales/en/site/home.json` for homepage hero and section copy
- `content/locales/en/site/about.json` for about-page narrative and principles
- `content/locales/en/site/newsletter.json` for newsletter email copy
- `content/locales/en/site/ui.json` for reusable UI labels, metadata fragments, empty states, and theme descriptors
- `content/locales/en/site/forms.json` for form labels, placeholders, and button copy
- `content/locales/en/site/system.json` for validation, API, and status messages
- `content/site/newsletter-state.json` for recurring-send history
- `content/locales/<locale>/projects/*.mdx` for localized projects, with fallback to `content/projects/*.mdx`
- `content/locales/<locale>/writing/*.mdx` for localized writing, with fallback to `content/writing/*.mdx`
- `public/headshot.jpg`, `public/og-default.svg`, and `public/favicon.svg` for brand assets

## Adding Content

Content stays in the repository under `content/`; no database or CMS is required.

- Add or edit site copy by updating the files under `content/locales/en/site/`
- Add a new project by creating a file in `content/locales/en/projects/` or `content/projects/` and following the structure of an existing project entry
- Add a new writing entry by creating a file in `content/locales/en/writing/` or `content/writing/` and following an existing writing entry
- Add a new locale by mirroring `content/locales/en/` under a new locale directory, then register it in `src/lib/content.ts`
- Frontmatter is validated during builds, so it is safest to copy a nearby example and edit it rather than start from scratch

## Local Development

Start the app with:

```bash
pnpm dev
```

This is the normal local workflow. It serves the site and the local Next.js API routes used by the contact form and newsletter signup flow.

## Validation

Useful commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm validate:metadata
```

Notes:

- `pnpm build` runs the prebuild scripts that validate links, generate RSS/sitemap/search assets, and fetch GitHub contribution data when credentials are available.
- `pnpm validate:metadata` validates required metadata and structured-data output after a build.
- `pnpm run newsletter:send-recurring` sends a real recurring newsletter when newsletter env vars are configured. Leave those vars unset if you only want to verify that the script exits safely.

## Deployment

Deployments run through GitHub Actions on pushes to `main`.

The CI workflow:

- installs dependencies
- runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`
- runs the recurring newsletter sender on `main` when newsletter credentials are configured
- persists `content/site/newsletter-state.json` back to the repo after a successful recurring send
- deploys the built site to Cloudflare Pages

For production runtime features, remember that Cloudflare Pages environment variables are separate from GitHub Actions secrets. In particular, the live newsletter subscribe/confirm endpoints need their newsletter variables configured in Cloudflare Pages. See `docs/newsletter-setup.md` for the exact split.
