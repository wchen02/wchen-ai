# Audio R2 Workflow

Generated audio is treated as a local artifact, not a Git-tracked asset. **Audio generation and publishing are not part of the normal build or CI**—run `pnpm audio:generate` and `pnpm audio:publish` locally, then push; the CI build only needs `AUDIO_SOURCE` and `R2_AUDIO_PUBLIC_BASE_URL` so the deployed app uses R2 for playback.

## Local Development

Generate local audio files when you want read-along audio in development:

```bash
pnpm audio:generate
```

This writes files under `public/audio/`, including `audio-manifest.json`. Local development continues to serve them from `/audio/...`.

## Production Delivery

Production builds can resolve audio directly from a public R2 bucket instead of from checked-in files.

Set these environment variables in the production build environment:

```bash
AUDIO_SOURCE=r2
R2_AUDIO_PUBLIC_BASE_URL=https://pub-your-bucket-id.r2.dev
```

If your manifest is not published at `<public base>/audio-manifest.json`, also set:

```bash
R2_AUDIO_MANIFEST_URL=https://pub-your-bucket-id.r2.dev/audio-manifest.json
```

## Publishing Audio To R2

After generating audio locally, upload it with:

```bash
pnpm audio:publish
```

Required environment variables for upload:

```bash
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_AUDIO_BUCKET=your-audio-bucket-name
```

The publish script:

- uploads `.mp3`, `.mp3.json`, and `audio-manifest.json`
- keeps object keys stable, for example `en/writing/post-slug.mp3`
- uploads `audio-manifest.json` at bucket root
- skips unchanged objects by comparing a stored SHA-256 hash in object metadata

## Recommended Workflow

1. Create or update content.
2. Run `pnpm audio:generate` locally.
3. Sanity check the local page/audio behavior.
4. Run `pnpm audio:publish` locally (requires R2 env in `.env` or shell).
5. Push to trigger CI (or deploy manually). The build does **not** run audio steps; set `AUDIO_SOURCE=r2` and `R2_AUDIO_PUBLIC_BASE_URL` in your GitHub production environment (or Cloudflare Pages env) so the built app uses R2 for playback.

## Troubleshooting: Audio not working in production

1. **Build-time environment variables**
   - Audio source and R2 base URL are read at **build time** (when `next build` runs). The environment that runs the build must have:
     - `AUDIO_SOURCE=r2`
     - `R2_AUDIO_PUBLIC_BASE_URL=https://cdn.wchen.ai` (or your R2 public/custom domain, no trailing slash)
   - **GitHub Actions CI:** Add **variables** `AUDIO_SOURCE` (value `r2`) and `R2_AUDIO_PUBLIC_BASE_URL` in the repo’s **production** environment (Settings → Environments → production). The workflow passes them into the build step.
   - **Cloudflare Pages (build on Cloudflare):** Project → **Settings** → **Environment variables** → add both for **Production** (and **Preview** if you use it), then **Redeploy** so the next build sees them.
   - Without these, the build uses local audio (`/audio/...`). Since `public/audio/` is gitignored and CI does not run audio generation, those URLs 404 in production and the player may not appear or playback fails.

2. **R2/CDN returning 4xx/5xx for the MP3**
   - Open the audio URL directly (e.g. `https://cdn.wchen.ai/en/writing/static-first.mp3`). If you get 404, 500, or another error, fix the bucket/custom domain before expecting playback.
   - Common causes: custom domain not **Active**, R2 public access not enabled for the bucket, or a Worker in front that errors on Range requests (browsers send Range for `<audio>`). If using a custom domain, try the default R2 public URL (`https://pub-xxxx.r2.dev`) temporarily to confirm the bucket serves the file.

3. **Player not shown at all**
   - The build fetches the manifest from `R2_AUDIO_PUBLIC_BASE_URL/audio-manifest.json`. If that fetch failed at build time (wrong URL, network, or env not set), the manifest is empty and every page gets `hasAudio: false`, so no player is rendered. Fix step 1 and redeploy.

