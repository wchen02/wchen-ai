# Newsletter digest images (R2)

Recurring digest emails can show thumbnails from each item’s `ogImage` frontmatter. Those files normally live under `public/writing/...` and `public/projects/...` and are served from the main site. **CI sends the digest before Cloudflare Pages deploy**, so if the HTML points at `https://yoursite.com/writing/.../hero.jpg`, that URL may **404** until the new static files are live.

This repo mirrors eligible images to **object storage** (same Cloudflare R2 bucket and S3-compatible credentials as [read-along audio](./audio-storage-workflow.md)) under keys like `og/writing/...` and `og/projects/...`. The digest then uses `https://<public-base>/og/...`, which is available as soon as the upload step finishes.

## Commands

```bash
pnpm content-images:publish
```

Run locally when testing sends, or rely on CI (see below). The script reads repo-root `.env` itself; you do not need Node’s `--env-file`.

**“Unchanged” lines are normal:** each object on R2 stores a `sha256` in metadata. If the local file’s hash matches, the script does not upload again (same idea as `pnpm audio:publish`). To overwrite every object anyway (e.g. fix bad metadata or CDN cache), run `pnpm content-images:publish -- --force` or set `CONTENT_IMAGES_FORCE_UPLOAD=1`.

## Environment variables

| Variable | Role |
|----------|------|
| `R2_AUDIO_PUBLIC_BASE_URL` | Public URL of the bucket (no trailing slash). Used for digest image URLs when `NEWSLETTER_IMAGE_PUBLIC_BASE_URL` is unset. |
| `NEWSLETTER_IMAGE_PUBLIC_BASE_URL` | Optional. Overrides the public base **only** for digest thumbnails (e.g. if images should use a different host than audio). |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_AUDIO_BUCKET` | Same as `pnpm audio:publish` — required for uploads. |
| `CONTENT_IMAGES_FORCE_UPLOAD` | Optional. Set to `1` / `true` / `yes` to upload every key even when R2 already has the same `sha256`. |

If neither public-base variable is set, the digest keeps using normal site URLs (`absoluteUrl` / `ogImage` as written).

## What gets uploaded

- Only `ogImage` values whose URL is on **your site origin** (from locale `profile.json` URLs, plus optional `NEXT_PUBLIC_SITE_URL`), with path under `/writing/` or `/projects/` after stripping a locale prefix.
- **www** and **apex** hostnames are treated as equivalent.
- **External** `og:image` URLs (other hosts) are unchanged in the email.

The local file path is `public/` + that path (e.g. `https://wchen.ai/writing/foo/bar.png` → `public/writing/foo/bar.png`).

## CI (GitHub Actions)

On `main`, the deploy workflow runs `pnpm content-images:publish` **before** the recurring newsletter send. Configure the **production** environment with:

- **Secrets:** `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- **Variable:** `R2_AUDIO_BUCKET`
- **Variables:** `R2_AUDIO_PUBLIC_BASE_URL` and optionally `NEWSLETTER_IMAGE_PUBLIC_BASE_URL`

Ensure the bucket (or CDN in front of it) allows **anonymous GET** for `og/*` objects, same as for your audio assets.

## Related docs

- [Newsletter setup](./newsletter-setup.md) — mail provider, segments, recurring state
- [Audio storage workflow](./audio-storage-workflow.md) — R2/S3 credentials, bucket, and `audio:publish`
