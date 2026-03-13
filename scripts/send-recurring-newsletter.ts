import {
  getNewsletterEmailBrand,
  getNewsletterEmailContent,
  getNewsletterFromAddress,
  getRecurringNewsletterEmailContent,
  getNewsletterUnsubscribeUrl,
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
import { hmacSign } from "../shared/newsletter-crypto";
import { listResendContactsBySegment, sendResendEmail } from "../shared/resend";

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
  const secret = process.env.NEWSLETTER_SECRET;

  if (!apiKey || !segmentId || !secret) {
    console.log(
      "Skipping recurring newsletter send: RESEND_API_KEY, RESEND_SEGMENT_ID, or NEWSLETTER_SECRET is not set."
    );
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
  const digestEntries = unsentCandidates.map((candidate) => ({
    type: candidate.type,
    title: candidate.title,
    summary: candidate.summary,
    ctaLabel: issueContent.itemActionLabels[candidate.type],
    ctaUrl: candidate.ctaUrl,
    typeLabel: issueContent.itemTypeLabels[candidate.type],
  }));
  const from = getNewsletterFromAddress(process.env.NEWSLETTER_FROM);

  for (const recipient of recipients) {
    const unsubscribeSig = await hmacSign(secret, recipient);
    const unsubscribeUrl = getNewsletterUnsubscribeUrl({
      email: recipient,
      sig: unsubscribeSig,
    });
    const rendered = await renderNewsletterIssueEmail({
      brand,
      content: issueContent,
      footer,
      subjectLine: issueContent.subject,
      entries: digestEntries,
      unsubscribeUrl,
    });

    await sendResendEmail({
      apiKey,
      from,
      to: recipient,
      subject: issueContent.subject,
      html: rendered.html,
      text: rendered.text,
      idempotencyKey: createNewsletterIssueIdempotencyKey(unsentCandidates, recipient),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
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
