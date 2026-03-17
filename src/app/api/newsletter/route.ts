import { handleNewsletterSubscribe } from "../../../../shared/handlers/newsletter-subscribe";
import { localizePath } from "@/lib/i18n";
import { type SupportedLocale } from "@/lib/locales";
import { SITE_URL, getAllowedOrigins } from "@/lib/site-config";
import { getSystemContent } from "@/lib/site-content";

const ALLOWED_ORIGINS = getAllowedOrigins();

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith("http://localhost:")) return true;
  return false;
}

function corsHeaders(origin: string | null): HeadersInit {
  const corsOrigin = isAllowedOrigin(origin) ? origin ?? ALLOWED_ORIGINS[0] : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("Origin");
  return new Response(null, { headers: corsHeaders(origin), status: 204 });
}

export async function POST(request: Request) {
  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin);
  const requestUrl = new URL(request.url);

  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ success: false, error: getSystemContent().common.forbidden }),
      { status: 403, headers }
    );
  }

  const response = await handleNewsletterSubscribe(
    request,
    {
      MAIL_PROVIDER: process.env.MAIL_PROVIDER,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      NEWSLETTER_SECRET: process.env.NEWSLETTER_SECRET,
      NEWSLETTER_FROM: process.env.NEWSLETTER_FROM,
    },
    ({ email, ts, sig, locale }) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        (process.env.NODE_ENV === "production" ? SITE_URL : requestUrl.origin);
      const confirmPath =
        process.env.NODE_ENV === "production"
          ? "/api/newsletter-confirm"
          : localizePath(locale as SupportedLocale, "/newsletter-confirm");
      const localeParam =
        process.env.NODE_ENV === "production" ? `&locale=${locale}` : "";
      return `${baseUrl}${confirmPath}?email=${encodeURIComponent(email)}&ts=${ts}&sig=${sig}${localeParam}`;
    }
  );

  // Merge CORS headers with the shared handler's response headers
  const mergedHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(headers as Record<string, string>)) {
    mergedHeaders.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers: mergedHeaders });
}
