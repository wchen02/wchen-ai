import {
  getNewsletterEmailBrand,
  getNewsletterEmailContent,
  getNewsletterFromAddress,
  getRecurringNewsletterEmailContent,
} from "../src/lib/site-config";
import {
  getRecurringNewsletterCandidates,
  loadNewsletterSendState,
  markRecurringNewsletterCandidatesSent,
  selectUnsentRecurringNewsletterCandidates,
  writeNewsletterSendState,
} from "../src/lib/newsletter-recurring";
import {
  createNewsletterIssueIdempotencyKey,
  renderNewsletterIssueEmail,
} from "../shared/newsletter-email";
import { listResendContactsBySegment, sendResendEmail } from "../shared/resend";

const RESEND_BATCH_SIZE = 50;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function getUniqueDeliverableRecipients(emails: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const email of emails) {
    const normalized = email.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
}

async function main(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;

  if (!apiKey || !segmentId) {
    console.log("Skipping recurring newsletter send: RESEND_API_KEY or RESEND_SEGMENT_ID is not set.");
    return;
  }

  const state = loadNewsletterSendState();
  const candidates = getRecurringNewsletterCandidates();
  const unsentCandidates = selectUnsentRecurringNewsletterCandidates(candidates, state);

  if (unsentCandidates.length === 0) {
    console.log("No unsent recurring newsletter items found.");
    return;
  }

  const contacts = await listResendContactsBySegment({
    apiKey,
    segmentId,
  });
  const recipients = getUniqueDeliverableRecipients(
    contacts.filter((contact) => !contact.unsubscribed).map((contact) => contact.email)
  );

  if (recipients.length === 0) {
    console.log("No confirmed newsletter subscribers found in the configured Resend segment.");
    return;
  }

  const brand = getNewsletterEmailBrand();
  const footer = getNewsletterEmailContent().footer;
  const issueContent = getRecurringNewsletterEmailContent({
    itemCount: unsentCandidates.length,
  });
  const rendered = await renderNewsletterIssueEmail({
    brand,
    content: issueContent,
    footer,
    subjectLine: issueContent.subject,
    entries: unsentCandidates.map((candidate) => ({
      type: candidate.type,
      title: candidate.title,
      summary: candidate.summary,
      ctaLabel: issueContent.itemActionLabels[candidate.type],
      ctaUrl: candidate.ctaUrl,
      typeLabel: issueContent.itemTypeLabels[candidate.type],
    })),
  });
  const from = getNewsletterFromAddress(process.env.NEWSLETTER_FROM);
  const recipientBatches = chunk(recipients, RESEND_BATCH_SIZE);

  for (const [batchIndex, batch] of recipientBatches.entries()) {
    await sendResendEmail({
      apiKey,
      from,
      to: batch,
      subject: issueContent.subject,
      html: rendered.html,
      text: rendered.text,
      idempotencyKey: createNewsletterIssueIdempotencyKey(unsentCandidates, batchIndex),
    });
  }

  const sentAt = new Date().toISOString();
  const nextState = markRecurringNewsletterCandidatesSent(
    state,
    unsentCandidates,
    sentAt,
    issueContent.subject
  );
  writeNewsletterSendState(nextState);

  console.log(
    `Sent recurring newsletter digest with ${unsentCandidates.length} items to ${recipients.length} subscribers.`
  );
}

main().catch((error) => {
  console.error("Recurring newsletter send failed.");
  console.error(error);
  process.exit(1);
});
