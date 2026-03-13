import { hmacSign, timingSafeEqual } from "../../shared/newsletter-crypto";
import { updateResendContact } from "../../shared/resend";
import {
  DEFAULT_LOCALE,
  getPreferredLocaleFromAcceptLanguage,
  resolveLocale,
} from "../../src/lib/locales";
import { getSystemContent } from "../../src/lib/site-content";

interface Env {
  RESEND_API_KEY?: string;
  NEWSLETTER_SECRET?: string;
}

function getLocaleFromRequest(request: Request): string {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  return localeParam
    ? resolveLocale(localeParam)
    : getPreferredLocaleFromAcceptLanguage(request.headers.get("Accept-Language"));
}

function htmlResponse(body: string, status = 400, locale?: string): Response {
  const systemContent = getSystemContent(locale ?? DEFAULT_LOCALE);
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${systemContent.common.newsletterHtmlTitle}</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:4rem auto;padding:0 1rem;"><p>${body}</p></body></html>`,
    { status, headers: { "Content-Type": "text/html;charset=utf-8" } }
  );
}

async function unsubscribe(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const sig = url.searchParams.get("sig");
  const preferredLocale = getLocaleFromRequest(request);
  const systemContent = getSystemContent(preferredLocale);

  if (!email || !sig) {
    return request.method === "POST"
      ? new Response("", { status: 400 })
      : htmlResponse(systemContent.newsletter.invalidUnsubscribeLink, 400, preferredLocale);
  }

  if (!env.NEWSLETTER_SECRET || !env.RESEND_API_KEY) {
    console.error("Newsletter unsubscribe not configured");
    return request.method === "POST"
      ? new Response("", { status: 500 })
      : htmlResponse(systemContent.common.genericError, 500, preferredLocale);
  }

  const expected = await hmacSign(env.NEWSLETTER_SECRET, email);
  if (!timingSafeEqual(sig, expected)) {
    return request.method === "POST"
      ? new Response("", { status: 400 })
      : htmlResponse(systemContent.newsletter.invalidUnsubscribeLink, 400, preferredLocale);
  }

  await updateResendContact({
    apiKey: env.RESEND_API_KEY,
    email,
    unsubscribed: true,
  });

  if (request.method === "POST") {
    return new Response("", { status: 202 });
  }

  const localizedPath = `/${preferredLocale}/newsletter-unsubscribed`;
  return Response.redirect(new URL(localizedPath, request.url).toString(), 302);
}

export async function onRequestGet(context: EventContext<Env, string, unknown>) {
  try {
    return await unsubscribe(context.request, context.env);
  } catch (error) {
    console.error("Error unsubscribing newsletter contact:", error);
    const locale = getLocaleFromRequest(context.request);
    return htmlResponse(getSystemContent(locale).common.genericError, 500, locale);
  }
}

export async function onRequestPost(context: EventContext<Env, string, unknown>) {
  try {
    return await unsubscribe(context.request, context.env);
  } catch (error) {
    console.error("Error unsubscribing newsletter contact:", error);
    return new Response("", { status: 500 });
  }
}
