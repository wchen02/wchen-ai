import { z } from "zod";
import aboutContentData from "../../content/site/about.json";
import homeContentData from "../../content/site/home.json";

const CtaLinkSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
});

const CardSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const PrincipleSchema = z.object({
  principle: z.string().min(1),
  detail: z.string().min(1),
});

const HomeContentSchema = z.object({
  hero: z.object({
    intro: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
    aboutLink: CtaLinkSchema,
  }),
  currentFocus: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  selectedWork: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    viewAllLabel: z.string().min(1),
    emptyState: z.string().min(1),
  }),
  recentThinking: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    viewAllLabel: z.string().min(1),
    emptyState: z.string().min(1),
  }),
  activity: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

const AboutContentSchema = z.object({
  metadataDescription: z.string().min(1),
  intro: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  philosophy: z.object({
    title: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  expertise: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(CardSchema).min(1),
  }),
  background: z.object({
    title: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  principles: z.object({
    title: z.string().min(1),
    items: z.array(PrincipleSchema).min(1),
  }),
});

export type HomeContent = z.infer<typeof HomeContentSchema>;
export type AboutContent = z.infer<typeof AboutContentSchema>;

const HOME_CONTENT = HomeContentSchema.parse(homeContentData);
const ABOUT_CONTENT = AboutContentSchema.parse(aboutContentData);

export function getHomeContent(): HomeContent {
  return HOME_CONTENT;
}

export function getAboutContent(): AboutContent {
  return ABOUT_CONTENT;
}
