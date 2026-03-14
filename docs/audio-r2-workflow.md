# Audio R2 Workflow

Generated audio is treated as a local artifact, not a Git-tracked asset.

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
2. Run `pnpm audio:generate`.
3. Sanity check the local page/audio behavior.
4. Run `pnpm audio:publish`.
5. Deploy the site with `AUDIO_SOURCE=r2`.

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

- Normal site builds no longer require audio generation.
- `public/audio/` is ignored by Git.
- If `public/audio/` was previously tracked, remove it from the Git index with:

```bash
git rm --cached -r public/audio
```
