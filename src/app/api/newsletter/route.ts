import { NextResponse } from "next/server";
import { NewsletterPayloadSchema } from "../../../../shared/newsletter";
import { hmacSign } from "../../../../shared/newsletter-crypto";
import { renderNewsletterConfirmEmail } from "../../../../shared/newsletter-email";
import { sendResendEmail } from "../../../../shared/resend";
import { localizePath } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locales";
import {
  SITE_URL,
  getAllowedOrigins,
  getNewsletterEmailBrand,
  getNewsletterEmailContent,
  getNewsletterFromAddress,
} from "@/lib/site-config";
import { logger } from "@/lib/logger";
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

  try {
    const rawBody = await request.text();
    const parsed = NewsletterPayloadSchema.safeParse(
      rawBody ? JSON.parse(rawBody) : {}
    );

    if (!parsed.success) {
      const issues = parsed.error.issues;
      const honeyIssue = issues.find((issue) => issue.path.includes("_honey"));
      const systemContent = getSystemContent();
      if (honeyIssue) {
        return NextResponse.json(
          { success: false, error: systemContent.common.invalidSubmission },
          { status: 400, headers }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: systemContent.common.validationFailed,
          details: issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400, headers }
      );
    }

    const { email, locale: payloadLocale } = parsed.data;
    const locale = resolveLocale(payloadLocale);
    const systemContent = getSystemContent(locale);
    const secret = process.env.NEWSLETTER_SECRET;
    const apiKey = process.env.RESEND_API_KEY;

    if (!secret || !apiKey) {
      return NextResponse.json(
        {
          success: true,
          message: systemContent.newsletter.subscribeSuccess,
        },
        { status: 200, headers }
      );
    }

    const ts = Math.floor(Date.now() / 1000).toString();
    const sig = await hmacSign(secret, `${email}|${ts}`);
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.NODE_ENV === "production" ? SITE_URL : requestUrl.origin);
    const confirmPath =
      process.env.NODE_ENV === "production"
        ? "/api/newsletter-confirm"
        : localizePath(locale as import("@/lib/locales").SupportedLocale, "/newsletter-confirm");
    const confirmQuery = `email=${encodeURIComponent(email)}&ts=${ts}&sig=${sig}${process.env.NODE_ENV === "production" ? `&locale=${locale}` : ""}`;
    const confirmUrl = `${baseUrl}${confirmPath}?${confirmQuery}`;
    const from = getNewsletterFromAddress(process.env.NEWSLETTER_FROM, locale);
    const brand = getNewsletterEmailBrand(baseUrl, locale);
    const newsletterContent = getNewsletterEmailContent(baseUrl, locale);
    const emailContent = await renderNewsletterConfirmEmail({
      brand,
      content: newsletterContent.confirm,
      footer: newsletterContent.footer,
      confirmUrl,
    });

    await sendResendEmail({
      apiKey,
      from,
      to: email,
      subject: newsletterContent.confirm.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
    return NextResponse.json(
      {
        success: true,
        message: systemContent.newsletter.subscribeSuccess,
      },
      { status: 200, headers }
    );
  } catch (error) {
    logger.error("Error processing newsletter subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: getSystemContent().newsletter.subscribeFailure,
      },
      { status: 500, headers }
    );
  }
}
