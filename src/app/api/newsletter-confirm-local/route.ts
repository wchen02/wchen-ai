import { NextResponse } from "next/server";
import { NEWSLETTER_TOKEN_MAX_AGE_S, hmacSign, timingSafeEqual } from "../../../../shared/newsletter-crypto";
import {
  createNewsletterWelcomeIdempotencyKey,
  renderNewsletterWelcomeEmail,
} from "../../../../shared/newsletter-email";
import { sendResendEmail, upsertResendContact } from "../../../../shared/resend";
import { resolveLocale } from "@/lib/locales";
import {
  getNewsletterEmailBrand,
  getNewsletterEmailContent,
  getNewsletterFromAddress,
  getNewsletterUnsubscribeUrl,
} from "@/lib/site-config";
import { logger } from "@/lib/logger";
import { getSystemContent } from "@/lib/site-content";

export async function POST(request: Request) {
  let payload: { email?: string; ts?: string; sig?: string; locale?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    const resolvedLocale = resolveLocale(null);
    return NextResponse.json(
      { success: false, error: getSystemContent(resolvedLocale).common.genericError },
      { status: 400 }
    );
  }
  const email = payload.email ?? null;
  const ts = payload.ts ?? null;
  const sig = payload.sig ?? null;
  const resolvedLocale = resolveLocale(payload.locale);

  if (!email || !ts || !sig) {
    return NextResponse.json(
      { success: false, error: getSystemContent(resolvedLocale).newsletter.invalidConfirmationLink },
      { status: 400 }
    );
  }

  const secret = process.env.NEWSLETTER_SECRET;
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;
  const requestUrl = new URL(request.url);

  if (!secret || !apiKey || !segmentId) {
    return NextResponse.json(
      { success: false, error: getSystemContent(resolvedLocale).common.genericError },
      { status: 500 }
    );
  }

  const from = getNewsletterFromAddress(process.env.NEWSLETTER_FROM, resolvedLocale);
  const brand = getNewsletterEmailBrand(requestUrl.origin, resolvedLocale);

  const tokenAge = Math.floor(Date.now() / 1000) - Number.parseInt(ts, 10);
  if (Number.isNaN(tokenAge) || tokenAge < 0 || tokenAge > NEWSLETTER_TOKEN_MAX_AGE_S) {
    return NextResponse.json(
      { success: false, error: getSystemContent(resolvedLocale).newsletter.expiredConfirmationLink },
      { status: 400 }
    );
  }

  const expected = await hmacSign(secret, `${email}|${ts}`);
  if (!timingSafeEqual(sig, expected)) {
    return NextResponse.json(
      { success: false, error: getSystemContent(resolvedLocale).newsletter.invalidConfirmationLink },
      { status: 400 }
    );
  }

  try {
    await upsertResendContact({
      apiKey,
      email,
      segmentId,
      properties: { preferred_locale: resolvedLocale },
    });

    const newsletterContent = getNewsletterEmailContent(requestUrl.origin, resolvedLocale);
    const normalizedEmail = email.trim().toLowerCase();
    const unsubscribeSig = await hmacSign(secret, normalizedEmail);
    const unsubscribeUrl = getNewsletterUnsubscribeUrl({
      email: normalizedEmail,
      sig: unsubscribeSig,
      siteUrl: requestUrl.origin,
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
      logger.error("Error sending newsletter welcome email locally:", error);
    }

    return NextResponse.json({ success: true, redirectTo: "/newsletter-confirmed" });
  } catch (error) {
    logger.error("Error confirming newsletter subscription locally:", error);
    return NextResponse.json(
      { success: false, error: getSystemContent(resolvedLocale).common.genericError },
      { status: 500 }
    );
  }
}
