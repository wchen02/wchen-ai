import { SITE_PROFILE, SITE_URL, absoluteUrl, getSocialHandle } from "@/lib/site-config";

/** Single source of truth for default metadata (FR-020). Used by layout and all page metadata. */
export const METADATA_DEFAULTS = {
  siteName: SITE_PROFILE.siteName,
  defaultTitle: SITE_PROFILE.siteTitle,
  defaultDescription: SITE_PROFILE.siteDescription,
  defaultOgImageUrl: absoluteUrl(SITE_PROFILE.assets.defaultOgImagePath),
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,
  defaultOgImageAlt: SITE_PROFILE.assets.defaultOgImageAlt,
  faviconPath: SITE_PROFILE.assets.faviconPath,
  locale: SITE_PROFILE.locale,
  rssTitle: SITE_PROFILE.rss.title,
  rssDescription: SITE_PROFILE.rss.description,
  twitterHandle: getSocialHandle("x"),
  /** Canonical base URL with no trailing slash (FR-011). */
  canonicalBaseUrl: SITE_URL.replace(/\/$/, ""),
} as const;

export type MetadataDefaults = typeof METADATA_DEFAULTS;
