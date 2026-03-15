import type {
  MailContact,
  MailProvider,
  ListContactsParams,
  SendEmailParams,
  UpdateContactParams,
  UpsertContactParams,
} from "./mail-provider";

export type { MailContact as ResendContact } from "./mail-provider";

const RESEND_API_BASE = "https://api.resend.com";

interface ResendEmailRequest extends SendEmailParams {
  apiKey: string;
}

export async function sendResendEmail({
  apiKey,
  from,
  to,
  subject,
  html,
  text,
  idempotencyKey,
  headers,
}: ResendEmailRequest): Promise<void> {
  const response = await fetch(`${RESEND_API_BASE}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(text ? { text } : {}),
      ...(headers ? { headers } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend email error (${response.status}): ${errorBody}`);
  }
}

export async function upsertResendContact(params: UpsertContactParams & { apiKey: string }): Promise<void> {
  const response = await fetch(`${RESEND_API_BASE}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      email: params.email,
      segments: [{ id: params.segmentId }],
      ...(params.properties && Object.keys(params.properties).length > 0
        ? { properties: params.properties }
        : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend contact error (${response.status}): ${errorBody}`);
  }
}

export async function listResendContactsBySegment(params: ListContactsParams & { apiKey: string }): Promise<MailContact[]> {
  const contacts: MailContact[] = [];
  const pageSize = params.pageSize ?? 100;
  let after: string | undefined;

  while (true) {
    const searchParams = new URLSearchParams({
      segment_id: params.segmentId,
      limit: String(pageSize),
    });

    if (after) {
      searchParams.set("after", after);
    }

    const response = await fetch(`${RESEND_API_BASE}/contacts?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Resend contacts error (${response.status}): ${errorBody}`);
    }

    const payload = (await response.json()) as {
      data?: MailContact[];
      has_more?: boolean;
    };
    const page = payload.data ?? [];
    contacts.push(...page);

    if (!payload.has_more || page.length === 0) {
      return contacts;
    }

    after = page[page.length - 1]?.id;
    if (!after) {
      return contacts;
    }
  }
}

export async function updateResendContact(params: UpdateContactParams & { apiKey: string }): Promise<void> {
  const response = await fetch(`${RESEND_API_BASE}/contacts/${encodeURIComponent(params.email)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      ...(params.unsubscribed !== undefined ? { unsubscribed: params.unsubscribed } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend contact update error (${response.status}): ${errorBody}`);
  }
}

/**
 * Returns a {@link MailProvider} backed by the Resend API.
 * To swap to a different provider, implement {@link MailProvider} and replace
 * this call at the composition root.
 */
export function createResendMailProvider(apiKey: string): MailProvider {
  return {
    sendEmail: (params: SendEmailParams) => sendResendEmail({ ...params, apiKey }),
    upsertContact: (params: UpsertContactParams) => upsertResendContact({ ...params, apiKey }),
    listContacts: (params: ListContactsParams) => listResendContactsBySegment({ ...params, apiKey }),
    updateContact: (params: UpdateContactParams) => updateResendContact({ ...params, apiKey }),
  };
}
