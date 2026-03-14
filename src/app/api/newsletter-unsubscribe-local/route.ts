import { NextResponse } from "next/server";
import { hmacSign, timingSafeEqual } from "../../../../shared/newsletter-crypto";
import { updateResendContact } from "../../../../shared/resend";
import { logger } from "@/lib/logger";
import { resolveLocale } from "@/lib/locales";
import { getSystemContent } from "@/lib/site-content";

async function unsubscribe(request: Request): Promise<
  | { success: true; redirectTo: string }
  | { success: false; error: string; status: number }
> {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const sig = url.searchParams.get("sig");
  const preferredLocale = resolveLocale(url.searchParams.get("locale") ?? null);
  const systemContent = getSystemContent(preferredLocale);

  if (!email || !sig) {
    return { success: false, error: systemContent.newsletter.invalidUnsubscribeLink, status: 400 };
  }

  const secret = process.env.NEWSLETTER_SECRET;
  const apiKey = process.env.RESEND_API_KEY;
  if (!secret || !apiKey) {
    return { success: false, error: systemContent.common.genericError, status: 500 };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [expectedRaw, expectedNorm] = await Promise.all([
    hmacSign(secret, email),
    normalizedEmail !== email ? hmacSign(secret, normalizedEmail) : Promise.resolve(""),
  ]);
  const sigValid =
    timingSafeEqual(sig, expectedRaw) ||
    (expectedNorm !== "" && timingSafeEqual(sig, expectedNorm));
  if (!sigValid) {
    return { success: false, error: systemContent.newsletter.invalidUnsubscribeLink, status: 400 };
  }

  await updateResendContact({
    apiKey,
    email: normalizedEmail,
    unsubscribed: true,
  });

  const redirectTo = `/${preferredLocale}/newsletter-unsubscribed`;
  return { success: true, redirectTo };
}

export async function POST(request: Request) {
  try {
    const result = await unsubscribe(request);
    if (result.success) {
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    logger.error("Error unsubscribing newsletter contact locally:", error);
    const url = new URL(request.url);
    const locale = resolveLocale(url.searchParams.get("locale") ?? null);
    return NextResponse.json(
      { success: false, error: getSystemContent(locale).common.genericError },
      { status: 500 }
    );
  }
}

