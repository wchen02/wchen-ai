import {
  NEWSLETTER_TOKEN_MAX_AGE_S,
  hmacSign,
  timingSafeEqual,
} from "../newsletter-crypto";
import {
  createNewsletterWelcomeIdempotencyKey,
  renderNewsletterWelcomeEmail,
} from "../newsletter-email";
import { sendResendEmail, upsertResendContact } from "../resend";
import { logger } from "../../src/lib/logger";
import { resolveLocale } from "../../src/lib/locales";
import {
  getNewsletterEmailBrand,
  getNewsletterEmailContent,
  getNewsletterFromAddress,
  getNewsletterUnsubscribeUrl,
} from "../../src/lib/site-config";
import { getSystemContent } from "../../src/lib/site-content";

/**
 * Provider-agnostic environment for the newsletter confirm handlers.
 * Populate from process.env (Next.js), context.env (Cloudflare),
 * or event variables (Lambda) before calling the handler.
 */
export interface NewsletterConfirmHandlerEnv {
  RESEND_API_KEY?: string;
  RESEND_SEGMENT_ID?: string;
  NEWSLETTER_SECRET?: string;
  NEWSLETTER_FROM?: string;
  /**
   * The site's base URL, used to build branding and unsubscribe links.
   * In production this is the canonical site URL; in local dev it is the
   * request origin (e.g. http://localhost:3000).
   */
  siteUrl: string;
}

function htmlResponse(body: string, status = 400, locale?: string): Response {
  const systemContent = getSystemContent(locale);
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${systemContent.common.newsletterHtmlTitle}</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:4rem auto;padding:0 1rem;"><p>${body}</p></body></html>`,
    { status, headers: { "Content-Type": "text/html;charset=utf-8" } }
  );
}

async function confirmSubscription(
  email: string,
  ts: string,
  sig: string,
  resolvedLocale: string,
  env: NewsletterConfirmHandlerEnv,
  requestUrl: URL
): Promise<
  | { ok: true }
  | { ok: false; error: string; status: number }
> {
  const secret = env.NEWSLETTER_SECRET;
  const apiKey = env.RESEND_API_KEY;
  const segmentId = env.RESEND_SEGMENT_ID;

  if (!secret || !apiKey || !segmentId) {
    logger.error("Newsletter confirm not configured");
    return {
      ok: false,
      error: getSystemContent(resolvedLocale).common.genericError,
      status: 500,
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenAge = now - parseInt(ts, 10);
  if (isNaN(tokenAge) || tokenAge < 0 || tokenAge > NEWSLETTER_TOKEN_MAX_AGE_S) {
    return {
      ok: false,
      error: getSystemContent(resolvedLocale).newsletter.expiredConfirmationLink,
      status: 400,
    };
  }

  const expected = await hmacSign(secret, `${email}|${ts}`);
  if (!timingSafeEqual(sig, expected)) {
    return {
      ok: false,
      error: getSystemContent(resolvedLocale).newsletter.invalidConfirmationLink,
      status: 400,
    };
  }

  await upsertResendContact({
    apiKey,
    email,
    segmentId,
    properties: { preferred_locale: resolvedLocale },
  });

  const from = getNewsletterFromAddress(env.NEWSLETTER_FROM, resolvedLocale);
  const brand = getNewsletterEmailBrand(env.siteUrl, resolvedLocale);
  const newsletterContent = getNewsletterEmailContent(env.siteUrl, resolvedLocale);
  const normalizedEmail = email.trim().toLowerCase();
  const unsubscribeSig = await hmacSign(secret, normalizedEmail);
  const unsubscribeUrl = getNewsletterUnsubscribeUrl({
    email: normalizedEmail,
    sig: unsubscribeSig,
    siteUrl: env.siteUrl,
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

  void requestUrl; // consumed by caller for redirect
  return { ok: true };
}

/**
 * Provider-agnostic handler for the GET newsletter confirm flow.
 *
 * Reads token parameters from the URL query string and returns an HTML
 * response or redirect — suitable for the production flow where the user
 * clicks a link in their email (Cloudflare Pages Functions, Lambda@Edge, …).
 *
 * Usage:
 *   // Cloudflare Pages Functions
 *   export async function onRequestGet({ request, env }) {
 *     return handleNewsletterConfirmGet(request, {
 *       ...env,
 *       siteUrl: SITE_URL,
 *     });
 *   }
 */
export async function handleNewsletterConfirmGet(
  request: Request,
  env: NewsletterConfirmHandlerEnv
): Promise<Response> {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const ts = url.searchParams.get("ts");
  const sig = url.searchParams.get("sig");
  const resolvedLocale = resolveLocale(url.searchParams.get("locale"));

  if (!email || !ts || !sig) {
    return htmlResponse(
      getSystemContent(resolvedLocale).newsletter.invalidConfirmationLink,
      400,
      resolvedLocale
    );
  }

  try {
    const result = await confirmSubscription(
      email,
      ts,
      sig,
      resolvedLocale,
      env,
      url
    );

    if (!result.ok) {
      return htmlResponse(result.error, result.status, resolvedLocale);
    }

    return Response.redirect(
      `${url.origin}/${resolvedLocale}/newsletter-confirmed`,
      302
    );
  } catch (error) {
    logger.error("Error confirming newsletter subscription:", error);
    return htmlResponse(
      getSystemContent(resolvedLocale).common.genericError,
      500,
      resolvedLocale
    );
  }
}

/**
 * Provider-agnostic handler for the POST newsletter confirm flow.
 *
 * Reads token parameters from a JSON request body and returns a JSON response
 * — suitable for the local-dev / Next.js flow where the confirmation page
 * calls this endpoint from the browser.
 *
 * Usage:
 *   // Next.js App Router
 *   export async function POST(request: Request) {
 *     const reqUrl = new URL(request.url);
 *     return handleNewsletterConfirmPost(request, {
 *       RESEND_API_KEY: process.env.RESEND_API_KEY,
 *       RESEND_SEGMENT_ID: process.env.RESEND_SEGMENT_ID,
 *       NEWSLETTER_SECRET: process.env.NEWSLETTER_SECRET,
 *       NEWSLETTER_FROM: process.env.NEWSLETTER_FROM,
 *       siteUrl: reqUrl.origin,
 *     });
 *   }
 */
export async function handleNewsletterConfirmPost(
  request: Request,
  env: NewsletterConfirmHandlerEnv
): Promise<Response> {
  let payload: { email?: string; ts?: string; sig?: string; locale?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    const resolvedLocale = resolveLocale(null);
    return Response.json(
      {
        success: false,
        error: getSystemContent(resolvedLocale).common.genericError,
      },
      { status: 400 }
    );
  }

  const email = payload.email ?? null;
  const ts = payload.ts ?? null;
  const sig = payload.sig ?? null;
  const resolvedLocale = resolveLocale(payload.locale);

  if (!email || !ts || !sig) {
    return Response.json(
      {
        success: false,
        error: getSystemContent(resolvedLocale).newsletter.invalidConfirmationLink,
      },
      { status: 400 }
    );
  }

  try {
    const result = await confirmSubscription(
      email,
      ts,
      sig,
      resolvedLocale,
      env,
      new URL(request.url)
    );

    if (!result.ok) {
      return Response.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return Response.json({ success: true, redirectTo: "/newsletter-confirmed" });
  } catch (error) {
    logger.error("Error confirming newsletter subscription locally:", error);
    return Response.json(
      {
        success: false,
        error: getSystemContent(resolvedLocale).common.genericError,
      },
      { status: 500 }
    );
  }
}
