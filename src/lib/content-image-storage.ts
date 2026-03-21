import path from "node:path";

import { stripLocalePrefix } from "./i18n";
import { SUPPORTED_LOCALES } from "./locales";
import { absoluteUrl, getSiteUrl } from "./site-config";

const SITE_ASSET_PATH = /^\/(writing|projects)\//;

function expandOriginVariants(origin: string): string[] {
  const result: string[] = [origin];
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") {
      return result;
    }
    if (host.startsWith("www.")) {
      result.push(`${u.protocol}//${host.slice(4)}`);
    } else {
      result.push(`${u.protocol}//www.${host}`);
    }
  } catch {
    /* ignore */
  }
  return result;
}

/**
 * Origins for all locale site URLs (ogImage in MDX often uses the canonical production host).
 * Includes www / non-www variants and optional `NEXT_PUBLIC_SITE_URL` so frontmatter matches
 * real URLs even when profile.json and ogImage differ slightly.
 */
export function collectSiteOriginsForContentImages(): string[] {
  const origins = new Set<string>();
  for (const locale of SUPPORTED_LOCALES) {
    try {
      origins.add(new URL(getSiteUrl(locale)).origin);
    } catch {
      /* skip invalid profile URL */
    }
  }
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      origins.add(new URL(fromEnv).origin);
    } catch {
      /* skip */
    }
  }
  const expanded = new Set<string>();
  for (const o of origins) {
    for (const v of expandOriginVariants(o)) {
      expanded.add(v);
    }
  }
  return [...expanded];
}

/**
 * If `ogImage` points at an on-site writing/projects asset, returns the public URL path (e.g. `/writing/foo/bar.png`).
 * External URLs or non-asset paths return null.
 */
export function siteAssetPathFromOgImageUrl(
  ogImageUrl: string,
  allowedOrigins: readonly string[]
): string | null {
  let parsed: URL;
  try {
    parsed = new URL(ogImageUrl);
  } catch {
    return null;
  }
  const allowed = new Set<string>();
  for (const o of allowedOrigins) {
    for (const v of expandOriginVariants(o)) {
      allowed.add(v);
    }
  }
  if (!allowed.has(parsed.origin)) {
    return null;
  }
  const stripped = stripLocalePrefix(parsed.pathname);
  if (!SITE_ASSET_PATH.test(stripped)) {
    return null;
  }
  return stripped;
}

/** R2/S3 object key for a mirrored public asset (e.g. `og/writing/foo/bar.png`). */
export function contentImageStorageKey(sitePath: string): string {
  const segments = sitePath.split("/").filter(Boolean);
  return ["og", ...segments].join("/");
}

export function localPublicFilePathForSiteAsset(sitePath: string): string {
  const segments = sitePath.split("/").filter(Boolean);
  return path.join(process.cwd(), "public", ...segments);
}

function digestImagePublicBase(): string | undefined {
  const fromNewsletter = process.env.NEWSLETTER_IMAGE_PUBLIC_BASE_URL?.trim();
  if (fromNewsletter) {
    return fromNewsletter.replace(/\/$/, "");
  }
  const fromR2 = process.env.R2_AUDIO_PUBLIC_BASE_URL?.trim();
  if (fromR2) {
    return fromR2.replace(/\/$/, "");
  }
  return undefined;
}

/**
 * Absolute URL for digest email images: R2/CDN when a public base is configured and the asset is on-site;
 * otherwise same as page metadata (`absoluteUrl`).
 */
export function resolveDigestImageUrl(ogImage: string, locale: string): string {
  const base = digestImagePublicBase();
  if (!base) {
    return absoluteUrl(ogImage, locale);
  }
  const origins = collectSiteOriginsForContentImages();
  const sitePath = siteAssetPathFromOgImageUrl(ogImage, origins);
  if (!sitePath) {
    return absoluteUrl(ogImage, locale);
  }
  return `${base}/${contentImageStorageKey(sitePath)}`;
}
