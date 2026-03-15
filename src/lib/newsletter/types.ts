/**
 * Newsletter provider interface. Implement this to swap providers (Resend, Mailchimp, Beehiiv, etc.).
 * Add a new implementation in providers/ and update getNewsletterProvider() in index.ts.
 */

/** A newsletter subscriber contact returned by the provider. */
export interface NewsletterContact {
  email: string;
  unsubscribed: boolean;
  /** Subscriber's preferred locale, if set. */
  preferred_locale?: string;
  /** Additional provider-specific properties. */
  properties?: Record<string, unknown>;
}

export interface NewsletterSendEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
  headers?: Record<string, string>;
}

export interface NewsletterUpsertContactParams {
  email: string;
  /** Provider-specific audience/list/segment identifier. */
  audienceId: string;
  properties?: Record<string, string | number>;
}

export interface NewsletterListContactsParams {
  /** Provider-specific audience/list/segment identifier. */
  audienceId: string;
  pageSize?: number;
}

export interface NewsletterUpdateContactParams {
  email: string;
  unsubscribed?: boolean;
}

export interface NewsletterProvider {
  readonly name: string;
  sendEmail(params: NewsletterSendEmailParams): Promise<void>;
  upsertContact(params: NewsletterUpsertContactParams): Promise<void>;
  listContacts(params: NewsletterListContactsParams): Promise<NewsletterContact[]>;
  updateContact(params: NewsletterUpdateContactParams): Promise<void>;
}
