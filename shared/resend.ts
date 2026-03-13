const RESEND_API_BASE = "https://api.resend.com";

export interface ResendEmailRequest {
  apiKey: string;
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
  headers?: Record<string, string>;
}

export interface ResendContact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  unsubscribed: boolean;
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

export async function upsertResendContact(params: {
  apiKey: string;
  email: string;
  segmentId: string;
}): Promise<void> {
  const response = await fetch(`${RESEND_API_BASE}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      email: params.email,
      segments: [{ id: params.segmentId }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend contact error (${response.status}): ${errorBody}`);
  }
}

export async function listResendContactsBySegment(params: {
  apiKey: string;
  segmentId: string;
  pageSize?: number;
}): Promise<ResendContact[]> {
  const contacts: ResendContact[] = [];
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
      data?: ResendContact[];
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

export async function updateResendContact(params: {
  apiKey: string;
  email: string;
  unsubscribed?: boolean;
}): Promise<void> {
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