## Troubleshooting: Audio not playing locally with R2

If you set `AUDIO_SOURCE=r2` and published to R2 but cannot listen locally:

1. **Confirm the manifest and audio are reachable**
   - With `R2_AUDIO_PUBLIC_BASE_URL=https://cdn.wchen.ai`, open in a browser:
     - `https://cdn.wchen.ai/audio-manifest.json` — should return JSON with `en`, `writing`, `projects`, etc.
     - `https://cdn.wchen.ai/en/writing/static-first.mp3` (or any slug you have) — should play or download.
   - If either returns 404 or doesn’t load, the bucket is not being served at that base URL (see step 2).

2. **R2 custom domain**
   - The base URL (e.g. `https://cdn.wchen.ai`) must point at your R2 bucket with **public access**.
   - In Cloudflare: R2 → your bucket → **Settings** → **Public access** → **Custom Domains** → connect `cdn.wchen.ai` (or the host you use). Wait until status is **Active**.
   - If you use the default R2 public URL instead, set `R2_AUDIO_PUBLIC_BASE_URL=https://pub-xxxx.r2.dev` (no trailing slash).

3. **Restart the dev server**
   - The app caches the remote manifest for the lifetime of the process. If the first run happened when the URL was wrong or the domain wasn’t active, restart `pnpm dev` so the manifest is fetched again.

4. **Use local audio for development**
   - To avoid depending on R2 while developing, set `AUDIO_SOURCE=local` (or unset it), run `pnpm audio:generate`, and serve from `public/audio/`. Switch back to `AUDIO_SOURCE=r2` for production builds.

## CORS for read-along (subtitle JSON)

When the site is served from a different origin than the audio CDN (e.g. `http://localhost:3000` or `https://wchen.ai` vs `https://cdn.wchen.ai`), the browser blocks the app from reading the **subtitle JSON** (`.mp3.json`) via `fetch()` unless the CDN sends CORS headers. Audio playback still works (the `<audio>` element can load cross-origin MP3s), but read-along highlighting will fail and the console will show a CORS error.

**Fix:** Configure CORS on your R2 bucket so GET responses include `Access-Control-Allow-Origin` for your app’s origins.

1. In **Cloudflare Dashboard**: R2 → your bucket → **Settings** → **CORS policy**.
2. Add a rule (or use the API) that allows:
   - **Allowed origins**: `https://wchen.ai`, `http://localhost:3000` (and `http://localhost:3001` if you use it), or `*` if you are okay with any origin.
   - **Allowed methods**: `GET`, `HEAD`.
   - **Allowed headers**: (none required for simple GET).
3. Save. If the bucket is exposed via a custom domain (e.g. `cdn.wchen.ai`), that domain will use the bucket’s CORS policy.

**Example CORS policy** (Dashboard: R2 → bucket → Settings → CORS policy → Add CORS policy, paste JSON):

```json
[
  {
    "AllowedOrigins": ["https://wchen.ai", "http://localhost:3000"],
    "AllowedMethods": ["GET", "HEAD"]
  }
]
```

If you use a custom domain and assets were already cached, [purge the cache](https://developers.cloudflare.com/cache/how-to/purge-cache/) for that hostname so responses include the new CORS headers.

See [Configure CORS (R2)](https://developers.cloudflare.com/r2/buckets/cors/) and [Put Bucket CORS](https://developers.cloudflare.com/api/operations/r2-put-bucket-cors-policy) for API/details.

## Notes

- **Prebuild and CI do not run audio.** The `prebuild` script does not include `audio:generate` or `audio:publish`. Run them locally when you add or change content that should have read-along audio, then push; CI builds with `AUDIO_SOURCE` and `R2_AUDIO_PUBLIC_BASE_URL` so the app points to R2.
- `public/audio/` is ignored by Git.
- If `public/audio/` was previously tracked, remove it from the Git index with:

```bash
git rm --cached -r public/audio
```
