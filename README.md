Static-first personal site template built with Next.js, MDX content, and Cloudflare Pages. Contact form delivery is handled by a Cloudflare Pages Function and Mailgun.

## Quickstart

See **[Quickstart Guide](specs/001-personal-website/quickstart.md)** for:

- Prerequisites (Node.js, pnpm, Wrangler)
- Installation and environment variables (`.env` from `.env.example`)
- Development (`pnpm dev`, testing the contact API with `wrangler pages dev`)
- Adding content (projects, writing)
- Testing and deployment (Cloudflare Pages via GitHub Actions)

## Template Entry Points

Most personalization now lives in a few files:

- `content/site/profile.json` for name, domain, socials, metadata defaults, newsletter copy, and shared UI copy
- `content/site/home.json` for homepage hero and section copy
- `content/site/about.json` for biography, expertise, background, and principles
- `content/projects/*.mdx` for seeded project entries
- `content/writing/*.mdx` for seeded writing entries
- `public/headshot.jpg`, `public/og-default.svg`, and `public/favicon.svg` for replaceable brand assets
- `.env.example` for the deploy-time integration contract

Template users should be able to rebrand the site mostly by editing those files instead of touching TSX.

## Contact form

Contact form setup (Mailgun, Cloudflare env vars, local dev): [docs/contact-form-setup.md](docs/contact-form-setup.md).
