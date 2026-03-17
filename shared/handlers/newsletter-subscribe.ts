import { NewsletterPayloadSchema } from "../newsletter";
import { hmacSign } from "../newsletter-crypto";
import { renderNewsletterConfirmEmail } from "../newsletter-email";
import { getMailProvider, type MailProviderEnv } from "../mail";
import { resolveLocale } from "../../src/lib/locales";
import {
  getNewsletterEmailBrand,
  getNewsletterEmailContent,
  getNewsletterFromAddress,
} from "../../src/lib/site-config";
import { logger } from "../../src/lib/logger";
import { getSystemContent } from "../../src/lib/site-content";

/**
 * Provider-agnostic environment for the newsletter subscribe handler.
 * Populate from process.env (Next.js), context.env (Cloudflare),
 * or event variables (Lambda) before calling handleNewsletterSubscribe().
 */
export interface NewsletterSubscribeHandlerEnv extends MailProviderEnv {
  NEWSLETTER_SECRET?: string;
  NEWSLETTER_FROM?: string;
}

/**
 * A function that builds the email confirmation URL given the signed token
 * parameters. The provider wrapper supplies this so that the URL can be
 * constructed from provider-specific configuration (e.g. base URL, path
 * convention, locale encoding strategy).
 *
 * @example
 * // Cloudflare / production
 * const buildConfirmUrl: BuildConfirmUrl = ({ email, ts, sig, locale }) =>
 *   `${SITE_URL}/api/newsletter-confirm?email=${encodeURIComponent(email)}&ts=${ts}&sig=${sig}&locale=${locale}`;
 *
 * // Next.js local development
 * const buildConfirmUrl: BuildConfirmUrl = ({ email, ts, sig, locale }) => {
 *   const path = localizePath(locale, "/newsletter-confirm");
 *   return `${requestUrl.origin}${path}?email=${encodeURIComponent(email)}&ts=${ts}&sig=${sig}`;
 * };
 */
export type BuildConfirmUrl = (params: {
  email: string;
  ts: string;
  sig: string;
  locale: string;
}) => string;

/**
 * Provider-agnostic newsletter subscribe handler.
 *
 * Validates the request payload, generates an HMAC-signed confirmation token,
 * and sends the confirmation email via the configured mail provider. The caller supplies
 * `buildConfirmUrl` to construct the confirmation URL using provider-specific
 * configuration (base URL, path convention, locale strategy, etc.).
 *
 * The caller is responsible for CORS header management (origin validation and
 * response headers) because CORS semantics differ across providers.
 *
 * Usage:
 *   // Next.js
 *   export async function POST(request: Request) {
 *     if (!isAllowedOrigin(request.headers.get("Origin"))) {
 *       return new Response(..., { status: 403 });
 *     }
 *     const reqUrl = new URL(request.url);
 *     return handleNewsletterSubscribe(request, {
 *       MAIL_PROVIDER: process.env.MAIL_PROVIDER,
 *       RESEND_API_KEY: process.env.RESEND_API_KEY,
 *       NEWSLETTER_SECRET: process.env.NEWSLETTER_SECRET,
 *     }, ({ email, ts, sig, locale }) =>
 *       `${reqUrl.origin}/api/newsletter-confirm?...`
 *     );
 *   }
 *
 *   // Cloudflare Workers / Pages Functions
 *   export async function onRequestPost({ request, env }) {
 *     return handleNewsletterSubscribe(request, env,
 *       ({ email, ts, sig, locale }) => `${SITE_URL}/api/newsletter-confirm?...`
 *     );
 *   }
 */
export async function handleNewsletterSubscribe(
  request: Request,
  env: NewsletterSubscribeHandlerEnv,
  buildConfirmUrl: BuildConfirmUrl
): Promise<Response> {
  try {
    const rawBody = await request.text();
    const parsed = NewsletterPayloadSchema.safeParse(
      rawBody ? JSON.parse(rawBody) : {}
    );

    if (!parsed.success) {
      const issues = parsed.error.issues;
      const honeyIssue = issues.find((i) => i.path.includes("_honey"));
      const systemContent = getSystemContent();
      if (honeyIssue) {
        return Response.json(
          { success: false, error: systemContent.common.invalidSubmission },
          { status: 400 }
        );
      }
      return Response.json(
        {
          success: false,
          error: systemContent.common.validationFailed,
          details: issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, locale: payloadLocale } = parsed.data;
    const locale = resolveLocale(payloadLocale);
    const systemContent = getSystemContent(locale);
    const secret = env.NEWSLETTER_SECRET;
    const provider = getMailProvider(env);

    if (!secret || !provider) {
      logger.warn(
        "Newsletter not configured: set NEWSLETTER_SECRET and mail provider env vars."
      );
      return Response.json(
        { success: true, message: systemContent.newsletter.subscribeSuccess },
        { status: 200 }
      );
    }

    const ts = Math.floor(Date.now() / 1000).toString();
    const sig = await hmacSign(secret, `${email}|${ts}`);
    const confirmUrl = buildConfirmUrl({ email, ts, sig, locale });
    const from = getNewsletterFromAddress(env.NEWSLETTER_FROM, locale);
    const brand = getNewsletterEmailBrand(
      new URL(confirmUrl).origin,
      locale
    );
    const newsletterContent = getNewsletterEmailContent(
      new URL(confirmUrl).origin,
      locale
    );
    const emailContent = await renderNewsletterConfirmEmail({
      brand,
      content: newsletterContent.confirm,
      footer: newsletterContent.footer,
      confirmUrl,
    });

    await provider.sendEmail({
      from,
      to: email,
      subject: newsletterContent.confirm.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return Response.json(
      { success: true, message: systemContent.newsletter.subscribeSuccess },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error processing newsletter subscription:", error);
    return Response.json(
      {
        success: false,
        error: getSystemContent().newsletter.subscribeFailure,
      },
      { status: 500 }
    );
  }
}
