import { NextResponse } from "next/server";
import { ContactPayloadSchema } from "../../../../shared/contact";
import { getSystemContent } from "@/lib/site-content";

const systemContent = getSystemContent();

function getMailgunBaseUrl(): string {
  return process.env.MAILGUN_EU === "1"
    ? "https://api.eu.mailgun.net"
    : "https://api.mailgun.net";
}

async function sendViaMailgun(params: {
  to: string;
  replyTo: string;
  replyToName: string;
  subject: string;
  body: string;
}): Promise<Response> {
  const domain = process.env.MAILGUN_DOMAIN!;
  const from =
    process.env.MAILGUN_FROM_EMAIL ?? `Contact Form <noreply@${domain}>`;
  const body = new URLSearchParams({
    from,
    to: params.to,
    subject: params.subject,
    text: params.body,
    "h:Reply-To": `${params.replyToName} <${params.replyTo}>`,
  });
  const apiKey = process.env.MAILGUN_API_KEY!;
  return fetch(`${getMailgunBaseUrl()}/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`api:${apiKey}`).toString("base64"),
    },
    body: body.toString(),
  });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const parsed = ContactPayloadSchema.safeParse(
      rawBody ? JSON.parse(rawBody) : {}
    );

    if (!parsed.success) {
      const issues = parsed.error.issues;
      const honeyIssue = issues.find((i) => i.path.includes("_honey"));
      if (honeyIssue) {
        return NextResponse.json(
          { success: false, error: systemContent.common.invalidSubmission },
          { status: 400 }
        );
      }
      return NextResponse.json(
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

    const toEmail = process.env.CONTACT_TO_EMAIL;
    const useMailgun =
      toEmail &&
      process.env.MAILGUN_API_KEY &&
      process.env.MAILGUN_DOMAIN;

    if (useMailgun) {
      const mailRes = await sendViaMailgun({
        to: toEmail,
        replyTo: e,
        replyToName: n,
        subject: `Contact form: ${n}`,
        body: `From: ${n} <${e}>\n\n${m}`,
      });
      if (!mailRes.ok) {
        const errBody = await mailRes.text();
        console.error("Mailgun error:", mailRes.status, errBody);
        return NextResponse.json(
          { success: false, error: systemContent.contact.sendFailure },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
      message: systemContent.contact.successMessage,
      });
    }

    // Dev / no Mailgun: accept but don't send
    return NextResponse.json({
      success: true,
      message: systemContent.contact.developmentMessage,
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { success: false, error: systemContent.contact.sendFailure },
      { status: 500 }
    );
  }
}
