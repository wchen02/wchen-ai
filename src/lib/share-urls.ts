/**
 * Helpers for building share intent URLs (email, Twitter, LinkedIn, Facebook).
 * Used by ShareButton; exported for unit testing.
 */

export const TWITTER_TEXT_MAX = 200;

export function truncateForTwitter(text: string, maxLength: number = TWITTER_TEXT_MAX): string {
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength).replace(/\s+\S*$/, "");
  return trimmed + (trimmed.length < text.length ? "…" : "");
}

export function shareUrlEmail(title: string, url: string, description?: string): string {
  const body = description ? `${description}\n\n${url}` : url;
  return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

export function shareUrlTwitter(title: string, url: string, description?: string): string {
  const text = description
    ? `${title} — ${truncateForTwitter(description)}`
    : title;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function shareUrlLinkedIn(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function shareUrlFacebook(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
