import { NEWSLETTER_TOKEN_MAX_AGE_S, hmacSign, timingSafeEqual } from "../../shared/newsletter-crypto";
import {
  createNewsletterWelcomeIdempotencyKey,
  renderNewsletterWelcomeEmail,
} from "../../shared/newsletter-email";
import { sendResendEmail, upsertResendContact } from "../../shared/resend";
import { logger } from "../../src/lib/logger";
import { resolveLocale } from "../../src/lib/locales";
import {
  SITE_URL,
  getNewsletterEmailBrand,
  getNewsletterEmailContent,
  getNewsletterFromAddress,
  getNewsletterUnsubscribeUrl,
} from "../../src/lib/site-config";
import { getSystemContent } from "../../src/lib/site-content";

interface Env {
  RESEND_API_KEY?: string;
  RESEND_SEGMENT_ID?: string;
  NEWSLETTER_SECRET?: string;
  NEWSLETTER_FROM?: string;
}

function htmlResponse(body: string, status = 400, locale?: string): Response {
  const systemContent = getSystemContent(locale);
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${systemContent.common.newsletterHtmlTitle}</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:4rem auto;padding:0 1rem;"><p>${body}</p></body></html>`,
    { status, headers: { "Content-Type": "text/html;charset=utf-8" } }
  );
}

export async function onRequestGet(context: EventContext<Env, string, unknown>) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const ts = url.searchParams.get("ts");
  const sig = url.searchParams.get("sig");
  const resolvedLocale = resolveLocale(url.searchParams.get("locale"));

  if (!email || !ts || !sig) {
    return htmlResponse(getSystemContent(resolvedLocale).newsletter.invalidConfirmationLink, 400, resolvedLocale);
  }

  const secret = env.NEWSLETTER_SECRET;
  const apiKey = env.RESEND_API_KEY;
  const segmentId = env.RESEND_SEGMENT_ID;

  if (!secret || !apiKey || !segmentId) {
    logger.error("Newsletter confirm not configured");
    return htmlResponse(getSystemContent(resolvedLocale).common.genericError, 500, resolvedLocale);
  }

  const from = getNewsletterFromAddress(env.NEWSLETTER_FROM, resolvedLocale);

  const now = Math.floor(Date.now() / 1000);
  const tokenAge = now - parseInt(ts, 10);
  if (isNaN(tokenAge) || tokenAge < 0 || tokenAge > NEWSLETTER_TOKEN_MAX_AGE_S) {
    return htmlResponse(getSystemContent(resolvedLocale).newsletter.expiredConfirmationLink, 400, resolvedLocale);
  }

  const expected = await hmacSign(secret, `${email}|${ts}`);
  if (!timingSafeEqual(sig, expected)) {
    return htmlResponse(getSystemContent(resolvedLocale).newsletter.invalidConfirmationLink, 400, resolvedLocale);
  }

  try {
    await upsertResendContact({
      apiKey,
      email,
      segmentId,
      properties: { preferred_locale: resolvedLocale },
    });

    const brand = getNewsletterEmailBrand(SITE_URL, resolvedLocale);
    const newsletterContent = getNewsletterEmailContent(SITE_URL, resolvedLocale);
    const normalizedEmail = email.trim().toLowerCase();
    const unsubscribeSig = await hmacSign(secret, normalizedEmail);
    const unsubscribeUrl = getNewsletterUnsubscribeUrl({
      email: normalizedEmail,
      sig: unsubscribeSig,
      siteUrl: SITE_URL,
      useLocalPage: true,
      locale: resolvedLocale,
    });
    const welcomeEmail = await renderNewsletterWelcomeEmail({
      brand,
      content: newsletterContent.welcome,
      footer: newsletterContent.footer,
      unsubscribeUrl,
    });

    try {
      await sendResendEmail({
        apiKey,
        from,
        to: email,
        subject: newsletterContent.welcome.subject,
        html: welcomeEmail.html,
        text: welcomeEmail.text,
        idempotencyKey: createNewsletterWelcomeIdempotencyKey(email, ts),
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
    } catch (error) {
      logger.error("Error sending newsletter welcome email:", error);
    }

    const origin = new URL(request.url).origin;
    return Response.redirect(`${origin}/${resolvedLocale}/newsletter-confirmed`, 302);
  } catch (error) {
    logger.error("Error confirming newsletter subscription:", error);
    return htmlResponse(getSystemContent(resolvedLocale).common.genericError, 500, resolvedLocale);
  }
}
