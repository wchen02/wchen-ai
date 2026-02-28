interface Env {
  RESEND_API_KEY?: string;
  RESEND_SEGMENT_ID?: string;
  NEWSLETTER_SECRET?: string;
}

const TOKEN_MAX_AGE_S = 86400; // 24 hours

function htmlResponse(body: string, status = 400): Response {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Newsletter</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:4rem auto;padding:0 1rem;"><p>${body}</p></body></html>`,
    { status, headers: { "Content-Type": "text/html;charset=utf-8" } }
  );
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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

export async function onRequestGet(context: EventContext<Env, string, unknown>) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const ts = url.searchParams.get("ts");
  const sig = url.searchParams.get("sig");

  if (!email || !ts || !sig) {
    return htmlResponse("Invalid confirmation link. Please try subscribing again.");
  }

  const secret = env.NEWSLETTER_SECRET;
  const apiKey = env.RESEND_API_KEY;
  const segmentId = env.RESEND_SEGMENT_ID;

  if (!secret || !apiKey || !segmentId) {
    console.error("Newsletter confirm not configured");
    return htmlResponse("Something went wrong. Please try again later.", 500);
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenAge = now - parseInt(ts, 10);
  if (isNaN(tokenAge) || tokenAge < 0 || tokenAge > TOKEN_MAX_AGE_S) {
    return htmlResponse("This confirmation link has expired. Please subscribe again.");
  }

  const expected = await hmacSign(secret, `${email}|${ts}`);
  if (!timingSafeEqual(sig, expected)) {
    return htmlResponse("Invalid confirmation link. Please try subscribing again.");
  }

  try {
    const contactRes = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email, segments: [segmentId] }),
    });

    if (!contactRes.ok) {
      const errBody = await contactRes.text();
      console.error("Resend contact error:", contactRes.status, errBody);
      throw new Error(`Resend responded with ${contactRes.status}`);
    }

    return Response.redirect(new URL("/newsletter-confirmed", request.url).toString(), 302);
  } catch (error) {
    console.error("Error confirming newsletter subscription:", error);
    return htmlResponse("Something went wrong. Please try again later.", 500);
  }
}
