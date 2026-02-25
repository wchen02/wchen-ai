Personal website (wchen.ai): static-first Next.js site with MDX content, deployed to Cloudflare Pages. Contact form is handled by a Cloudflare Pages Function and Mailgun.

## Quickstart

See **[Quickstart Guide](specs/001-personal-website/quickstart.md)** for:

- Prerequisites (Node.js, pnpm, Wrangler)
- Installation and environment variables (`.env` from `.env.example`)
- Development (`pnpm dev`, testing the contact API with `wrangler pages dev`)
- Adding content (projects, writing)
- Testing and deployment (Cloudflare Pages via GitHub Actions)

## Contact form

Contact form setup (Mailgun, Cloudflare env vars, local dev): [docs/contact-form-setup.md](docs/contact-form-setup.md).
