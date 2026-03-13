import siteProfile from "../../content/site/profile.json";
import newsletterContent from "../../content/site/newsletter.json";
import type {
  NewsletterEmailBrand,
  NewsletterEmailContent,
  NewsletterEmailContentSet,
  NewsletterFooterContent,
  NewsletterIssueDefaults,
  NewsletterIssueContent,
} from "../../shared/newsletter-email";

export type SocialPlatform = "x" | "linkedin" | "github";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label: string;
  handle?: string;
}

export interface SiteProfile {
  siteName: string;
  fullName: string;
  givenName: string;
  initials: string;
  brandMark: string;
  role: string;
  siteTitle: string;
  siteDescription: string;
  url: string;
  locale: string;
  assets: {
    headshotPath: string;
    faviconPath: string;
    defaultOgImagePath: string;
    defaultOgImageAlt: string;
  };
  socialLinks: SocialLink[];
  github: {
    username: string;
  };
  rss: {
    title: string;
    description: string;
  };
  navigation: {
    projectsLabel: string;
    writingLabel: string;
    aboutLabel: string;
    contactLabel: string;
    skipToContentLabel: string;
    rssLabel: string;
  };
  footer: {
    rightsLabel: string;
  };
  writingPage: {
    title: string;
    intro: string;
    metadataDescription: string;
  };
  projectsPage: {
    title: string;
    intro: string;
    metadataDescription: string;
  };
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
  };
  newsletter: {
    from: string;
    subject: string;
    description: string;
    successTitle: string;
    successDescription: string;
    confirmedTitle: string;
    confirmedDescription: string;
  };
  contact: {
    title: string;
    description: string;
  };
  notFound: {
    title: string;
    description: string;
  };
}

interface NewsletterContentSource {
  confirm: NewsletterEmailContent;
  welcome: NewsletterEmailContent;
  issueDefaults: NewsletterIssueDefaults;
  recurring: {
    digest: NewsletterIssueContent & {
      subject: string;
      itemsHeading?: string;
      itemTypeLabels: Record<RecurringNewsletterType, string>;
      itemActionLabels: Record<RecurringNewsletterType, string>;
    };
  };
  footer: NewsletterFooterContent;
}

export type RecurringNewsletterType = "writing" | "project";

export interface RecurringNewsletterEntryTokens {
  entryTitle: string;
  entrySummary: string;
  entryUrl: string;
}

export interface ResolvedRecurringNewsletterEmailContent extends NewsletterIssueContent {
  subject: string;
  itemsHeading?: string;
  itemTypeLabels: Record<RecurringNewsletterType, string>;
  itemActionLabels: Record<RecurringNewsletterType, string>;
}

export const SITE_PROFILE = siteProfile as SiteProfile;
export const NEWSLETTER_CONTENT = newsletterContent as NewsletterContentSource;
export const SOCIAL_LINKS = SITE_PROFILE.socialLinks;
export const SITE_URL = SITE_PROFILE.url.replace(/\/$/, "");
export const SITE_ORIGIN = new URL(SITE_URL).origin;

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function getNewsletterEmailBrand(siteUrl: string = SITE_URL): NewsletterEmailBrand {
  const normalizedSiteUrl = siteUrl.replace(/\/$/, "");

  return {
    siteName: SITE_PROFILE.siteName,
    authorName: SITE_PROFILE.givenName,
    description: SITE_PROFILE.newsletter.description,
    homeUrl: normalizedSiteUrl,
    writingUrl: `${normalizedSiteUrl}/writing`,
    projectsUrl: `${normalizedSiteUrl}/projects`,
  };
}

export function getNewsletterFromAddress(fromOverride: string | undefined): string {
  const normalized = fromOverride?.trim();
  return normalized ? normalized : SITE_PROFILE.newsletter.from;
}

export function getNewsletterUnsubscribeUrl(params: {
  email: string;
  sig: string;
  siteUrl?: string;
  useLocalPage?: boolean;
}): string {
  const baseUrl = (params.siteUrl ?? SITE_URL).replace(/\/$/, "");
  const pathname = params.useLocalPage ? "/newsletter-unsubscribe" : "/api/newsletter-unsubscribe";
  return `${baseUrl}${pathname}?email=${encodeURIComponent(params.email)}&sig=${params.sig}`;
}

function resolveNewsletterTokens(value: string, tokens: Record<string, string>): string {
  return value.replace(/\{([a-zA-Z0-9]+)\}/g, (_match, key) => tokens[key] ?? `{${key}}`);
}

function getNewsletterTokenMap(
  brand: NewsletterEmailBrand,
  options?: {
    entry?: RecurringNewsletterEntryTokens;
    itemCount?: number;
  }
): Record<string, string> {
  return {
    siteName: brand.siteName,
    authorName: brand.authorName,
    newsletterDescription: brand.description,
    ...(options?.entry
      ? {
          entryTitle: options.entry.entryTitle,
          entrySummary: options.entry.entrySummary,
          entryUrl: options.entry.entryUrl,
        }
      : {}),
    ...(options?.itemCount !== undefined
      ? {
          itemCount: String(options.itemCount),
        }
      : {}),
  };
}

