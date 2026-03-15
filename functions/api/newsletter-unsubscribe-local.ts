/**
 * Cloudflare Pages Function for /api/newsletter-unsubscribe-local.
 * The static frontend always calls this path (same as Next.js dev). This module
 * delegates to the shared unsubscribe handler so production and dev behave the same.
 */
import {
  handleNewsletterUnsubscribe,
  getLocaleFromRequest,
  type NewsletterUnsubscribeHandlerEnv,
} from "../../shared/handlers/newsletter-unsubscribe";
import { logger } from "../../src/lib/logger";
import { getSystemContent } from "../../src/lib/site-content";

export async function onRequestGet(
  context: EventContext<NewsletterUnsubscribeHandlerEnv, string, unknown>
): Promise<Response> {
  return handleNewsletterUnsubscribe(context.request, context.env);
}

export async function onRequestPost(
  context: EventContext<NewsletterUnsubscribeHandlerEnv, string, unknown>
): Promise<Response> {
  try {
    return await handleNewsletterUnsubscribe(context.request, context.env);
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
