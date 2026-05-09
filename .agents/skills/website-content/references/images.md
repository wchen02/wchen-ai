# Images in writing and project entries

Use this guide when adding, sourcing, or placing images in writing or project MDX. For paths and syntax (where files go, how to reference in MDX), see [content-schemas.md](content-schemas.md).

## Feature images are required

Every new writing, investing, and project entry must include a feature image. Use it as the entry's main visual, place it near the opening of the MDX body, and set `ogImage` in frontmatter to the absolute site URL for the same file.

Use images that support the article or project: hero, diagram, concept, screenshot, or key visual. Do not add generic decoration. Feature images must be 16:9 raster assets (`.jpg` or `.png`), not `.svg`. If no perfect image is available, create or source a simple concept image that clarifies the post's core idea.

## Investing feature image style

For investing posts, prefer a bold editorial thumbnail style rather than a quiet abstract illustration. Make the image feel like a serious market note with strong visual hierarchy:

- Use a 16:9 composition with high contrast, cinematic lighting, and dark market-screen backgrounds.
- Include large headline-style typography when the image tool can render it cleanly. Keep text short: title fragments like `AI MEMORY, SEMIS & SPACE`, `MOVING AWAY FROM 0DTE`, `HIGH-CONVICTION WATCHLIST`, `RISK, EMOTION & BETTER SETUPS`.
- Use market-native visuals: candlestick charts, green/red price action, volatility panels, chip wafers, data centers, rockets/satellites, dashboards, notebooks, trade plans, calendars, or risk checklists.
- Match the post's investing kind: watchlists can show tier cards, tickers, theme labels, and asset imagery; process notes can show dashboards, traffic-light rules, journals, and decision checklists; trading lessons can contrast the bad setup versus the preferred setup.
- Use red for danger, emotion, drawdowns, or avoid zones; use green/blue for preferred setups, discipline, watchlists, and constructive risk.
- Avoid tiny unreadable labels, fake brokerage UI that implies real performance, brand logos, or claims that turn the post into financial advice.

## Sourcing royalty-free images

- **Sources**: Use only sources that allow commercial use without payment. Examples: **Unsplash**, **Pexels**, **Pixabay**. Prefer CC0 or equivalent licenses.
- **Relevance**: Choose images that match the piece: theme, title, or key concepts. E.g. for "Build-time validation" consider validation, checklist, or quality; for "GitHub as backend" consider code or collaboration.
- **Attribution**: If a source requires attribution, add it in the image `alt` or in a short caption in the MDX (e.g. "Photo by [Name] on [Unsplash](url).").
- **Save and reference**: After selecting an image, crop or export it at 16:9, then download it and save to the correct folder: `public/writing/<slug>/` for writing/investing entries or `public/projects/<slug>/` for project entries. Prefer `feature.jpg`, `feature.png`, `hero.jpg`, or `hero.png` for the main image; do not use SVG for feature images. Add `ogImage: "https://wchen.ai/writing/<slug>/feature.jpg"` or `ogImage: "https://wchen.ai/projects/<slug>/hero.jpg"` in frontmatter. Add `![Meaningful alt](/writing/<slug>/feature.jpg)` or `![Meaningful alt](/projects/<slug>/hero.jpg)` in the MDX where it best supports the narrative.

## User-provided image

When the user provides an image (file path, attachment, or uploaded file):

1. **Save**: Copy or save it into the appropriate folder for the entry: `public/writing/<slug>/` for a writing entry or `public/projects/<slug>/` for a project entry. Use a clear `.jpg` or `.png` filename for feature images (e.g. `hero.png`, `screenshot.png`). If the provided feature image is SVG, convert it to PNG before referencing it; if it is not 16:9, crop or pad it to 16:9.
2. **Reference**: Set `ogImage` to the absolute site URL and add the Markdown image in the MDX: `![Descriptive alt](/writing/<slug>/feature.jpg)` or `![Descriptive alt](/projects/<slug>/hero.png)`.
3. **Placement**: If the user specifies where (e.g. "after the second paragraph"), insert there. Otherwise place where it best supports the narrative (e.g. after the first H2 or key section).

## Final checks

- Feature image file exists under `public/writing/<slug>/` or `public/projects/<slug>/` as a 16:9 `.jpg` or `.png`, not `.svg`
- Frontmatter `ogImage` points to the absolute `https://wchen.ai/...` URL for that image
- Body includes the image with root-relative `/writing/...` or `/projects/...` path
- Alt text describes the image meaningfully, not just "feature image"