function resolveNewsletterSections(
  sections: NewsletterEmailContent["sections"],
  tokens: Record<string, string>
): NewsletterEmailContent["sections"] {
  return sections?.map((section) => ({
    heading: section.heading ? resolveNewsletterTokens(section.heading, tokens) : undefined,
    paragraphs: section.paragraphs.map((paragraph) => resolveNewsletterTokens(paragraph, tokens)),
  }));
}

export function getNewsletterEmailContent(siteUrl: string = SITE_URL): NewsletterEmailContentSet {
  const brand = getNewsletterEmailBrand(siteUrl);
  const tokens = getNewsletterTokenMap(brand);

  const resolveContent = (content: NewsletterEmailContent): NewsletterEmailContent => ({
    ...content,
    subject: resolveNewsletterTokens(content.subject, tokens),
    preview: resolveNewsletterTokens(content.preview, tokens),
    title: resolveNewsletterTokens(content.title, tokens),
    intro: content.intro.map((paragraph) => resolveNewsletterTokens(paragraph, tokens)),
    primaryActionLabel: content.primaryActionLabel
      ? resolveNewsletterTokens(content.primaryActionLabel, tokens)
      : undefined,
    secondaryActionLabel: content.secondaryActionLabel
      ? resolveNewsletterTokens(content.secondaryActionLabel, tokens)
      : undefined,
    secondaryActionPrefix: content.secondaryActionPrefix
      ? resolveNewsletterTokens(content.secondaryActionPrefix, tokens)
      : undefined,
    sections: resolveNewsletterSections(content.sections, tokens),
    footerNote: content.footerNote
      ? resolveNewsletterTokens(content.footerNote, tokens)
      : undefined,
  });

  return {
    confirm: resolveContent(NEWSLETTER_CONTENT.confirm),
    welcome: resolveContent(NEWSLETTER_CONTENT.welcome),
    issueDefaults: {
      preview: resolveNewsletterTokens(NEWSLETTER_CONTENT.issueDefaults.preview, tokens),
      primaryActionLabel: resolveNewsletterTokens(
        NEWSLETTER_CONTENT.issueDefaults.primaryActionLabel,
        tokens
      ),
    },
    footer: {
      note: resolveNewsletterTokens(NEWSLETTER_CONTENT.footer.note, tokens),
      writingArchiveLabel: resolveNewsletterTokens(
        NEWSLETTER_CONTENT.footer.writingArchiveLabel,
        tokens
      ),
      projectsArchiveLabel: NEWSLETTER_CONTENT.footer.projectsArchiveLabel
        ? resolveNewsletterTokens(NEWSLETTER_CONTENT.footer.projectsArchiveLabel, tokens)
        : undefined,
      homeLabel: resolveNewsletterTokens(NEWSLETTER_CONTENT.footer.homeLabel, tokens),
      unsubscribeLabel: NEWSLETTER_CONTENT.footer.unsubscribeLabel
        ? resolveNewsletterTokens(NEWSLETTER_CONTENT.footer.unsubscribeLabel, tokens)
        : undefined,
    },
  };
}

export function getRecurringNewsletterEmailContent(params: {
  itemCount: number;
  siteUrl?: string;
}): ResolvedRecurringNewsletterEmailContent {
  const brand = getNewsletterEmailBrand(params.siteUrl ?? SITE_URL);
  const tokens = getNewsletterTokenMap(brand, { itemCount: params.itemCount });
  const template = NEWSLETTER_CONTENT.recurring.digest;

  return {
    subject: resolveNewsletterTokens(template.subject, tokens),
    preview: resolveNewsletterTokens(template.preview, tokens),
    summary: resolveNewsletterTokens(template.summary, tokens),
    primaryActionLabel: resolveNewsletterTokens(
      template.itemActionLabels.writing || NEWSLETTER_CONTENT.issueDefaults.primaryActionLabel,
      tokens
    ),
    sections: resolveNewsletterSections(template.sections, tokens),
    itemsHeading: template.itemsHeading
      ? resolveNewsletterTokens(template.itemsHeading, tokens)
      : undefined,
    itemTypeLabels: {
      writing: resolveNewsletterTokens(template.itemTypeLabels.writing, tokens),
      project: resolveNewsletterTokens(template.itemTypeLabels.project, tokens),
    },
    itemActionLabels: {
      writing: resolveNewsletterTokens(template.itemActionLabels.writing, tokens),
      project: resolveNewsletterTokens(template.itemActionLabels.project, tokens),
    },
    footerNote: template.footerNote
      ? resolveNewsletterTokens(template.footerNote, tokens)
      : undefined,
  };
}

export function getAllowedOrigins(siteUrl: string = SITE_URL): string[] {
  const origin = new URL(siteUrl).origin;
  const url = new URL(origin);
  const origins = new Set<string>([origin]);

  if (url.hostname.startsWith("www.")) {
    origins.add(`${url.protocol}//${url.hostname.replace(/^www\./, "")}${url.port ? `:${url.port}` : ""}`);
  } else if (!url.hostname.startsWith("localhost")) {
    origins.add(`${url.protocol}//www.${url.hostname}${url.port ? `:${url.port}` : ""}`);
  }

  return Array.from(origins);
}

export function getSocialHandle(platform: SocialPlatform): string | undefined {
  return SOCIAL_LINKS.find((link) => link.platform === platform)?.handle;
}
