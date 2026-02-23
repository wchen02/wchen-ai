import { z } from 'zod';

const ContactPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  _honey: z.string().max(0, "Invalid submission"),
});

interface Env {
  CONTACT_WEBHOOK_URL?: string;
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

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function onRequestPost(context: EventContext<Env, string, unknown>) {
  const { request, env } = context;

  const origin = request.headers.get("Origin");
  const corsOrigin = isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0];
  const headers = new Headers({
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });

  if (request.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ success: false, error: "Forbidden" }),
      { status: 403, headers }
    );
  }

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
      { status: 429, headers }
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

    const webhookUrl = env.CONTACT_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn("CONTACT_WEBHOOK_URL is not configured.");
      return new Response(
        JSON.stringify({ success: true, message: "Development mode: Message received but not sent." }),
        { status: 200, headers }
      );
    }

    const forwardResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        source: "wchen.ai contact form",
      }),
    });

    if (!forwardResponse.ok) {
      throw new Error(`Webhook responded with ${forwardResponse.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Thanks for reaching out! I'll get back to you soon." }),
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
