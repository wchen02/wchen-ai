import type {
  NewsletterEmailBrand,
  NewsletterEmailContent,
  NewsletterEmailContentSet,
  NewsletterIssueContent,
} from "../../shared/newsletter-email";
import { getLocaleContent } from "./content";
import { localizePath } from "./i18n";
import { DEFAULT_LOCALE, type SupportedLocale } from "./locales";
import type { NewsletterContentSource, SiteProfile } from "./schemas";

export type SocialPlatform = "x" | "linkedin" | "github";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label: string;
  handle?: string;
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

const DEFAULT_CONTENT = getLocaleContent();

export const SITE_PROFILE: SiteProfile = DEFAULT_CONTENT.profile;
export const NEWSLETTER_CONTENT: NewsletterContentSource = DEFAULT_CONTENT.newsletter;
export const SOCIAL_LINKS = SITE_PROFILE.socialLinks;
export const SITE_URL = SITE_PROFILE.url.replace(/\/$/, "");
export const SITE_ORIGIN = new URL(SITE_URL).origin;

export function getSiteProfile(locale?: string): SiteProfile {
  return getLocaleContent(locale).profile;
}

export function getNewsletterContentSource(locale?: string): NewsletterContentSource {
  return getLocaleContent(locale).newsletter;
}

export function getSocialLinks(locale?: string): SocialLink[] {
  return getSiteProfile(locale).socialLinks;
}

export function getSiteUrl(locale?: string): string {
  return getSiteProfile(locale).url.replace(/\/$/, "");
}

export function getSiteOrigin(locale?: string): string {
  return new URL(getSiteUrl(locale)).origin;
}

export function absoluteUrl(pathOrUrl: string, locale?: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const siteUrl = getSiteUrl(locale);
  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  const localizedPath =
    locale && normalizedPath.startsWith("/")
      ? localizePath(locale as SupportedLocale, normalizedPath)
      : normalizedPath;

  return `${siteUrl}${localizedPath}`;
}

export function getNewsletterEmailBrand(
  siteUrl: string = SITE_URL,
  locale: string = DEFAULT_LOCALE
): NewsletterEmailBrand {
  const normalizedSiteUrl = siteUrl.replace(/\/$/, "");
  const siteProfile = getSiteProfile(locale);
  const resolvedLocale = (locale || DEFAULT_LOCALE) as SupportedLocale;

  return {
    siteName: siteProfile.siteName,
    authorName: siteProfile.givenName,
    description: siteProfile.newsletter.description,
    homeUrl: `${normalizedSiteUrl}/${resolvedLocale}`,
    writingUrl: `${normalizedSiteUrl}${localizePath(resolvedLocale, "/writing")}`,
    projectsUrl: `${normalizedSiteUrl}${localizePath(resolvedLocale, "/projects")}`,
  };
}

export function getNewsletterFromAddress(fromOverride: string | undefined, locale?: string): string {
  const normalized = fromOverride?.trim();
  return normalized ? normalized : getSiteProfile(locale).newsletter.from;
}

export function getNewsletterUnsubscribeUrl(params: {
  email: string;
  sig: string;
  siteUrl?: string;
  useLocalPage?: boolean;
  locale?: string;
}): string {
  const baseUrl = (params.siteUrl ?? SITE_URL).replace(/\/$/, "");
  const pathname = params.useLocalPage ? "/newsletter-unsubscribe" : "/api/newsletter-unsubscribe";
  const localizedPath = params.useLocalPage && params.locale
    ? localizePath(params.locale as SupportedLocale, pathname)
    : pathname;
  return `${baseUrl}${localizedPath}?email=${encodeURIComponent(params.email)}&sig=${params.sig}`;
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

export function getNewsletterEmailContent(
  siteUrl: string = SITE_URL,
  locale: string = DEFAULT_LOCALE
): NewsletterEmailContentSet {
  const newsletterContent = getNewsletterContentSource(locale);
  const brand = getNewsletterEmailBrand(siteUrl, locale);
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
    confirm: resolveContent(newsletterContent.confirm),
    welcome: resolveContent(newsletterContent.welcome),
    issueDefaults: {
      preview: resolveNewsletterTokens(newsletterContent.issueDefaults.preview, tokens),
      primaryActionLabel: resolveNewsletterTokens(
        newsletterContent.issueDefaults.primaryActionLabel,
        tokens
      ),
    },
    footer: {
      note: resolveNewsletterTokens(newsletterContent.footer.note, tokens),
      writingArchiveLabel: resolveNewsletterTokens(
        newsletterContent.footer.writingArchiveLabel,
        tokens
      ),
      projectsArchiveLabel: newsletterContent.footer.projectsArchiveLabel
        ? resolveNewsletterTokens(newsletterContent.footer.projectsArchiveLabel, tokens)
        : undefined,
      homeLabel: resolveNewsletterTokens(newsletterContent.footer.homeLabel, tokens),
      unsubscribeLabel: newsletterContent.footer.unsubscribeLabel
        ? resolveNewsletterTokens(newsletterContent.footer.unsubscribeLabel, tokens)
        : undefined,
    },
  };
}

export function getRecurringNewsletterEmailContent(params: {
  itemCount: number;
  siteUrl?: string;
  locale?: string;
}): ResolvedRecurringNewsletterEmailContent {
  const locale = params.locale ?? DEFAULT_LOCALE;
  const newsletterContent = getNewsletterContentSource(locale);
  const brand = getNewsletterEmailBrand(params.siteUrl ?? SITE_URL, locale);
  const tokens = getNewsletterTokenMap(brand, { itemCount: params.itemCount });
  const template = newsletterContent.recurring.digest;

  return {
    subject: resolveNewsletterTokens(template.subject, tokens),
    preview: resolveNewsletterTokens(template.preview, tokens),
    summary: resolveNewsletterTokens(template.summary, tokens),
    primaryActionLabel: resolveNewsletterTokens(
      template.itemActionLabels.writing || newsletterContent.issueDefaults.primaryActionLabel,
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

export function getSocialHandle(platform: SocialPlatform, locale?: string): string | undefined {
  return getSocialLinks(locale).find((link) => link.platform === platform)?.handle;
}
