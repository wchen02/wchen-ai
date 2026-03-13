# Images in writing and project entries

Use this guide when adding, sourcing, or placing images in writing or project MDX. For paths and syntax (where files go, how to reference in MDX), see [content-schemas.md](content-schemas.md).

## When to use images

Images are optional. Use them when they support the article or project—e.g. hero, diagram, concept, or key visual. Do not add images purely for decoration.

## Sourcing royalty-free images

- **Sources**: Use only sources that allow commercial use without payment. Examples: **Unsplash**, **Pexels**, **Pixabay**. Prefer CC0 or equivalent licenses.
- **Relevance**: Choose images that match the piece: theme, title, or key concepts. E.g. for "Build-time validation" consider validation, checklist, or quality; for "GitHub as backend" consider code or collaboration.
- **Attribution**: If a source requires attribution, add it in the image `alt` or in a short caption in the MDX (e.g. "Photo by [Name] on [Unsplash](url).").
- **Save and reference**: After selecting an image, download it and save to the correct folder: `public/writing/<slug>/` for a writing entry or `public/projects/<slug>/` for a project entry. Use a descriptive filename (e.g. `hero.png`, `validation-flow.png`). Add `![Meaningful alt](/writing/<slug>/filename.ext)` or `![Meaningful alt](/projects/<slug>/filename.ext)` in the MDX where it best supports the narrative.

## User-provided image

When the user provides an image (file path, attachment, or uploaded file):

1. **Save**: Copy or save it into the appropriate folder for the entry: `public/writing/<slug>/` for a writing entry or `public/projects/<slug>/` for a project entry. Use a clear filename (e.g. `hero.png`, `screenshot.png`).
2. **Reference**: Add the Markdown image in the MDX: `![Descriptive alt](/writing/<slug>/filename.ext)` or `![Descriptive alt](/projects/<slug>/filename.ext)`.
3. **Placement**: If the user specifies where (e.g. "after the second paragraph"), insert there. Otherwise place where it best supports the narrative (e.g. after the first H2 or key section).
