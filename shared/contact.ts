import { z } from "zod";
import systemContent from "../content/locales/en/site/system.json";

/**
 * Single source of truth for the contact form payload.
 * Used by both the frontend (src/lib/schemas.ts) and the Pages Function (functions/api/contact.ts).
 */
export const ContactPayloadSchema = z.object({
  name: z.string().min(1, systemContent.validation.nameRequired),
  email: z.string().email(systemContent.validation.invalidEmail),
  message: z.string().min(10, systemContent.validation.messageTooShort),
  _honey: z.string().max(0, systemContent.common.invalidSubmission),
});

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;
