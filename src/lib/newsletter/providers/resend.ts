import type {
  NewsletterContact,
  NewsletterListContactsParams,
  NewsletterProvider,
  NewsletterSendEmailParams,
  NewsletterUpsertContactParams,
  NewsletterUpdateContactParams,
} from "../types";
import {
  listResendContactsBySegment,
  sendResendEmail,
  updateResendContact,
  upsertResendContact,
} from "../../../../shared/resend";

/**
 * Resend-backed newsletter provider.
 * Maps the generic NewsletterProvider interface to the Resend API.
 * To swap providers, implement NewsletterProvider in a new file and update getNewsletterProvider().
 */
export function createResendNewsletterProvider(apiKey: string): NewsletterProvider {
  return {
    name: "Resend",

    async sendEmail({
      from,
      to,
      subject,
      html,
      text,
      idempotencyKey,
      headers,
    }: NewsletterSendEmailParams): Promise<void> {
      await sendResendEmail({ apiKey, from, to, subject, html, text, idempotencyKey, headers });
    },

    async upsertContact({
      email,
      audienceId,
      properties,
    }: NewsletterUpsertContactParams): Promise<void> {
      await upsertResendContact({ apiKey, email, segmentId: audienceId, properties });
    },

    async listContacts({
      audienceId,
      pageSize,
    }: NewsletterListContactsParams): Promise<NewsletterContact[]> {
      return listResendContactsBySegment({ apiKey, segmentId: audienceId, pageSize });
    },

    async updateContact({ email, unsubscribed }: NewsletterUpdateContactParams): Promise<void> {
      await updateResendContact({ apiKey, email, unsubscribed });
    },
  };
}
