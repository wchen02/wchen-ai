import { z } from 'zod';

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

const NewsletterEmailSectionSchema = z.object({
  heading: z.string().min(1).optional(),
  paragraphs: z.array(z.string().min(1)).min(1),
});

const NewsletterEmailContentSchema = z.object({
  subject: z.string().min(1),
  preview: z.string().min(1),
  title: z.string().min(1),
  intro: z.array(z.string().min(1)).min(1),
  primaryActionLabel: z.string().min(1).optional(),
  secondaryActionLabel: z.string().min(1).optional(),
  secondaryActionPrefix: z.string().min(1).optional(),
  sections: z.array(NewsletterEmailSectionSchema).optional(),
  footerNote: z.string().min(1).optional(),
});

export const HomeContentSchema = z.object({
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

export const AboutContentSchema = z.object({
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

export const SiteProfileSchema = z.object({
  siteName: z.string().min(1),
  fullName: z.string().min(1),
  givenName: z.string().min(1),
  initials: z.string().min(1),
  brandMark: z.string().min(1),
  role: z.string().min(1),
  siteTitle: z.string().min(1),
  siteDescription: z.string().min(1),
  url: z.string().url(),
  languageTag: z.string().min(1),
  locale: z.string().min(1),
  ogLocale: z.string().min(1),
  assets: z.object({
    headshotPath: z.string().min(1),
    faviconPath: z.string().min(1),
    defaultOgImagePath: z.string().min(1),
    defaultOgImageAlt: z.string().min(1),
  }),
  socialLinks: z.array(
    z.object({
      platform: z.enum(["x", "linkedin", "github"]),
      url: z.string().url(),
      label: z.string().min(1),
      handle: z.string().min(1).optional(),
    })
  ),
  github: z.object({
    username: z.string().min(1),
  }),
  rss: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    language: z.string().min(1),
  }),
  navigation: z.object({
    projectsLabel: z.string().min(1),
    writingLabel: z.string().min(1),
    aboutLabel: z.string().min(1),
    contactLabel: z.string().min(1),
    skipToContentLabel: z.string().min(1),
    rssLabel: z.string().min(1),
    mainAriaLabel: z.string().min(1),
  }),
  footer: z.object({
    rightsLabel: z.string().min(1),
  }),
  writingPage: z.object({
    title: z.string().min(1),
    intro: z.string().min(1),
    metadataDescription: z.string().min(1),
    metadataTitle: z.string().min(1),
    openGraphAlt: z.string().min(1),
  }),
  projectsPage: z.object({
    title: z.string().min(1),
    intro: z.string().min(1),
    metadataDescription: z.string().min(1),
    metadataTitle: z.string().min(1),
    openGraphAlt: z.string().min(1),
  }),
  cta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    buttonLabel: z.string().min(1),
  }),
  newsletter: z.object({
    from: z.string().min(1),
    subject: z.string().min(1),
    description: z.string().min(1),
    successTitle: z.string().min(1),
    successDescription: z.string().min(1),
    confirmedPageTitle: z.string().min(1),
    confirmedTitle: z.string().min(1),
    confirmedDescription: z.string().min(1),
    confirmedPrimaryCtaLabel: z.string().min(1),
    confirmedSecondaryCtaLabel: z.string().min(1),
    unsubscribedPageTitle: z.string().min(1),
    unsubscribedTitle: z.string().min(1),
    unsubscribedDescription: z.string().min(1),
    unsubscribedPrimaryCtaLabel: z.string().min(1),
    unsubscribedSecondaryCtaLabel: z.string().min(1),
  }),
  contact: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  notFound: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    homeLabel: z.string().min(1),
    projectsLabel: z.string().min(1),
    writingLabel: z.string().min(1),
  }),
});

