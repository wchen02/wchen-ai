import { z } from "zod";

/**
 * Single source of truth for the contact form payload.
 * Used by both the frontend (src/lib/schemas.ts) and the Pages Function (functions/api/contact.ts).
 */
export const ContactPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  _honey: z.string().max(0, "Invalid submission"),
});

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;
