import { handleContact, type ContactHandlerEnv } from "../../shared/handlers/contact";
import { getAllowedOrigins } from "../../src/lib/site-config";
import { getSystemContent } from "../../src/lib/site-content";

const ALLOWED_ORIGINS = getAllowedOrigins();
const systemContent = getSystemContent();

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

// Rate limiting: Cloudflare Workers are stateless — in-memory Maps reset on
// every cold start and are isolated per edge location. For production rate
// limiting, configure Cloudflare WAF Rate Limiting Rules in the dashboard
// (Security > WAF > Rate limiting rules) targeting POST /api/contact.
// The honeypot field + Cloudflare's built-in bot management provide the
// primary spam defense layer for this personal site contact form.

export async function onRequestOptions(context: EventContext<ContactHandlerEnv, string, unknown>) {
  const origin = context.request.headers.get("Origin");
  return new Response(null, { headers: corsHeaders(origin), status: 204 });
}

export async function onRequestPost(context: EventContext<ContactHandlerEnv, string, unknown>) {
  const { request, env } = context;
  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin);

  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ success: false, error: systemContent.common.forbidden }),
      { status: 403, headers }
    );
  }

  const response = await handleContact(request, env);

  // Merge CORS headers with the shared handler's response headers
  const mergedHeaders = new Headers(response.headers);
  for (const [key, value] of headers.entries()) {
    mergedHeaders.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers: mergedHeaders });
}
