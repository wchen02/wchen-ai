import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import newsletterContent from "../content/locales/en/site/newsletter.json";

import {
  createNewsletterIssueIdempotencyKey,
  createNewsletterWelcomeIdempotencyKey,
  renderNewsletterConfirmEmail,
  renderNewsletterIssueEmail,
  renderNewsletterWelcomeEmail,
} from "../shared/newsletter-email";
import {
  getNewsletterEmailContent,
  getNewsletterFromAddress,
  getRecurringNewsletterEmailContent,
} from "../src/lib/site-config";
import {
  compareRecurringCandidates,
  getRecurringNewsletterCandidates,
  markRecurringNewsletterCandidatesSent,
  selectUnsentRecurringNewsletterCandidates,
  type NewsletterSendState,
  type RecurringNewsletterCandidate,
} from "../src/lib/newsletter-recurring";

const resolvedContent = getNewsletterEmailContent("https://wchen.ai");
const brand = {
  siteName: "Wilson Chen",
  authorName: "Wilson",
  description: "Occasional updates when I publish new writing. No spam, unsubscribe anytime.",
  homeUrl: "https://wchen.ai/en",
  writingUrl: "https://wchen.ai/en/writing",
  projectsUrl: "https://wchen.ai/en/projects",
};

describe("newsletter email templates", () => {
  it("renders the confirmation email with html and plain text", async () => {
    const confirmUrl = "https://wchen.ai/api/newsletter-confirm?email=reader%40example.com&ts=123&sig=abc";
    const encodedConfirmUrl = confirmUrl.replaceAll("&", "&amp;");
    const result = await renderNewsletterConfirmEmail({
      brand,
      content: resolvedContent.confirm,
      footer: resolvedContent.footer,
      confirmUrl,
    });

    expect(result.html).toContain(resolvedContent.confirm.title);
    expect(result.html).toContain(`href="${encodedConfirmUrl}"`);
    expect(result.html).toContain(resolvedContent.confirm.secondaryActionPrefix ?? "");
    expect(result.html.split(`href="${encodedConfirmUrl}"`)).toHaveLength(2);
    expect(result.text).toContain(resolvedContent.confirm.primaryActionLabel ?? "");
    expect(result.text).toContain(`${resolvedContent.confirm.secondaryActionPrefix} ${confirmUrl}`);
    expect(result.text).toContain("24 hours");
  });

  it("renders the welcome email with the expected subject copy", async () => {
    const unsubscribeUrl = "https://wchen.ai/api/newsletter-unsubscribe?email=reader%40example.com&sig=abc";
    const result = await renderNewsletterWelcomeEmail({
      brand,
      content: resolvedContent.welcome,
      footer: resolvedContent.footer,
      unsubscribeUrl,
    });

    expect(resolvedContent.welcome.subject).toContain("You're subscribed");
    expect(result.html).toContain(resolvedContent.welcome.primaryActionLabel ?? "");
    expect(result.text).toContain("No spam");
    expect(result.html).toContain(`href="${unsubscribeUrl.replaceAll("&", "&amp;")}"`);
    expect(result.text).toContain(resolvedContent.footer.unsubscribeLabel ?? "");
  });

  it("renders a reusable issue/update digest email template", async () => {
    const issueContent = getRecurringNewsletterEmailContent({
      itemCount: 2,
      siteUrl: "https://wchen.ai",
    });
    const result = await renderNewsletterIssueEmail({
      brand,
      content: issueContent,
      footer: resolvedContent.footer,
      subjectLine: issueContent.subject,
      entries: [
        {
          type: "writing",
          title: "Shipping before you're ready",
          summary: "A short note on why momentum matters more than polish at the beginning.",
          ctaLabel: issueContent.itemActionLabels.writing,
          ctaUrl: "https://wchen.ai/en/writing/shipping-before-youre-ready",
          typeLabel: issueContent.itemTypeLabels.writing,
        },
        {
          type: "project",
          title: "wchen.ai",
          summary: "A static-first personal site built to share projects, writing, and implementation notes.",
          ctaLabel: issueContent.itemActionLabels.project,
          ctaUrl: "https://wchen.ai/en/projects/wchen-ai",
          typeLabel: issueContent.itemTypeLabels.project,
        },
      ],
      unsubscribeUrl: "https://wchen.ai/api/newsletter-unsubscribe?email=reader%40example.com&sig=abc",
    });

    expect(result.html).toContain("New on Wilson Chen");
    expect(result.html).toContain("Shipping before you&#x27;re ready");
    expect(result.html).toContain("wchen.ai");
    expect(result.text).toContain((issueContent.itemsHeading ?? "").toUpperCase());
    expect(result.text).toContain("Read the article");
    expect(result.text).toContain(issueContent.itemActionLabels.project);
    expect(result.text).toContain(resolvedContent.footer.projectsArchiveLabel ?? "");
    expect(result.text).toContain(resolvedContent.footer.unsubscribeLabel ?? "");
  });

  it("builds a stable idempotency key per confirmation event", () => {
    expect(createNewsletterWelcomeIdempotencyKey("Reader@example.com", "1700000000")).toBe(
      "newsletter-welcome/reader@example.com/1700000000"
    );
  });

  it("builds a stable idempotency key per recurring digest recipient", () => {
    expect(
      createNewsletterIssueIdempotencyKey(
        [
          { type: "writing", slug: "shipping-before-youre-ready" },
          { type: "project", slug: "wchen-ai" },
        ],
        "Reader@example.com"
      )
    ).toBe("newsletter-issue/digest/e007f7bf552657bf/reader@example.com");
  });

  it("falls back to the default from address when NEWSLETTER_FROM is empty", () => {
    expect(getNewsletterFromAddress("")).toBe("Wilson Chen <newsletter@m.wchen.ai>");
    expect(getNewsletterFromAddress("   ")).toBe("Wilson Chen <newsletter@m.wchen.ai>");
    expect(getNewsletterFromAddress("Custom Sender <newsletter@example.com>")).toBe(
      "Custom Sender <newsletter@example.com>"
    );
  });
});

