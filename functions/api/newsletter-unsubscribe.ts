import { hmacSign, timingSafeEqual } from "../../shared/newsletter-crypto";
import { updateResendContact } from "../../shared/resend";

interface Env {
  RESEND_API_KEY?: string;
  NEWSLETTER_SECRET?: string;
}

function htmlResponse(body: string, status = 400): Response {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Newsletter</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:4rem auto;padding:0 1rem;"><p>${body}</p></body></html>`,
    { status, headers: { "Content-Type": "text/html;charset=utf-8" } }
  );
}

async function unsubscribe(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const sig = url.searchParams.get("sig");

  if (!email || !sig) {
    return request.method === "POST"
      ? new Response("", { status: 400 })
      : htmlResponse("Invalid unsubscribe link.");
  }

  if (!env.NEWSLETTER_SECRET || !env.RESEND_API_KEY) {
    console.error("Newsletter unsubscribe not configured");
    return request.method === "POST"
      ? new Response("", { status: 500 })
      : htmlResponse("Something went wrong. Please try again later.", 500);
  }

  const expected = await hmacSign(env.NEWSLETTER_SECRET, email);
  if (!timingSafeEqual(sig, expected)) {
    return request.method === "POST"
      ? new Response("", { status: 400 })
      : htmlResponse("Invalid unsubscribe link.");
  }

  await updateResendContact({
    apiKey: env.RESEND_API_KEY,
    email,
    unsubscribed: true,
  });

  if (request.method === "POST") {
    return new Response("", { status: 202 });
  }

  return Response.redirect(new URL("/newsletter-unsubscribed", request.url).toString(), 302);
}

export async function onRequestGet(context: EventContext<Env, string, unknown>) {
  try {
    return await unsubscribe(context.request, context.env);
  } catch (error) {
    console.error("Error unsubscribing newsletter contact:", error);
    return htmlResponse("Something went wrong. Please try again later.", 500);
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
