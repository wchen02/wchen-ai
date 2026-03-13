import { NextResponse } from "next/server";
import { NewsletterPayloadSchema } from "../../../../shared/newsletter";
import { hmacSign } from "../../../../shared/newsletter-crypto";
import { renderNewsletterConfirmEmail } from "../../../../shared/newsletter-email";
import { sendResendEmail } from "../../../../shared/resend";
import {
  SITE_URL,
  getAllowedOrigins,
  getNewsletterEmailBrand,
  getNewsletterEmailContent,
  getNewsletterFromAddress,
} from "@/lib/site-config";

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
      JSON.stringify({ success: false, error: "Forbidden" }),
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
      if (honeyIssue) {
        return NextResponse.json(
          { success: false, error: "Invalid submission" },
          { status: 400, headers }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400, headers }
      );
    }

    const { email } = parsed.data;
    const secret = process.env.NEWSLETTER_SECRET;
    const apiKey = process.env.RESEND_API_KEY;

    if (!secret || !apiKey) {
      return NextResponse.json(
        {
          success: true,
          message: "Check your email to confirm your subscription.",
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
        : "/newsletter-confirm";
    const confirmUrl = `${baseUrl}${confirmPath}?email=${encodeURIComponent(email)}&ts=${ts}&sig=${sig}`;
    const from = getNewsletterFromAddress(process.env.NEWSLETTER_FROM);
    const brand = getNewsletterEmailBrand(baseUrl);
    const newsletterContent = getNewsletterEmailContent(baseUrl);
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
        message: "Check your email to confirm your subscription.",
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error processing newsletter subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process subscription. Please try again later.",
      },
      { status: 500, headers }
    );
  }
}
