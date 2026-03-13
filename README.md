Static-first personal site template built with Next.js, MDX content, and Cloudflare Pages. Contact form delivery is handled by a Cloudflare Pages Function and Mailgun.

## Quickstart

Start with **[docs/quickstart.md](docs/quickstart.md)** for installation, environment variables, local development, validation commands, and deployment behavior.

## Template Entry Points

Most personalization now lives in a few content files:

- `content/locales/en/site/profile.json` for name, domain, socials, metadata defaults, locale settings, and shared site identity
- `content/locales/en/site/home.json` for homepage hero and section copy
- `content/locales/en/site/about.json` for biography, expertise, background, and principles
- `content/locales/en/site/newsletter.json` for newsletter subjects, previews, CTA labels, confirmation/welcome copy, and recurring issue email copy
- `content/locales/en/site/ui.json` for shared UI strings, labels, status text, and theme descriptors
- `content/locales/en/site/forms.json` for contact/newsletter form labels, placeholders, and button copy
- `content/locales/en/site/system.json` for validation, API, and fallback status messages
- `content/site/newsletter-state.json` for recurring newsletter send history
- `content/locales/<locale>/projects/*.mdx` for localized project entries, with fallback to `content/projects/*.mdx`
- `content/locales/<locale>/writing/*.mdx` for localized writing entries, with fallback to `content/writing/*.mdx`
- `public/headshot.jpg`, `public/og-default.svg`, and `public/favicon.svg` for replaceable brand assets
- `.env.example` for the deploy-time integration contract

To add another language, mirror the `content/locales/en/` structure under a new locale directory and add it to the locale registry in `src/lib/content.ts`.

## Contact form

Contact form setup (Mailgun, Cloudflare env vars, local dev): [docs/contact-form-setup.md](docs/contact-form-setup.md).

## Newsletter

Newsletter setup and recurring-send behavior: [docs/newsletter-setup.md](docs/newsletter-setup.md).
