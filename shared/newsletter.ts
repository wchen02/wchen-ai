import { z } from "zod";
import systemContent from "../content/locales/en/site/system.json";

export const NewsletterPayloadSchema = z.object({
  email: z.string().email(systemContent.validation.invalidEmail),
  _honey: z.string().max(0, systemContent.common.invalidSubmission),
});

export type NewsletterPayload = z.infer<typeof NewsletterPayloadSchema>;
