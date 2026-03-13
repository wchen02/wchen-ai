# Newsletter Setup

For general project setup and shared environment variables, see the [Quickstart](./quickstart.md).

The newsletter system is designed to behave like the rest of this template repo:

- rendering and delivery live in code
- all editable email copy lives under `content/`
- recurring send history is tracked in-repo under `content/`

## Content Files

Update these files first:

- `content/site/newsletter.json`: source of truth for confirmation, welcome, and recurring newsletter email copy
- `content/site/newsletter-state.json`: tracks which writing and project slugs have already been sent as recurring emails
- `content/site/profile.json`: brand metadata such as site name, author name, base URL, and default from-address
- `content/writing/*.mdx`: published writing entries eligible for recurring sends
- `content/projects/*.mdx`: published project entries eligible for recurring sends

`content/site/newsletter.json` is where template users should change subjects, previews, CTA labels, section headings, footer copy, and recurring writing/project email language.

## Environment Variables

Add these to local `.env` and production secrets/vars as needed:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_SEGMENT_ID=seg_your_segment_id_here
NEWSLETTER_SECRET=your-random-32-char-secret-here
# Optional
# NEWSLETTER_FROM=Your Name <newsletter@yourdomain.com>
```

What each one does:

- `RESEND_API_KEY`: used for confirmation, welcome, and recurring sends
- `RESEND_SEGMENT_ID`: the confirmed subscriber segment used as the recurring-send audience
- `NEWSLETTER_SECRET`: signs and verifies double opt-in confirmation links
- `NEWSLETTER_FROM`: optional override for the sender address; otherwise the value from `content/site/profile.json` is used

To find the segment ID in Resend:

1. Log in to [resend.com](https://resend.com).
2. Open `Contacts` -> `Segments`.
3. Create or select the segment you want to use for newsletter subscribers.
4. Copy the segment ID and use it for `RESEND_SEGMENT_ID`.

## Production Configuration

Newsletter configuration is split across two places in production:

- Cloudflare Pages environment variables power the live newsletter runtime endpoints
- GitHub Actions secrets/vars power the CI recurring-send step

### Cloudflare Pages runtime variables

Set these in **Cloudflare Dashboard -> Workers & Pages -> [your project] -> Settings -> Environment variables** for the environments you use:

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | Sends confirmation and welcome emails from the deployed newsletter endpoints |
| `RESEND_SEGMENT_ID` | Yes | Adds confirmed contacts to the correct Resend segment |
| `NEWSLETTER_SECRET` | Yes | Signs and verifies newsletter confirmation links |
| `NEWSLETTER_FROM` | No | Overrides the sender address used by the deployed newsletter emails |

Without those Cloudflare Pages variables, the deployed `functions/api/newsletter.ts` and `functions/api/newsletter-confirm.ts` endpoints will not be fully configured.

### GitHub Actions variables for recurring sends

The recurring newsletter CI step reads from the GitHub `production` environment:

- secret: `RESEND_API_KEY`
- secret: `RESEND_SEGMENT_ID`
- variable: `NEWSLETTER_FROM` (optional)

Important: the current workflow does **not** sync newsletter variables from GitHub to Cloudflare Pages. GitHub configuration only powers the CI recurring-send step. You still need to set the runtime newsletter variables directly in Cloudflare Pages.

## Double Opt-In Flow

The signup flow uses Resend plus a signed confirmation link:

1. `POST /api/newsletter` validates the email address and sends the confirmation email.
2. The confirmation email is rendered from `content/site/newsletter.json`.
3. The confirmation link hits `GET /api/newsletter-confirm`.
4. The contact is added to the configured Resend segment.
5. A welcome email is sent using the same content-driven email layer.

## Local Development Notes

For normal local development, run:

```bash
pnpm dev
```

The app includes local Next.js routes for newsletter signup and confirmation:

- local signups post to `POST /api/newsletter`
- local confirmation emails link to `/newsletter-confirm`
- that page verifies the token through `POST /api/newsletter-confirm-local` and then redirects to `/newsletter-confirmed`

If `NEXT_PUBLIC_SITE_URL` is set, local confirmation emails use it as the base URL. Otherwise the local request origin is used.

## Recurring Send Flow

Recurring sends are handled by:

```bash
pnpm run newsletter:send-recurring
```

The script:

1. loads `content/site/newsletter-state.json`
2. loads published writings and projects from `content/`
3. selects the next unsent item deterministically using oldest-unsent-first order
4. renders the recurring writing/project email using `content/site/newsletter.json`
5. fetches confirmed subscribers from the configured Resend segment
6. sends the email in batches
7. updates `content/site/newsletter-state.json` only after the send succeeds

Important behavior:

- only non-draft writing entries are eligible
- recurring sends are one-at-a-time, not “blast every unsent item”
- if there is no eligible content or no configured newsletter env, the script exits without changing state

## CI Behavior

The GitHub Actions deploy workflow runs the recurring sender only on `main` and only when `RESEND_API_KEY` and `RESEND_SEGMENT_ID` are configured.

After a successful send, CI writes the updated `content/site/newsletter-state.json` back to the repository so the same item is not sent again on the next build.

## Local Testing

Useful commands:

```bash
pnpm test
pnpm typecheck
pnpm run newsletter:send-recurring
```

For a safe local dry run, leave newsletter env vars unset and verify that the script exits cleanly. If you do set live Resend credentials locally, remember that both the signup flow and the recurring script can send real email.