describe("newsletter shared wiring", () => {
  const newsletterContentPath = path.resolve(__dirname, "../content/locales/en/site/newsletter.json");
  const functionsSubscribePath = path.resolve(__dirname, "../functions/api/newsletter.ts");
  const nextSubscribePath = path.resolve(__dirname, "../src/app/api/newsletter/route.ts");
  const functionsConfirmPath = path.resolve(__dirname, "../functions/api/newsletter-confirm.ts");
  const nextConfirmPath = path.resolve(
    __dirname,
    "../src/app/api/newsletter-confirm-local/route.ts"
  );

  it("keeps newsletter email copy in the dedicated content file", () => {
    const source = fs.readFileSync(newsletterContentPath, "utf8");

    expect(source).toContain('"confirm"');
    expect(source).toContain('"welcome"');
    expect(source).toContain('"issueDefaults"');
    expect(source).toContain('"recurring"');
    expect(newsletterContent.confirm.subject).toContain("{siteName}");
  });

  it("subscribe handlers render the shared confirmation template", () => {
    const functionsSource = fs.readFileSync(functionsSubscribePath, "utf8");
    const nextSource = fs.readFileSync(nextSubscribePath, "utf8");

    expect(functionsSource).toContain("getNewsletterEmailContent");
    expect(functionsSource).toContain("renderNewsletterConfirmEmail");
    expect(functionsSource).toContain("sendResendEmail");
    expect(nextSource).toContain("getNewsletterEmailContent");
    expect(nextSource).toContain("renderNewsletterConfirmEmail");
    expect(nextSource).toContain("sendResendEmail");
  });

  it("confirm handlers use the shared welcome template and contact helper", () => {
    const functionsSource = fs.readFileSync(functionsConfirmPath, "utf8");
    const nextSource = fs.readFileSync(nextConfirmPath, "utf8");

    expect(functionsSource).toContain("getNewsletterEmailContent");
    expect(functionsSource).toContain("renderNewsletterWelcomeEmail");
    expect(functionsSource).toContain("upsertResendContact");
    expect(functionsSource).toContain("createNewsletterWelcomeIdempotencyKey");
    expect(nextSource).toContain("getNewsletterEmailContent");
    expect(nextSource).toContain("renderNewsletterWelcomeEmail");
    expect(nextSource).toContain("upsertResendContact");
    expect(nextSource).toContain("createNewsletterWelcomeIdempotencyKey");
  });
});

