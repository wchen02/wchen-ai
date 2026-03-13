import { NewsletterPayloadSchema } from "../../shared/newsletter";
import { hmacSign } from "../../shared/newsletter-crypto";
import { renderNewsletterConfirmEmail } from "../../shared/newsletter-email";
import { sendResendEmail } from "../../shared/resend";
import {
  SITE_URL,
  getAllowedOrigins,
  getNewsletterEmailBrand,
  getNewsletterEmailContent,
  getNewsletterFromAddress,
} from "../../src/lib/site-config";
import { getSystemContent } from "../../src/lib/site-content";

interface Env {
  RESEND_API_KEY?: string;
  RESEND_SEGMENT_ID?: string;
  NEWSLETTER_SECRET?: string;
  NEWSLETTER_FROM?: string;
}

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

export async function onRequestOptions(context: EventContext<Env, string, unknown>) {
  const origin = context.request.headers.get("Origin");
  return new Response(null, { headers: corsHeaders(origin), status: 204 });
}

export async function onRequestPost(context: EventContext<Env, string, unknown>) {
  const { request, env } = context;
  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin);

  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ success: false, error: systemContent.common.forbidden }),
      { status: 403, headers }
    );
  }

  try {
    const rawBody = await request.text();
    const parsed = NewsletterPayloadSchema.safeParse(JSON.parse(rawBody));

    if (!parsed.success) {
      const issues = parsed.error.issues;
      const honeyIssue = issues.find((i) => i.path.includes("_honey"));
      if (honeyIssue) {
        return new Response(
          JSON.stringify({ success: false, error: systemContent.common.invalidSubmission }),
          { status: 400, headers }
        );
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: systemContent.common.validationFailed,
          details: issues.map((i) => ({ field: i.path.join("."), message: i.message })),
        }),
        { status: 400, headers }
      );
    }

    const { email } = parsed.data;
    const secret = env.NEWSLETTER_SECRET;
    const apiKey = env.RESEND_API_KEY;

    if (!secret || !apiKey) {
      console.warn("Newsletter not configured: set NEWSLETTER_SECRET + RESEND_API_KEY.");
      return new Response(
        JSON.stringify({ success: true, message: systemContent.newsletter.subscribeSuccess }),
        { status: 200, headers }
      );
    }

    const ts = Math.floor(Date.now() / 1000).toString();
    const sig = await hmacSign(secret, `${email}|${ts}`);
    const confirmUrl = `${SITE_URL}/api/newsletter-confirm?email=${encodeURIComponent(email)}&ts=${ts}&sig=${sig}`;
    const from = getNewsletterFromAddress(env.NEWSLETTER_FROM);
    const brand = getNewsletterEmailBrand(SITE_URL);
    const newsletterContent = getNewsletterEmailContent(SITE_URL);
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

    return new Response(
      JSON.stringify({ success: true, message: systemContent.newsletter.subscribeSuccess }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error processing newsletter subscription:", error);
    return new Response(
      JSON.stringify({ success: false, error: systemContent.newsletter.subscribeFailure }),
      { status: 500, headers }
    );
  }
}
