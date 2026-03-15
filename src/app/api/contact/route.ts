import { handleContact } from "../../../../shared/handlers/contact";

export async function POST(request: Request) {
  return handleContact(request, {
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
    MAILGUN_FROM_EMAIL: process.env.MAILGUN_FROM_EMAIL,
    MAILGUN_EU: process.env.MAILGUN_EU,
  });
}
