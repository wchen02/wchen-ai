# Research & Technical Decisions

## 1. Testing Framework

**Context**: The application logic involves parsing MDX files, validating frontmatter with Zod, and generating pages statically. We also need to test the contact form API (Cloudflare Worker).
**Decision**: Use **Vitest** for unit/integration testing and **Playwright** for E2E testing.
**Rationale**: Vitest is fast, native to modern build tooling, and works well with TypeScript and ESM. Playwright will allow us to easily test the static output and ensure no JavaScript errors occur on the generated pages. Both easily integrate into GitHub Actions to enforce the "CI Is the Gatekeeper" constitution principle.
**Alternatives considered**: Jest (slower, requires more config for TS/ESM), Cypress (slower than Playwright, slightly harder to configure for basic static checks).

## 2. Markdown / MDX Processing

**Context**: Content is the source of truth, stored in `/content` as Markdown/MDX. Next.js App Router needs to statically generate routes based on these files.
**Decision**: Use **`next-mdx-remote`** combined with standard Node.js `fs` module to read local files, and **Zod** to parse and validate the frontmatter.
**Rationale**: `next-mdx-remote` is officially supported, lightweight, and works perfectly in Server Components to render MDX on the server at build time. Zod provides strict type safety (Constitution Principle 6). If frontmatter is invalid, Zod throws an error which fails the Next.js build (Constitution Principle 10).
**Alternatives considered**: `@next/mdx` (harder to use for dynamic routing based on file system outside the `app/` directory), Contentlayer (violates "Content is Source of Truth" and adds unnecessary complexity).

## 3. GitHub Contributions Proxy (Build Time)

**Context**: We need to fetch GitHub contributions at build time using a `GH_TOKEN` and write a cached JSON file to be consumed by the homepage, preventing client-side fetches.
**Decision**: Create a pre-build script (`scripts/fetch-github-data.ts`) executed before `next build`. This script fetches the data via GraphQL API, processes it, and writes `public/github-contributions.json`.
**Rationale**: Conforms perfectly to Constitution Principle 7 ("No Runtime Content Fetching"). By writing to `public/`, the data becomes a static asset that the frontend can load immediately, or the server component can read from disk during build.
**Alternatives considered**: Fetching directly inside the Next.js Server Component during `next build` (viable, but explicitly separating it into a script makes it easier to test and cache independently if needed).

## 4. Contact API (Cloudflare Pages Functions)

**Context**: A contact form needs to POST data to a Cloudflare Worker/Function for honeypot validation and basic rate limiting before forwarding to an email webhook.
**Decision**: Use **Cloudflare Pages Functions (`/functions/api/contact.ts`)**.
**Rationale**: Since we are deploying a Next.js static export to Cloudflare Pages, Pages Functions allows us to colocate our API endpoints in the same repository. We will use standard web APIs (Request/Response) to handle the POST, validate the honeypot field, implement a simple IP-based rate limit using Cloudflare KV or simply in-memory if sufficient for basic needs, and forward the request using `fetch` to an external service (e.g., Formspree, Resend, or a custom email webhook). No PII will be stored on Cloudflare.
**Alternatives considered**: A standalone Cloudflare Worker (adds repository/deployment complexity), Next.js API Routes (unsupported when using `output: 'export'` for purely static sites).

## 5. Styling and Motion

**Context**: Tailwind CSS + semantic HTML. Framer Motion is allowed only for hero/micro-interactions and must be lazy-loaded.
**Decision**: Utilize Tailwind CSS via PostCSS. Import Framer Motion dynamically using Next.js `next/dynamic` or Framer Motion's `LazyMotion` component.
**Rationale**: Ensures the main bundle remains extremely small. The site will degrade gracefully and remain completely readable with JavaScript disabled (Constitution Principle 7).
**Alternatives considered**: Standard Framer Motion imports (would bloat the initial JS payload, violating the "Performance Is a Feature" principle).
