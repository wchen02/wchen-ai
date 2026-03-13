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
    expect(result.text).toContain((issueContent.newItemsHeading ?? "New").toUpperCase());
    expect(result.text).toContain("Read the article");
    expect(result.text).toContain(issueContent.itemActionLabels.project);
    expect(result.text).toContain(resolvedContent.footer.projectsArchiveLabel ?? "");
    expect(result.text).toContain(resolvedContent.footer.unsubscribeLabel ?? "");
  });

  it("renders digest with separate New and Updated sections when entries have isUpdate", async () => {
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
          title: "New post",
          summary: "A new article.",
          ctaLabel: issueContent.itemActionLabels.writing,
          ctaUrl: "https://wchen.ai/en/writing/new-post",
          typeLabel: issueContent.itemTypeLabels.writing,
          isUpdate: false,
        },
        {
          type: "project",
          title: "Updated project",
          summary: "This project was updated.",
          ctaLabel: issueContent.itemActionLabels.project,
          ctaUrl: "https://wchen.ai/en/projects/updated-project",
          typeLabel: issueContent.itemTypeLabels.project,
          isUpdate: true,
        },
      ],
      unsubscribeUrl: "https://wchen.ai/api/newsletter-unsubscribe?email=reader%40example.com&sig=abc",
    });

    expect(result.text).toContain("A new article.");
    expect(result.text).toContain("This project was updated.");
    expect(result.text).toContain((issueContent.newItemsHeading ?? "New").toUpperCase());
    expect(result.text).toContain((issueContent.updatedItemsHeading ?? "Updated").toUpperCase());
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

  it("exposes all required email types: confirmation, welcome, recurring digest", () => {
    const content = getNewsletterEmailContent("https://wchen.ai");
    expect(content.confirm).toBeDefined();
    expect(content.confirm.subject).toBeTruthy();
    expect(content.confirm.title).toBeTruthy();
    expect(content.confirm.primaryActionLabel).toBeTruthy();
    expect(content.welcome).toBeDefined();
    expect(content.welcome.subject).toBeTruthy();
    expect(content.welcome.title).toBeTruthy();
    expect(content.welcome.intro).toBeDefined();
    expect(Array.isArray(content.welcome.intro)).toBe(true);
    expect(content.issueDefaults).toBeDefined();
    expect(content.issueDefaults.primaryActionLabel).toBeTruthy();
    expect(content.footer?.unsubscribeLabel).toBeTruthy();
    expect(newsletterContent.recurring?.digest).toBeDefined();
    expect(newsletterContent.recurring.digest.subject).toBeTruthy();
    expect(newsletterContent.recurring.digest.itemTypeLabels?.writing).toBeTruthy();
    expect(newsletterContent.recurring.digest.itemTypeLabels?.project).toBeTruthy();
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
  const v1 = "v1";
  const v2 = "v2";
  const candidates: RecurringNewsletterCandidate[] = [
    {
      type: "project" as const,
      slug: "personal-website",
      title: "wchen.ai",
      summary: "A static-first site.",
      ctaUrl: "https://wchen.ai/en/projects/personal-website",
      publishedAt: "2026-02-22T00:00:00Z",
      contentVersion: v1,
    },
    {
      type: "writing" as const,
      slug: "static-site-email",
      title: "The Friction of Static Site Email",
      summary: "Email on static sites is surprisingly awkward.",
      ctaUrl: "https://wchen.ai/en/writing/static-site-email",
      publishedAt: "2026-02-24T12:00:00Z",
      contentVersion: v1,
    },
    {
      type: "writing" as const,
      slug: "why-cloudflare",
      title: "Why Cloudflare",
      summary: "Cloudflare fits the stack.",
      ctaUrl: "https://wchen.ai/en/writing/why-cloudflare",
      publishedAt: "2026-02-28T12:00:00Z",
      contentVersion: v1,
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

  it("skips sent items when record has matching contentVersion", () => {
    const state: NewsletterSendState = {
      writing: [],
      projects: [
        {
          slug: "personal-website",
          sentAt: "2026-03-01T00:00:00Z",
          subject: "New project: wchen.ai",
          contentVersion: v1,
        },
      ],
    };
    const unsentCandidates = selectUnsentRecurringNewsletterCandidates(candidates, state);

    expect(unsentCandidates.map((candidate) => candidate.slug)).toEqual([
      "static-site-email",
      "why-cloudflare",
    ]);
  });

  it("includes item again when contentVersion differs from stored (update resend)", () => {
    const state: NewsletterSendState = {
      writing: [],
      projects: [
        {
          slug: "personal-website",
          sentAt: "2026-03-01T00:00:00Z",
          subject: "New project: wchen.ai",
          contentVersion: v1,
        },
      ],
    };
    const updatedCandidates: RecurringNewsletterCandidate[] = [
      {
        ...candidates[0],
        contentVersion: v2,
      },
      candidates[1],
      candidates[2],
    ].sort(compareRecurringCandidates);
    const unsent = selectUnsentRecurringNewsletterCandidates(updatedCandidates, state);
    expect(unsent.map((c) => c.slug)).toContain("personal-website");
    expect(unsent.map((c) => c.slug)).toContain("static-site-email");
    expect(unsent.map((c) => c.slug)).toContain("why-cloudflare");
  });

  it("treats record without contentVersion as sent (backward compat)", () => {
    const state: NewsletterSendState = {
      writing: [
        {
          slug: "static-site-email",
          sentAt: "2026-03-01T00:00:00Z",
          subject: "New on Wilson Chen",
        },
      ],
      projects: [],
    };
    const unsentCandidates = selectUnsentRecurringNewsletterCandidates(candidates, state);
    expect(unsentCandidates.map((c) => c.slug)).not.toContain("static-site-email");
    expect(unsentCandidates.map((c) => c.slug)).toEqual(["personal-website", "why-cloudflare"]);
  });

  it("upserts send records by slug and preserves contentVersion", () => {
    const state: NewsletterSendState = {
      writing: [],
      projects: [
        {
          slug: "personal-website",
          sentAt: "2026-03-01T00:00:00Z",
          subject: "New project: wchen.ai",
          contentVersion: v1,
        },
      ],
    };
    const toMark = [
      { type: "writing" as const, slug: "static-site-email", contentVersion: v1 },
      { type: "writing" as const, slug: "why-cloudflare", contentVersion: v1 },
    ];
    const markedOnce = markRecurringNewsletterCandidatesSent(
      state,
      toMark,
      "2026-03-02T00:00:00Z",
      "New on Wilson Chen"
    );
    expect(markedOnce.writing).toHaveLength(2);
    expect(markedOnce.writing.every((r) => r.contentVersion === v1)).toBe(true);

    const markedTwice = markRecurringNewsletterCandidatesSent(
      markedOnce,
      [
        { type: "writing", slug: "static-site-email", contentVersion: v2 },
        { type: "writing", slug: "why-cloudflare", contentVersion: v1 },
      ],
      "2026-03-03T00:00:00Z",
      "New on Wilson Chen"
    );
    expect(markedTwice.writing).toHaveLength(2);
    const staticRecord = markedTwice.writing.find((r) => r.slug === "static-site-email");
    expect(staticRecord?.contentVersion).toBe(v2);
    expect(staticRecord?.sentAt).toBe("2026-03-03T00:00:00Z");
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
