import { handleNewsletterUnsubscribe } from "../../../../shared/handlers/newsletter-unsubscribe";

export async function POST(request: Request) {
  return handleNewsletterUnsubscribe(request, {
    MAIL_PROVIDER: process.env.MAIL_PROVIDER,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEWSLETTER_SECRET: process.env.NEWSLETTER_SECRET,
  });
}
