import { ContactPayloadSchema } from "../contact";
import { logger } from "../../src/lib/logger";
import { getSystemContent } from "../../src/lib/site-content";

/**
 * Provider-agnostic environment for the contact handler.
 * Populate from process.env (Next.js), context.env (Cloudflare),
 * or event variables (Lambda) before calling handleContact().
 */
export interface ContactHandlerEnv {
  CONTACT_TO_EMAIL?: string;
  MAILGUN_API_KEY?: string;
  MAILGUN_DOMAIN?: string;
  /** Optional. Defaults to "Contact Form <noreply@{MAILGUN_DOMAIN}>" */
  MAILGUN_FROM_EMAIL?: string;
  /** Set to "1" to use the EU Mailgun endpoint (api.eu.mailgun.net) */
  MAILGUN_EU?: string;
}

function getMailgunBaseUrl(env: ContactHandlerEnv): string {
  return env.MAILGUN_EU === "1"
    ? "https://api.eu.mailgun.net"
    : "https://api.mailgun.net";
}

async function sendViaMailgun(
  env: ContactHandlerEnv,
  params: {
    to: string;
    replyTo: string;
    replyToName: string;
    subject: string;
    body: string;
  }
): Promise<Response> {
  const domain = env.MAILGUN_DOMAIN!;
  const from =
    env.MAILGUN_FROM_EMAIL ?? `Contact Form <noreply@${domain}>`;
  const formBody = new URLSearchParams({
    from,
    to: params.to,
    subject: params.subject,
    text: params.body,
    "h:Reply-To": `${params.replyToName} <${params.replyTo}>`,
  });
  const apiKey = env.MAILGUN_API_KEY!;
  return fetch(`${getMailgunBaseUrl(env)}/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`api:${apiKey}`),
    },
    body: formBody.toString(),
  });
}

/**
 * Provider-agnostic contact form handler.
 *
 * Accepts a standard Request and an env config object, returns a standard
 * Response. The caller is responsible for any provider-specific concerns
 * (e.g. CORS headers, framework-specific response types).
 *
 * Usage:
 *   // Next.js
 *   export async function POST(req: Request) {
 *     return handleContact(req, {
 *       CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
 *       MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
 *       MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
 *     });
 *   }
 *
 *   // Cloudflare Workers / Pages Functions
 *   export async function onRequestPost({ request, env }) {
 *     return handleContact(request, env);
 *   }
 *
 *   // AWS Lambda (via adapter)
 *   export const handler = async (event) => {
 *     const request = lambdaEventToRequest(event);
 *     const response = await handleContact(request, {
 *       CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
 *       ...
 *     });
 *     return responseToLambdaResult(response);
 *   };
 */
export async function handleContact(
  request: Request,
  env: ContactHandlerEnv
): Promise<Response> {
  const systemContent = getSystemContent();
  try {
    const rawBody = await request.text();
    const parsed = ContactPayloadSchema.safeParse(
      rawBody ? JSON.parse(rawBody) : {}
    );

    if (!parsed.success) {
      const issues = parsed.error.issues;
      const honeyIssue = issues.find((i) => i.path.includes("_honey"));
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

    const { name, email, message } = parsed.data;
    const n = name.trim();
    const e = email.trim();
    const m = message.trim();

    const toEmail = env.CONTACT_TO_EMAIL;
    const useMailgun = toEmail && env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN;

    if (useMailgun) {
      const mailRes = await sendViaMailgun(env, {
        to: toEmail,
        replyTo: e,
        replyToName: n,
        subject: `Contact form: ${n}`,
        body: `From: ${n} <${e}>\n\n${m}`,
      });
      if (!mailRes.ok) {
        const errBody = await mailRes.text();
        logger.error("Mailgun error:", mailRes.status, errBody);
        return Response.json(
          { success: false, error: systemContent.contact.sendFailure },
          { status: 500 }
        );
      }
      return Response.json({
        success: true,
        message: systemContent.contact.successMessage,
      });
    }

    // Dev / no Mailgun configured: accept but don't send
    return Response.json({
      success: true,
      message: systemContent.contact.developmentMessage,
    });
  } catch (error) {
    logger.error("Error processing contact form:", error);
    return Response.json(
      { success: false, error: systemContent.contact.sendFailure },
      { status: 500 }
    );
  }
}
