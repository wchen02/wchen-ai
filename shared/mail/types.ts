export interface MailContact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  unsubscribed: boolean;
  /** Preferred locale stored as a contact property. */
  preferred_locale?: string;
  properties?: Record<string, unknown>;
}

export interface SendEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
  headers?: Record<string, string>;
}

export interface UpsertContactParams {
  email: string;
  segmentId: string;
  properties?: Record<string, string | number>;
}

export interface ListContactsParams {
  segmentId: string;
  pageSize?: number;
}

export interface UpdateContactParams {
  email: string;
  unsubscribed?: boolean;
}

/**
 * Provider-agnostic mail interface. Implement this interface to swap the
 * underlying email provider (e.g. Resend → SendGrid → Mailgun) without
 * touching any business logic. Use {@link createResendMailProvider} from
 * `./providers/resend` to obtain the default Resend-backed implementation.
 */
export interface MailProvider {
  sendEmail(params: SendEmailParams): Promise<void>;
  upsertContact(params: UpsertContactParams): Promise<void>;
  listContacts(params: ListContactsParams): Promise<MailContact[]>;
  updateContact(params: UpdateContactParams): Promise<void>;
}
