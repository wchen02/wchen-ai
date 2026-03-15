import {
  handleNewsletterSubscribe,
  type NewsletterSubscribeHandlerEnv,
} from "../../shared/handlers/newsletter-subscribe";
import { getAllowedOrigins, SITE_URL } from "../../src/lib/site-config";
import { getSystemContent } from "../../src/lib/site-content";

const ALLOWED_ORIGINS = getAllowedOrigins();

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith("http://localhost:")) return true;
  return false;
}

function corsHeaders(origin: string | null): Headers {
  const corsOrigin = isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0];
  return new Headers({
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });
}

export async function onRequestOptions(context: EventContext<NewsletterSubscribeHandlerEnv, string, unknown>) {
  const origin = context.request.headers.get("Origin");
  return new Response(null, { headers: corsHeaders(origin), status: 204 });
}

export async function onRequestPost(context: EventContext<NewsletterSubscribeHandlerEnv, string, unknown>) {
  const { request, env } = context;
  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin);

  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ success: false, error: getSystemContent().common.forbidden }),
      { status: 403, headers }
    );
  }

  const response = await handleNewsletterSubscribe(
    request,
    env,
    ({ email, ts, sig, locale }) =>
      `${SITE_URL}/api/newsletter-confirm?email=${encodeURIComponent(email)}&ts=${ts}&sig=${sig}&locale=${locale}`
  );

  // Merge CORS headers with the shared handler's response headers
  const mergedHeaders = new Headers(response.headers);
  for (const [key, value] of headers.entries()) {
    mergedHeaders.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers: mergedHeaders });
}
