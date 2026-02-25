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

// Re-export from shared so frontend and backend stay in sync
export { ContactPayloadSchema, type ContactPayload } from "../../shared/contact";
