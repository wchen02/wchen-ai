import { handleNewsletterConfirmPost } from "../../../../shared/handlers/newsletter-confirm";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  return handleNewsletterConfirmPost(request, {
    MAIL_PROVIDER: process.env.MAIL_PROVIDER,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_SEGMENT_ID: process.env.RESEND_SEGMENT_ID,
    NEWSLETTER_SECRET: process.env.NEWSLETTER_SECRET,
    NEWSLETTER_FROM: process.env.NEWSLETTER_FROM,
    siteUrl: requestUrl.origin,
  });
}
