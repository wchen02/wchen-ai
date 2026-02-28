import { SITE_URL } from "@/lib/site-config";

/** Single source of truth for default metadata (FR-020). Used by layout and all page metadata. */
export const METADATA_DEFAULTS = {
  siteName: "Wilson Chen",
  defaultOgImageUrl: `${SITE_URL}/og-default.png`,
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,
  defaultOgImageAlt: "Wilson Chen — Founder & Builder",
  locale: "en_US" as const,
  /** Canonical base URL with no trailing slash (FR-011). */
  canonicalBaseUrl: SITE_URL.replace(/\/$/, ""),
} as const;

export type MetadataDefaults = typeof METADATA_DEFAULTS;
