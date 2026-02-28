import { z } from "zod";

export const NewsletterPayloadSchema = z.object({
  email: z.string().email("Invalid email address"),
  _honey: z.string().max(0, "Invalid submission"),
});

export type NewsletterPayload = z.infer<typeof NewsletterPayloadSchema>;
