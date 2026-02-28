import { NewsletterPayloadSchema } from "../../shared/newsletter";

interface Env {
  RESEND_API_KEY?: string;
  RESEND_SEGMENT_ID?: string;
  NEWSLETTER_SECRET?: string;
  NEWSLETTER_FROM?: string;
}

const ALLOWED_ORIGINS = [
  "https://wchen.ai",
  "https://www.wchen.ai",
];

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

async function hmacSign(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
      JSON.stringify({ success: false, error: "Forbidden" }),
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
          JSON.stringify({ success: false, error: "Invalid submission" }),
          { status: 400, headers }
        );
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation failed",
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
        JSON.stringify({ success: true, message: "Check your email to confirm your subscription." }),
        { status: 200, headers }
      );
    }

    const ts = Math.floor(Date.now() / 1000).toString();
    const sig = await hmacSign(secret, `${email}|${ts}`);
    const confirmUrl = `https://wchen.ai/api/newsletter-confirm?email=${encodeURIComponent(email)}&ts=${ts}&sig=${sig}`;
    const from = env.NEWSLETTER_FROM ?? "Wilson Chen <newsletter@wchen.ai>";

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Confirm your subscription to Wilson Chen's writing",
        html: `<p>Thanks for subscribing! Click the link below to confirm:</p><p><a href="${confirmUrl}">Confirm subscription</a></p><p>This link expires in 24 hours.</p>`,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", emailRes.status, errBody);
      throw new Error(`Resend responded with ${emailRes.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Check your email to confirm your subscription." }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error processing newsletter subscription:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to process subscription. Please try again later." }),
      { status: 500, headers }
    );
  }
}
