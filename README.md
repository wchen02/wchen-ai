Static-first personal site template built with Next.js, MDX content, and Cloudflare Pages. Contact form delivery is handled by a Cloudflare Pages Function and Mailgun.

## Quickstart

Start with **[docs/quickstart.md](docs/quickstart.md)** for installation, environment variables, local development, validation commands, and deployment behavior.

## Template Entry Points

Most personalization now lives in a few files:

- `content/site/profile.json` for name, domain, socials, metadata defaults, and shared UI copy
- `content/site/home.json` for homepage hero and section copy
- `content/site/about.json` for biography, expertise, background, and principles
- `content/site/newsletter.json` for newsletter subjects, previews, CTA labels, confirmation/welcome copy, and recurring issue email copy
- `content/site/newsletter-state.json` for recurring newsletter send history
- `content/projects/*.mdx` for seeded project entries
- `content/writing/*.mdx` for seeded writing entries
- `public/headshot.jpg`, `public/og-default.svg`, and `public/favicon.svg` for replaceable brand assets
- `.env.example` for the deploy-time integration contract

Template users should be able to rebrand the site mostly by editing those files instead of touching TSX.

## Contact form

Contact form setup (Mailgun, Cloudflare env vars, local dev): [docs/contact-form-setup.md](docs/contact-form-setup.md).

## Newsletter

Newsletter setup and recurring-send behavior: [docs/newsletter-setup.md](docs/newsletter-setup.md).
