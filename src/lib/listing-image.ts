const SITE_ASSET_PATH = /^\/(?:writing|projects)\/[^/?#]+\//;

export function listingImageSrc(ogImage?: string): string | undefined {
  if (!ogImage) return undefined;

  try {
    const parsed = new URL(ogImage);
    return SITE_ASSET_PATH.test(parsed.pathname) ? parsed.pathname : ogImage;
  } catch {
    return SITE_ASSET_PATH.test(ogImage) ? ogImage : undefined;
  }
}
