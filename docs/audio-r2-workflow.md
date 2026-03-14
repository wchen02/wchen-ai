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

## Notes

- Normal site builds no longer require audio generation.
- `public/audio/` is ignored by Git.
- If `public/audio/` was previously tracked, remove it from the Git index with:

```bash
git rm --cached -r public/audio
```