describe("recurring newsletter state", () => {
  const candidates: RecurringNewsletterCandidate[] = [
    {
      type: "project" as const,
      slug: "personal-website",
      title: "wchen.ai",
      summary: "A static-first site.",
      ctaUrl: "https://wchen.ai/en/projects/personal-website",
      publishedAt: "2026-02-22T00:00:00Z",
    },
    {
      type: "writing" as const,
      slug: "static-site-email",
      title: "The Friction of Static Site Email",
      summary: "Email on static sites is surprisingly awkward.",
      ctaUrl: "https://wchen.ai/en/writing/static-site-email",
      publishedAt: "2026-02-24T12:00:00Z",
    },
    {
      type: "writing" as const,
      slug: "why-cloudflare",
      title: "Why Cloudflare",
      summary: "Cloudflare fits the stack.",
      ctaUrl: "https://wchen.ai/en/writing/why-cloudflare",
      publishedAt: "2026-02-28T12:00:00Z",
    },
  ].sort(compareRecurringCandidates);

  it("selects unsent candidates in deterministic order", () => {
    const state: NewsletterSendState = {
      writing: [],
      projects: [],
    };

    expect(selectUnsentRecurringNewsletterCandidates(candidates, state).map((candidate) => candidate.slug))
      .toEqual(["personal-website", "static-site-email", "why-cloudflare"]);
  });

  it("skips sent items and preserves send records without duplicates", () => {
    const state: NewsletterSendState = {
      writing: [],
      projects: [
        {
          slug: "personal-website",
          sentAt: "2026-03-01T00:00:00Z",
          subject: "New project: wchen.ai",
        },
      ],
    };
    const unsentCandidates = selectUnsentRecurringNewsletterCandidates(candidates, state);

    expect(unsentCandidates.map((candidate) => candidate.slug)).toEqual([
      "static-site-email",
      "why-cloudflare",
    ]);

    const markedOnce = markRecurringNewsletterCandidatesSent(
      state,
      [
        { type: "writing", slug: "static-site-email" },
        { type: "writing", slug: "why-cloudflare" },
      ],
      "2026-03-02T00:00:00Z",
      "New on Wilson Chen"
    );
    const markedTwice = markRecurringNewsletterCandidatesSent(
      markedOnce,
      [
        { type: "writing", slug: "static-site-email" },
        { type: "writing", slug: "why-cloudflare" },
      ],
      "2026-03-03T00:00:00Z",
      "New on Wilson Chen"
    );

    expect(markedOnce.writing).toHaveLength(2);
    expect(markedTwice.writing).toHaveLength(2);
    expect(markedTwice.writing.every((record) => record.subject === "New on Wilson Chen")).toBe(true);
  });

  it("builds deterministic candidates from the content loaders", () => {
    const loadedCandidates = getRecurringNewsletterCandidates();

    expect(loadedCandidates.length).toBeGreaterThan(0);
    expect(loadedCandidates.some((candidate) => candidate.type === "writing")).toBe(true);
    expect(loadedCandidates.some((candidate) => candidate.type === "project")).toBe(true);

    const sortedCandidates = [...loadedCandidates].sort(compareRecurringCandidates);
    expect(loadedCandidates).toEqual(sortedCandidates);
  });
});
