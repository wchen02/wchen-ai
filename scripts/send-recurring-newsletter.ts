import { DEFAULT_LOCALE, resolveLocale } from "../src/lib/locales";
import { logger } from "../src/lib/logger";
import {
  SITE_URL,
  getNewsletterEmailBrand,
  getNewsletterEmailContent,
  getNewsletterFromAddress,
  getRecurringNewsletterEmailContent,
  getNewsletterUnsubscribeUrl,
} from "../src/lib/site-config";
import {
  getRecurringNewsletterCandidates,
  isRecurringCandidateUpdate,
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
import type { ResendContact } from "../shared/resend";
import { listResendContactsBySegment, sendResendEmail } from "../shared/resend";

/** Resend allows 2 requests per second; wait between sends to avoid 429. */
const RESEND_RATE_LIMIT_DELAY_MS = 600;

function getPreferredLocale(contact: ResendContact): string {
  const fromProps =
    (contact.properties as Record<string, string> | undefined)?.preferred_locale;
  return resolveLocale(contact.preferred_locale ?? fromProps ?? DEFAULT_LOCALE);
}

function getUniqueDeliverableRecipientsWithLocale(
  contacts: ResendContact[]
): Array<{ email: string; locale: string }> {
  const seen = new Set<string>();
  const result: Array<{ email: string; locale: string }> = [];

  for (const contact of contacts) {
    if (contact.unsubscribed) continue;
    const normalized = contact.email.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;

    seen.add(normalized);
    result.push({ email: normalized, locale: getPreferredLocale(contact) });
  }

  return result;
}

async function main(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;
  const secret = process.env.NEWSLETTER_SECRET;

  if (!apiKey || !segmentId || !secret) {
    logger.log(
      "Skipping recurring newsletter send: RESEND_API_KEY, RESEND_SEGMENT_ID, or NEWSLETTER_SECRET is not set."
    );
    return;
  }

  const state = loadNewsletterSendState();
  const candidatesDefault = getRecurringNewsletterCandidates(DEFAULT_LOCALE);
  const unsentCandidatesForState = selectUnsentRecurringNewsletterCandidates(
    candidatesDefault,
    state
  );

  if (unsentCandidatesForState.length === 0) {
    logger.log("No unsent recurring newsletter items found.");
    return;
  }

  const contacts = await listResendContactsBySegment({
    apiKey,
    segmentId,
  });
  const recipientsWithLocale = getUniqueDeliverableRecipientsWithLocale(contacts);

  if (recipientsWithLocale.length === 0) {
    logger.log("No confirmed newsletter subscribers found in the configured Resend segment.");
    return;
  }

  const issueContentDefault = getRecurringNewsletterEmailContent({
    itemCount: unsentCandidatesForState.length,
    locale: DEFAULT_LOCALE,
  });

  for (const { email: recipient, locale } of recipientsWithLocale) {
    const candidates = getRecurringNewsletterCandidates(locale);
    const unsentCandidates = selectUnsentRecurringNewsletterCandidates(candidates, state);

    const brand = getNewsletterEmailBrand(SITE_URL, locale);
    const footer = getNewsletterEmailContent(SITE_URL, locale).footer;
    const issueContent = getRecurringNewsletterEmailContent({
      itemCount: unsentCandidates.length,
      locale,
    });
    const digestEntries = unsentCandidates.map((candidate) => ({
      type: candidate.type,
      title: candidate.title,
      summary: candidate.summary,
      ctaLabel: issueContent.itemActionLabels[candidate.type],
      ctaUrl: candidate.ctaUrl,
      typeLabel: issueContent.itemTypeLabels[candidate.type],
      isUpdate: isRecurringCandidateUpdate(state, candidate),
      imageUrl: candidate.imageUrl ?? undefined,
    }));
    const from = getNewsletterFromAddress(process.env.NEWSLETTER_FROM, locale);

    const unsubscribeSig = await hmacSign(secret, recipient);
    const unsubscribeUrl = getNewsletterUnsubscribeUrl({
      email: recipient,
      sig: unsubscribeSig,
      siteUrl: SITE_URL,
      useLocalPage: true,
      locale,
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
      idempotencyKey: createNewsletterIssueIdempotencyKey(unsentCandidatesForState, recipient),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    await new Promise((r) => setTimeout(r, RESEND_RATE_LIMIT_DELAY_MS));
  }

  const sentAt = new Date().toISOString();
  const nextState = markRecurringNewsletterCandidatesSent(
    state,
    unsentCandidatesForState,
    sentAt,
    issueContentDefault.subject
  );
  writeNewsletterSendState(nextState);

  logger.log(
    `Sent recurring newsletter digest with ${unsentCandidatesForState.length} items to ${recipientsWithLocale.length} subscribers.`
  );
}

main().catch((error) => {
  logger.error("Recurring newsletter send failed.");
  logger.error(error);
  process.exit(1);
});
