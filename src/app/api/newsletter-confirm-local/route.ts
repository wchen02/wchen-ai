import { NextResponse } from "next/server";

const TOKEN_MAX_AGE_S = 86400; // 24 hours

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

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    email?: string;
    ts?: string;
    sig?: string;
  };
  const email = payload.email ?? null;
  const ts = payload.ts ?? null;
  const sig = payload.sig ?? null;

  if (!email || !ts || !sig) {
    return NextResponse.json(
      { success: false, error: "Invalid confirmation link. Please try subscribing again." },
      { status: 400 }
    );
  }

  const secret = process.env.NEWSLETTER_SECRET;
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;

  if (!secret || !apiKey || !segmentId) {
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }

  const tokenAge = Math.floor(Date.now() / 1000) - Number.parseInt(ts, 10);
  if (Number.isNaN(tokenAge) || tokenAge < 0 || tokenAge > TOKEN_MAX_AGE_S) {
    return NextResponse.json(
      { success: false, error: "This confirmation link has expired. Please subscribe again." },
      { status: 400 }
    );
  }

  const expected = await hmacSign(secret, `${email}|${ts}`);
  if (!timingSafeEqual(sig, expected)) {
    return NextResponse.json(
      { success: false, error: "Invalid confirmation link. Please try subscribing again." },
      { status: 400 }
    );
  }

  try {
    const contactRes = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email, segments: [{ id: segmentId }] }),
    });

    if (!contactRes.ok) {
      const errBody = await contactRes.text();
      throw new Error(`Resend responded with ${contactRes.status}`);
    }

    return NextResponse.json({ success: true, redirectTo: "/newsletter-confirmed" });
  } catch (error) {
    console.error("Error confirming newsletter subscription locally:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
