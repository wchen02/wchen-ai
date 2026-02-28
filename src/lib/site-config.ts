export type SocialPlatform = "x" | "linkedin" | "github";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: "x", url: "https://x.com/wchen_ai", label: "X (Twitter)" },
  { platform: "linkedin", url: "https://www.linkedin.com/in/wchen02/", label: "LinkedIn" },
  { platform: "github", url: "https://github.com/wenshengchen", label: "GitHub" },
];

export const SITE_URL = "https://wchen.ai";
