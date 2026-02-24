# Quickstart Guide: Personal Website

## Prerequisites

- Node.js (v18+)
- pnpm (package manager)
- A GitHub Personal Access Token (for fetching contributions during build)
- Wrangler CLI (for Cloudflare Pages deployment/testing)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd wchen.ai
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   # Required for build-time GitHub contributions fetch
   GH_TOKEN=your_personal_access_token_here
   GH_USERNAME=wenshengchen
   
   # For the contact form API (Cloudflare worker)
   CONTACT_WEBHOOK_URL=https://your-email-forwarder-or-webhook.com
   ```

## Development

1. **Start the Next.js development server**:
   ```bash
   pnpm dev
   ```
   *Note: This runs the Next.js server locally. It does not run the Cloudflare Pages Functions (API routes).*

2. **Testing the API locally (Wrangler/Pages)**:
   To test the Cloudflare Pages Functions (e.g., the contact form) alongside the static site:
   ```bash
   # First build the static export
   pnpm build
   
   # Then serve the output folder with wrangler
   pnpm dlx wrangler pages dev out
   ```

## Adding Content

All content is managed via Markdown/MDX files in the `/content` directory. No database is required.

### Adding a Project

Create a new file in `/content/projects/my-new-project.mdx`:

```mdx
---
title: "My New Project"
date: "2026-03-01T12:00:00Z"
status: "active"
type: ["app"]
motivation: "I wanted to solve X..."
problemAddressed: "The core issue with Y is..."
learnings: "I learned Z..."
featured: true
---

This is the content of the project...
```

### Adding Writing (Idea)

Create a new file in `/content/writing/my-new-idea.mdx`:

```mdx
---
title: "A Quick Thought on AI"
publishDate: "2026-03-01T12:00:00Z"
theme: "AI"
tags: ["agents", "future"]
featured: false
draft: false
---

Here is a quick 200-1500 word thought...
```

## Testing

Run unit and integration tests (Vitest):
```bash
pnpm test
```

Run type checking and content validation:
```bash
pnpm typecheck
pnpm lint
```

## Deployment

The site is configured to deploy to Cloudflare Pages via GitHub Actions.

1. Push to the `main` branch.
2. The CI pipeline will:
   - Run type checks (`pnpm typecheck`)
   - Validate all MDX frontmatter (via Zod during the build process)
   - Run tests (`pnpm test`)
   - Run the pre-build script to fetch GitHub contributions.
   - Build the Next.js static export (`pnpm build`)
   - Deploy the `out/` directory and `/functions/` to Cloudflare Pages.

Failing type checks or invalid MDX schemas will block the deployment.