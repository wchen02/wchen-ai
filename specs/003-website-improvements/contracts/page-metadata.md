# Contract: Page metadata and structured data

**Feature**: 003-website-improvements  
**Consumers**: Crawlers, social platforms, validators; layout and page components (producers)

All pages must expose consistent metadata and, where applicable, JSON-LD. Defaults come from a single source (see data-model: Metadata defaults).

## Required meta tags (all page types)

- `title`: Page-specific or default "Wilson Chen | …"
- `description`: Page-specific or default site description
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type` (website or article), `og:site_name`, `og:locale`
- `twitter:card` (e.g. summary_large_image), `twitter:site`, `twitter:title`, `twitter:description`, `twitter:image`
- `link rel="canonical"` href: absolute URL in canonical form (no trailing slash)

## Page-type specifics

- **Home**: Default title/description; canonical = SITE_URL; og:type = website
- **About**: Page title/description; Person JSON-LD (name, url, jobTitle, sameAs, image)
- **Writing index / Projects index**: Section title and description; canonical = SITE_URL/path; og:type = website
- **Writing [slug]**: Article title, excerpt as description, optional per-article og:image; Article JSON-LD (headline, author Person ref, datePublished, dateModified?, description, url, image)

## JSON-LD

- **Person** (about): @type Person; name; url; jobTitle?; sameAs[]; image (URL)
- **Article** (writing): @type Article; headline; author { @type Person, name, url }; datePublished; dateModified?; description; url; image (URL)

## Validation

- CI or prebuild script checks presence of required meta and JSON-LD on critical routes (home, about, writing index, one writing, projects index).
- Fail build or report clearly when required fields are missing or invalid.
