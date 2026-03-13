import { DEFAULT_LOCALE } from "@/lib/locales";
import { absoluteUrl, getSiteProfile, getSiteUrl, getSocialHandle } from "@/lib/site-config";

/** Single source of truth for default metadata (FR-020). Used by layout and all page metadata. */
export function getMetadataDefaults(locale: string = DEFAULT_LOCALE) {
  const siteProfile = getSiteProfile(locale);
  const siteUrl = getSiteUrl(locale);

  return {
    siteName: siteProfile.siteName,
    defaultTitle: siteProfile.siteTitle,
    defaultDescription: siteProfile.siteDescription,
    defaultOgImageUrl: absoluteUrl(siteProfile.assets.defaultOgImagePath, locale),
    defaultOgImageWidth: 1200,
    defaultOgImageHeight: 630,
    defaultOgImageAlt: siteProfile.assets.defaultOgImageAlt,
    faviconPath: siteProfile.assets.faviconPath,
    languageTag: siteProfile.languageTag,
    locale: siteProfile.ogLocale,
    rssTitle: siteProfile.rss.title,
    rssDescription: siteProfile.rss.description,
    twitterHandle: getSocialHandle("x", locale),
    canonicalBaseUrl: siteUrl.replace(/\/$/, ""),
  } as const;
}

export const METADATA_DEFAULTS = getMetadataDefaults();

export type MetadataDefaults = typeof METADATA_DEFAULTS;
