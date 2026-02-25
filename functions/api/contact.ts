import { ContactPayloadSchema } from "../../shared/contact";

interface Env {
  CONTACT_TO_EMAIL?: string;
  MAILGUN_API_KEY?: string;
  MAILGUN_DOMAIN?: string;
  /** Optional. Defaults to "Contact Form <noreply@{MAILGUN_DOMAIN}>" */
  MAILGUN_FROM_EMAIL?: string;
  /** Set to "1" to use EU API endpoint (api.eu.mailgun.net) */
  MAILGUN_EU?: string;
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

// Rate limiting: Cloudflare Workers are stateless — in-memory Maps reset on
// every cold start and are isolated per edge location. For production rate
// limiting, configure Cloudflare WAF Rate Limiting Rules in the dashboard
// (Security > WAF > Rate limiting rules) targeting POST /api/contact.
// The honeypot field + Cloudflare's built-in bot management provide the
// primary spam defense layer for this personal site contact form.

function getMailgunBaseUrl(env: Env): string {
  return env.MAILGUN_EU === "1" ? "https://api.eu.mailgun.net" : "https://api.mailgun.net";
}

async function sendViaMailgun(
  env: Env,
  params: {
    to: string;
    replyTo: string;
    replyToName: string;
    subject: string;
    body: string;
  }
): Promise<Response> {
  const domain = env.MAILGUN_DOMAIN!;
  const from =
    env.MAILGUN_FROM_EMAIL ?? `Contact Form <noreply@${domain}>`;
  const body = new URLSearchParams({
    from,
    to: params.to,
    subject: params.subject,
    text: params.body,
    "h:Reply-To": `${params.replyToName} <${params.replyTo}>`,
  });
  const apiKey = env.MAILGUN_API_KEY!;
  const res = await fetch(`${getMailgunBaseUrl(env)}/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`api:${apiKey}`),
    },
    body: body.toString(),
  });
  return res;
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
      JSON.stringify({ success: false, error: "Forbidden" }),
      { status: 403, headers }
    );
  }

  try {
    const rawBody = await request.text();
    const parsed = ContactPayloadSchema.safeParse(JSON.parse(rawBody));

    if (!parsed.success) {
      const issues = parsed.error.issues;
      const honeyIssue = issues.find(i => i.path.includes("_honey"));
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
          details: issues.map(i => ({ field: i.path.join("."), message: i.message })),
        }),
        { status: 400, headers }
      );
    }

    const { name, email, message } = parsed.data;
    const n = name.trim();
    const e = email.trim();
    const m = message.trim();

    const toEmail = env.CONTACT_TO_EMAIL;
    const useMailgun =
      toEmail && env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN;

    if (useMailgun) {
      const mailRes = await sendViaMailgun(env, {
        to: toEmail,
        replyTo: e,
        replyToName: n,
        subject: `Contact form: ${n}`,
        body: `From: ${n} <${e}>\n\n${m}`,
      });
      if (!mailRes.ok) {
        const errBody = await mailRes.text();
        console.error("Mailgun error:", mailRes.status, errBody);
        throw new Error(`Mailgun responded with ${mailRes.status}`);
      }
      return new Response(
        JSON.stringify({ success: true, message: "Thanks for reaching out! I'll get back to you soon." }),
        { status: 200, headers }
      );
    }

    console.warn(
      "No contact delivery configured: set CONTACT_TO_EMAIL + MAILGUN_API_KEY + MAILGUN_DOMAIN."
    );
    return new Response(
      JSON.stringify({ success: true, message: "Development mode: Message received but not sent." }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to send message. Please try again later." }),
      { status: 500, headers }
    );
  }
}