export const NewsletterContentSourceSchema = z.object({
  confirm: NewsletterEmailContentSchema,
  welcome: NewsletterEmailContentSchema,
  issueDefaults: z.object({
    preview: z.string().min(1),
    primaryActionLabel: z.string().min(1),
  }),
  recurring: z.object({
    digest: z.object({
      subject: z.string().min(1),
      preview: z.string().min(1),
      summary: z.string().min(1),
      itemsHeading: z.string().min(1).optional(),
      sections: z.array(NewsletterEmailSectionSchema).optional(),
      itemTypeLabels: z.object({
        writing: z.string().min(1),
        project: z.string().min(1),
      }),
      itemActionLabels: z.object({
        writing: z.string().min(1),
        project: z.string().min(1),
      }),
      footerNote: z.string().min(1).optional(),
    }),
  }),
  footer: z.object({
    note: z.string().min(1),
    writingArchiveLabel: z.string().min(1),
    projectsArchiveLabel: z.string().min(1).optional(),
    homeLabel: z.string().min(1),
    unsubscribeLabel: z.string().min(1).optional(),
  }),
});

export const UiContentSchema = z.object({
  languageSwitcher: z.object({
    label: z.string().min(1),
    ariaLabel: z.string().min(1),
  }),
  themeToggle: z.object({
    staticLabel: z.string().min(1),
    announcement: z.string().min(1),
    lightModeLabel: z.string().min(1),
    darkModeLabel: z.string().min(1),
  }),
  tableOfContents: z.object({
    ariaLabel: z.string().min(1),
    heading: z.string().min(1),
  }),
  shareButton: z.object({
    ariaLabel: z.string().min(1),
    copiedLabel: z.string().min(1),
  }),
  readNext: z.object({
    heading: z.string().min(1),
  }),
  searchWriting: z.object({
    label: z.string().min(1),
    loadingPlaceholder: z.string().min(1),
    placeholder: z.string().min(1),
    noResults: z.string().min(1),
    browseByThemeLabel: z.string().min(1),
  }),
  writing: z.object({
    themeNavAriaLabel: z.string().min(1),
    emptyState: z.string().min(1),
    backToAllLabel: z.string().min(1),
    minuteReadLabel: z.string().min(1),
    updatedPrefix: z.string().min(1),
    notFoundTitle: z.string().min(1),
    detailTitleTemplate: z.string().min(1),
  }),
  projects: z.object({
    filterByStatusLabel: z.string().min(1),
    statusLabels: z.object({
      all: z.string().min(1),
      active: z.string().min(1),
      archived: z.string().min(1),
      inProgress: z.string().min(1),
    }),
    typeLabels: z.object({
      app: z.string().min(1),
      agent: z.string().min(1),
      experiment: z.string().min(1),
      skill: z.string().min(1),
      library: z.string().min(1),
      tool: z.string().min(1),
    }),
    emptyState: z.string().min(1),
    filteredEmptyState: z.string().min(1),
    clearFilterLabel: z.string().min(1),
    inProgressLabel: z.string().min(1),
    motivationLabel: z.string().min(1),
    problemLabel: z.string().min(1),
    learningsLabel: z.string().min(1),
    readFullStoryLabel: z.string().min(1),
    backToAllLabel: z.string().min(1),
    githubLabel: z.string().min(1),
    liveAppLabel: z.string().min(1),
    notFoundTitle: z.string().min(1),
    detailTitleTemplate: z.string().min(1),
  }),
  comments: z.object({
    heading: z.string().min(1),
    emptyState: z.string().min(1),
    nameLabel: z.string().min(1),
    namePlaceholder: z.string().min(1),
    emailLabel: z.string().min(1).optional(),
    emailPlaceholder: z.string().min(1).optional(),
    bodyLabel: z.string().min(1),
    bodyPlaceholder: z.string().min(1),
    submitLabel: z.string().min(1),
    submittingLabel: z.string().min(1),
    submitErrorFallback: z.string().min(1),
  }),
  newsletterFlow: z.object({
    confirmLoadingTitle: z.string().min(1),
    confirmLoadingMessage: z.string().min(1),
    confirmErrorTitle: z.string().min(1),
    unsubscribeLoadingTitle: z.string().min(1),
    unsubscribeLoadingMessage: z.string().min(1),
    unsubscribeErrorTitle: z.string().min(1),
  }),
  github: z.object({
    noDataLabel: z.string().min(1),
    ariaLabel: z.string().min(1),
    summary: z.string().min(1),
    dayTitle: z.string().min(1),
  }),
  themeDescriptors: z.record(z.string().min(1), z.string().min(1)),
  themeLabels: z.record(z.string().min(1), z.string().min(1)),
});

