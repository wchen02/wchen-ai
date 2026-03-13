# Contact form: Cloudflare + Mailgun setup

For general project setup (clone, install, env file), see the [Quickstart](./quickstart.md).

The contact form is handled by a Cloudflare Pages Function (`functions/api/contact.ts`). Emails are sent via **Mailgun**. Mailgun offers a [free tier](https://www.mailgun.com/pricing/) (e.g. 3,000 emails/month, then pay-as-you-go); for a personal site you can use a sending domain and stay within free/low usage.

## 1. Mailgun setup

1. Sign up at [Mailgun](https://www.mailgun.com/) and verify your account.
2. In the Mailgun dashboard, add and verify your **sending domain** (for example `yourdomain.com` or a subdomain like `mg.yourdomain.com`). Follow their DNS instructions (MX, TXT for verification and DKIM).
3. Create an **API key**: **Sending** → **Domain settings** → **Sending API keys**, or use the primary API key from **Account** → **API keys**. Store it securely; you’ll add it as a secret in Cloudflare.

## 2. Environment variables (CI and production)

For **production** the contact function needs these at runtime. You can provide them in either place (or both):

### Option A: GitHub Actions (recommended for CI)

Add these to your GitHub repository’s **production** environment so the workflow can sync them to Cloudflare Pages on each deploy:

- **Variables:** `CONTACT_TO_EMAIL`, `MAILGUN_DOMAIN` (required). Optional: `MAILGUN_FROM_EMAIL`, `MAILGUN_EU`.
- **Secret:** `MAILGUN_API_KEY`.

Path: **GitHub repo → Settings → Environments → production → Environment variables / Environment secrets.**

The workflow (`.github/workflows/ci.yml`) syncs these to the Cloudflare Pages project before deploy when `CONTACT_TO_EMAIL` and `MAILGUN_DOMAIN` are set.

### Option B: Cloudflare Dashboard

Set them directly in Cloudflare so the contact function can send mail:

1. Go to **Cloudflare Dashboard → Workers & Pages → [your project] → Settings → Environment variables**.
2. Add for **Production** (and optionally **Preview**):


| Variable             | Example                           | Description                                                             |
| -------------------- | --------------------------------- | ----------------------------------------------------------------------- |
| `CONTACT_TO_EMAIL`   | `you@yourdomain.com`              | Where contact form submissions are delivered.                           |
| `MAILGUN_API_KEY`    | *(secret)*                        | Your Mailgun API key. Add as **Encrypted** (secret).                    |
| `MAILGUN_DOMAIN`     | `yourdomain.com` or `mg.yourdomain.com` | Your verified Mailgun sending domain.                              |
| `MAILGUN_FROM_EMAIL` | `Contact Form <noreply@mg.yourdomain.com>` | Optional. Defaults to `Contact Form <noreply@{MAILGUN_DOMAIN}>`. |
| `MAILGUN_EU`         | `1`                               | Optional. Set to `1` to use the EU API endpoint (`api.eu.mailgun.net`). |


Emails are sent with the submitter’s name and email as **Reply-To**, so you see who wrote and can reply directly. The **From** address is your configured sending address (to satisfy Mailgun’s domain verification).

1. Save. Redeploy the project (or push a new commit) so the new env vars are used.

If you use Option A and the sync step fails in CI, add or fix the same variables in the Cloudflare dashboard (Option B) and redeploy.

## 3. Verify and monitor

- **Test the form** on the live site and check that the email arrives at `CONTACT_TO_EMAIL`.
- **Real-time logs:** **Workers & Pages → [project] → Logs** (or `wrangler pages deployment tail`). You’ll see `console.log`/`console.error` from the contact function (e.g. “Mailgun error: …” if send fails).
- **Analytics:** **Workers & Pages → [project] → Analytics** for request counts and errors on `/api/contact`.

If you don’t receive mail, check:

- Domain is verified in Mailgun and DNS has propagated.
- `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` are set (and `MAILGUN_EU` if using EU).
- Logs for 4xx/5xx from Mailgun or for missing env vars.

## 4. Local development

For day-to-day local development, run:

```bash
pnpm dev
```

The app includes a local Next.js implementation of `POST /api/contact`, so you can test the contact form without going through Cloudflare Pages Functions first.

Behavior locally:

- if `CONTACT_TO_EMAIL`, `MAILGUN_API_KEY`, and `MAILGUN_DOMAIN` are set, submissions send through Mailgun
- if those vars are missing, the endpoint still returns success but does not send email (`Development mode: Message received but not sent.`)

If you specifically want Cloudflare runtime parity, build the static output and run Pages locally:

```bash
pnpm build
pnpm dlx wrangler pages dev out
```

You can also keep local-only secrets in `.dev.vars` when using Wrangler (see [Wrangler docs](https://developers.cloudflare.com/workers/configuration/configuration-management/local-development/)).