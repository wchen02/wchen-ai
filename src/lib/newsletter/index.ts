import type { NewsletterProvider } from "./types";
import { createResendNewsletterProvider } from "./providers/resend";

export type {
  NewsletterProvider,
  NewsletterContact,
  NewsletterSendEmailParams,
  NewsletterUpsertContactParams,
  NewsletterListContactsParams,
  NewsletterUpdateContactParams,
} from "./types";

// Ambient declaration so this module compiles in environments without @types/node (e.g. Cloudflare Workers).
declare const process: { env: { NEWSLETTER_PROVIDER?: string } };

/**
 * Returns the newsletter provider to use. Driven by env NEWSLETTER_PROVIDER (default: "resend").
 * Swap provider by setting NEWSLETTER_PROVIDER=<name> and implementing another in providers/.
 */
export function getNewsletterProvider(apiKey: string): NewsletterProvider {
  const provider = process.env.NEWSLETTER_PROVIDER ?? "resend";
  switch (provider) {
    case "resend":
    default:
      return createResendNewsletterProvider(apiKey);
  }
}
