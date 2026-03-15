import { hmacSign, timingSafeEqual } from "../newsletter-crypto";
import { updateResendContact } from "../resend";
import {
  DEFAULT_LOCALE,
  getPreferredLocaleFromAcceptLanguage,
  resolveLocale,
} from "../../src/lib/locales";
import { logger } from "../../src/lib/logger";
import { getSystemContent } from "../../src/lib/site-content";

/**
 * Provider-agnostic environment for the newsletter unsubscribe handler.
 * Populate from process.env (Next.js), context.env (Cloudflare),
 * or event variables (Lambda) before calling handleNewsletterUnsubscribe().
 */
export interface NewsletterUnsubscribeHandlerEnv {
  RESEND_API_KEY?: string;
  NEWSLETTER_SECRET?: string;
}

function htmlResponse(body: string, status = 400, locale?: string): Response {
  const systemContent = getSystemContent(locale ?? DEFAULT_LOCALE);
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${systemContent.common.newsletterHtmlTitle}</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:4rem auto;padding:0 1rem;"><p>${body}</p></body></html>`,
    { status, headers: { "Content-Type": "text/html;charset=utf-8" } }
  );
}

export function getLocaleFromRequest(request: Request): string {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  return localeParam
    ? resolveLocale(localeParam)
    : getPreferredLocaleFromAcceptLanguage(request.headers.get("Accept-Language"));
}

/**
 * Provider-agnostic newsletter unsubscribe handler.
 *
 * Handles both GET (returns HTML/redirect for browser-initiated unsubscribes,
 * e.g. one-click List-Unsubscribe) and POST (returns JSON for client-side
 * unsubscribe pages).
 *
 * Email and HMAC signature are read from URL query parameters (?email=…&sig=…).
 *
 * Usage:
 *   // Next.js App Router
 *   export async function POST(request: Request) {
 *     return handleNewsletterUnsubscribe(request, {
 *       RESEND_API_KEY: process.env.RESEND_API_KEY,
 *       NEWSLETTER_SECRET: process.env.NEWSLETTER_SECRET,
 *     });
 *   }
 *
 *   // Cloudflare Workers / Pages Functions
 *   export async function onRequestPost({ request, env }) {
 *     return handleNewsletterUnsubscribe(request, env);
 *   }
 *
 *   // AWS Lambda (via adapter)
 *   export const handler = async (event) => {
 *     const request = lambdaEventToRequest(event);
 *     const response = await handleNewsletterUnsubscribe(request, {
 *       RESEND_API_KEY: process.env.RESEND_API_KEY,
 *       NEWSLETTER_SECRET: process.env.NEWSLETTER_SECRET,
 *     });
 *     return responseToLambdaResult(response);
 *   };
 */
export async function handleNewsletterUnsubscribe(
  request: Request,
  env: NewsletterUnsubscribeHandlerEnv
): Promise<Response> {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const sig = url.searchParams.get("sig");
  const preferredLocale = getLocaleFromRequest(request);
  const systemContent = getSystemContent(preferredLocale);

  const jsonError = (message: string, status: number) =>
    request.method === "POST"
      ? Response.json({ success: false, error: message }, { status })
      : htmlResponse(message, status, preferredLocale);

  if (!email || !sig) {
    return jsonError(systemContent.newsletter.invalidUnsubscribeLink, 400);
  }

  if (!env.NEWSLETTER_SECRET || !env.RESEND_API_KEY) {
    logger.error("Newsletter unsubscribe not configured");
    return jsonError(systemContent.common.genericError, 500);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [expectedRaw, expectedNorm] = await Promise.all([
    hmacSign(env.NEWSLETTER_SECRET, email),
    normalizedEmail !== email
      ? hmacSign(env.NEWSLETTER_SECRET, normalizedEmail)
      : Promise.resolve(""),
  ]);
  const sigValid =
    timingSafeEqual(sig, expectedRaw) ||
    (expectedNorm !== "" && timingSafeEqual(sig, expectedNorm));
  if (!sigValid) {
    return jsonError(systemContent.newsletter.invalidUnsubscribeLink, 400);
  }

  await updateResendContact({
    apiKey: env.RESEND_API_KEY,
    email: normalizedEmail,
    unsubscribed: true,
  });

  if (request.method === "POST") {
    return Response.json({
      success: true,
      redirectTo: "/newsletter-unsubscribed",
    });
  }

  const localizedPath = `/${preferredLocale}/newsletter-unsubscribed`;
  return Response.redirect(new URL(localizedPath, request.url).toString(), 302);
}
