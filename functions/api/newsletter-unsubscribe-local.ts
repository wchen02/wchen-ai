/**
 * Cloudflare Pages Function for /api/newsletter-unsubscribe-local.
 * The static frontend always calls this path (same as Next.js dev). This module
 * delegates to the shared unsubscribe handler so production and dev behave the same.
 */
import { unsubscribe } from "./newsletter-unsubscribe";
import { getLocaleFromRequest } from "./newsletter-unsubscribe";
import { logger } from "../../src/lib/logger";
import { getSystemContent } from "../../src/lib/site-content";

type Env = { RESEND_API_KEY?: string; NEWSLETTER_SECRET?: string };

export async function onRequestGet(
  context: EventContext<Env, string, unknown>
): Promise<Response> {
  return unsubscribe(context.request, context.env);
}

export async function onRequestPost(
  context: EventContext<Env, string, unknown>
): Promise<Response> {
  try {
    return await unsubscribe(context.request, context.env);
  } catch (error) {
    logger.error("Error in newsletter-unsubscribe-local:", error);
    const locale = getLocaleFromRequest(context.request);
    return new Response(
      JSON.stringify({
        success: false,
        error: getSystemContent(locale).common.genericError,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