export const FormsContentSchema = z.object({
  common: z.object({
    honeypotLabel: z.string().min(1),
    invalidResponseError: z.string().min(1),
    unexpectedError: z.string().min(1),
  }),
  newsletter: z.object({
    title: z.string().min(1),
    emailLabel: z.string().min(1),
    emailPlaceholder: z.string().min(1),
    submitLabel: z.string().min(1),
    submittingLabel: z.string().min(1),
    submitErrorFallback: z.string().min(1),
  }),
  contact: z.object({
    successTitle: z.string().min(1),
    successDescription: z.string().min(1),
    resetLabel: z.string().min(1),
    submitLabel: z.string().min(1),
    submittingLabel: z.string().min(1),
    submitErrorFallback: z.string().min(1),
    fields: z.object({
      name: z.object({
        label: z.string().min(1),
        placeholder: z.string().min(1),
      }),
      email: z.object({
        label: z.string().min(1),
        placeholder: z.string().min(1),
      }),
      message: z.object({
        label: z.string().min(1),
        placeholder: z.string().min(1),
      }),
    }),
  }),
});

export const SystemContentSchema = z.object({
  common: z.object({
    forbidden: z.string().min(1),
    invalidSubmission: z.string().min(1),
    validationFailed: z.string().min(1),
    genericError: z.string().min(1),
    newsletterHtmlTitle: z.string().min(1),
  }),
  validation: z.object({
    nameRequired: z.string().min(1),
    invalidEmail: z.string().min(1),
    messageTooShort: z.string().min(1),
  }),
  contact: z.object({
    successMessage: z.string().min(1),
    developmentMessage: z.string().min(1),
    sendFailure: z.string().min(1),
  }),
  newsletter: z.object({
    subscribeSuccess: z.string().min(1),
    subscribeFailure: z.string().min(1),
    invalidConfirmationLink: z.string().min(1),
    expiredConfirmationLink: z.string().min(1),
    invalidUnsubscribeLink: z.string().min(1),
  }),
  comments: z.object({
    postSuccess: z.string().min(1),
    postFailure: z.string().min(1),
  }),
});

export const ProjectTypeEnum = z.enum(['app', 'agent', 'experiment', 'skill', 'library', 'tool']);

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
  
  // Optional article-specific OG image (FR-010)
  ogImage: z.string().url().optional(),
  
  // State
  featured: z.boolean().default(false), // To highlight on homepage/writing index
  draft: z.boolean().default(false),    // If true, exclude from build
});

export type Writing = z.infer<typeof WritingSchema> & { 
  slug: string; 
  content: string; // The raw MDX body (200-1500 words per spec)
  readingTimeMinutes: number; // Calculated at build time
  excerpt: string; // Derived at build/load time from content
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

export type HomeContent = z.infer<typeof HomeContentSchema>;
export type AboutContent = z.infer<typeof AboutContentSchema>;
export type SiteProfile = z.infer<typeof SiteProfileSchema>;
export type NewsletterContentSource = z.infer<typeof NewsletterContentSourceSchema>;
export type UiContent = z.infer<typeof UiContentSchema>;
export type FormsContent = z.infer<typeof FormsContentSchema>;
export type SystemContent = z.infer<typeof SystemContentSchema>;
export type GitHubContributions = z.infer<typeof GitHubContributionSchema>;

// Re-export from shared so frontend and backend stay in sync
export { ContactPayloadSchema, type ContactPayload } from "../../shared/contact";
export { NewsletterPayloadSchema, type NewsletterPayload } from "../../shared/newsletter";
