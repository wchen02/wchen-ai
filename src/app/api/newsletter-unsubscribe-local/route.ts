import { NextResponse } from "next/server";
import { hmacSign, timingSafeEqual } from "../../../../shared/newsletter-crypto";
import { updateResendContact } from "../../../../shared/resend";

async function unsubscribe(request: Request): Promise<
  | { success: true; redirectTo: string }
  | { success: false; error: string; status: number }
> {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const sig = url.searchParams.get("sig");

  if (!email || !sig) {
    return { success: false, error: "Invalid unsubscribe link.", status: 400 };
  }

  const secret = process.env.NEWSLETTER_SECRET;
  const apiKey = process.env.RESEND_API_KEY;
  if (!secret || !apiKey) {
    return { success: false, error: "Something went wrong. Please try again later.", status: 500 };
  }

  const expected = await hmacSign(secret, email);
  if (!timingSafeEqual(sig, expected)) {
    return { success: false, error: "Invalid unsubscribe link.", status: 400 };
  }

  await updateResendContact({
    apiKey,
    email,
    unsubscribed: true,
  });

  return { success: true, redirectTo: "/newsletter-unsubscribed" };
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
    console.error("Error unsubscribing newsletter contact locally:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const result = await unsubscribe(request);
    if (result.success) {
      return NextResponse.redirect(new URL(result.redirectTo, request.url));
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error unsubscribing newsletter contact locally:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
