# Data Model & Schema Definition

## Content Source Structure

All data is sourced from local Markdown/MDX files under the `/content` directory. The structure is:

```text
/content
  /projects
    [slug].mdx
  /writing
    [slug].mdx
```

## Zod Validation Schemas (Frontmatter)

These schemas act as the single source of truth for our entities. Invalid frontmatter will fail the build.

### 1. Project Entity

Represents an app, agent, or experiment built by Wilson.

```typescript
import { z } from 'zod';

export const ProjectTypeEnum = z.enum(['app', 'agent', 'experiment']);

export const ProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().datetime(), // ISO 8601 string
  status: z.enum(['active', 'archived', 'in-progress']),
  type: z.array(ProjectTypeEnum).min(1),
  
  // Narrative fields (instead of just feature lists)
  motivation: z.string().min(10),
  problemAddressed: z.string().min(10),
  learnings: z.string().optional(),
  
  // Optional links
  url: z.string().url().optional(),
  github: z.string().url().optional(),
  
  // State
  featured: z.boolean().default(false), // To prioritize on homepage
});

export type Project = z.infer<typeof ProjectSchema> & { 
  slug: string; 
  content: string; // The raw MDX body
};
```

### 2. Writing (Idea) Entity

Represents a published quick thought.

```typescript
import { z } from 'zod';

export const WritingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  publishDate: z.string().datetime(), // ISO 8601 string
  updatedAt: z.string().datetime().optional(),
  
  // Categorization
  theme: z.string().min(1),
  tags: z.array(z.string()).default([]),
  
  // State
  featured: z.boolean().default(false), // To highlight on homepage/writing index
  draft: z.boolean().default(false),    // If true, exclude from build
});

export type Writing = z.infer<typeof WritingSchema> & { 
  slug: string; 
  content: string; // The raw MDX body (200-1500 words per spec)
  readingTimeMinutes: number; // Calculated at build time
};
```

## External Data: GitHub Contributions

Fetched at build time and cached locally.

```typescript
export const GitHubContributionSchema = z.object({
  totalContributions: z.number(),
  weeks: z.array(
    z.object({
      contributionDays: z.array(
        z.object({
          contributionCount: z.number(),
          date: z.string(),
        })
      )
    })
  )
});

export type GitHubContributions = z.infer<typeof GitHubContributionSchema>;
```

## Internal API: Contact Form Payload

The payload expected by the Cloudflare Pages Function `/api/contact`.

```typescript
export const ContactPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  
  // Honeypot field (must remain empty for submission to succeed)
  _honey: z.string().max(0, "Invalid submission"),
});

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;
```