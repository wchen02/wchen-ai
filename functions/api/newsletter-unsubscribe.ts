import {
  handleNewsletterUnsubscribe,
  getLocaleFromRequest,
  type NewsletterUnsubscribeHandlerEnv,
} from "../../shared/handlers/newsletter-unsubscribe";
import { logger } from "../../src/lib/logger";
import { getSystemContent } from "../../src/lib/site-content";

export async function onRequestGet(context: EventContext<NewsletterUnsubscribeHandlerEnv, string, unknown>) {
  try {
    return await handleNewsletterUnsubscribe(context.request, context.env);
  } catch (error) {
    logger.error("Error unsubscribing newsletter contact:", error);
    const locale = getLocaleFromRequest(context.request);
    const systemContent = getSystemContent(locale);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${systemContent.common.newsletterHtmlTitle}</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:4rem auto;padding:0 1rem;"><p>${systemContent.common.genericError}</p></body></html>`;
    return new Response(html, { status: 500, headers: { "Content-Type": "text/html;charset=utf-8" } });
  }
}

export async function onRequestPost(context: EventContext<NewsletterUnsubscribeHandlerEnv, string, unknown>) {
  try {
    return await handleNewsletterUnsubscribe(context.request, context.env);
  } catch (error) {
    logger.error("Error unsubscribing newsletter contact:", error);
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
