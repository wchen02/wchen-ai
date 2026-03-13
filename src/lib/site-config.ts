import siteProfile from "../../content/site/profile.json";

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

export const SITE_PROFILE = siteProfile as SiteProfile;
export const SOCIAL_LINKS = SITE_PROFILE.socialLinks;
export const SITE_URL = SITE_PROFILE.url.replace(/\/$/, "");
export const SITE_ORIGIN = new URL(SITE_URL).origin;

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
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
