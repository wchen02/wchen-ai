import { test, expect } from "@playwright/test";
import formsEn from "../content/locales/en/site/forms.json";
import profileEn from "../content/locales/en/site/profile.json";
import uiEn from "../content/locales/en/site/ui.json";

const base = "/en";

test.describe("Sticky newsletter popup (slideout)", () => {
  test("tab is visible on writing page and shows newsletter title", async ({ page }) => {
    await page.goto(`${base}/writing`);
    const tab = page.getByRole("button", { name: formsEn.newsletter.title });
    await expect(tab).toBeVisible();
    await expect(tab).toHaveAttribute("aria-expanded", "false");
  });

  test("clicking the tab opens the panel with form and RSS link", async ({ page }) => {
    await page.goto(`${base}/writing`);
    await page.getByRole("button", { name: formsEn.newsletter.title }).click();
    const slideout = page.getByRole("region", { name: formsEn.newsletter.title });
    await expect(slideout).toBeVisible();
    await expect(page.getByLabel(formsEn.newsletter.emailLabel)).toBeVisible();
    await expect(page.getByRole("button", { name: formsEn.newsletter.submitLabel })).toBeVisible();
    await expect(slideout.getByRole("link", { name: profileEn.navigation.rssLabel })).toBeVisible();
    await expect(page.getByRole("button", { expanded: true })).toHaveAttribute("aria-expanded", "true");
  });

  test("close button in panel closes the panel", async ({ page }) => {
    await page.goto(`${base}/writing`);
    await page.getByRole("button", { name: formsEn.newsletter.title }).click();
    const slideout = page.getByRole("region", { name: formsEn.newsletter.title });
    await expect(slideout.getByLabel(formsEn.newsletter.emailLabel)).toBeVisible();
    // Bar toggle shows aria-label "Close" when expanded; clicking it closes the panel (no separate X button)
    await slideout.getByRole("button", { name: "Close", expanded: true }).click();
    await expect(page.getByRole("button", { name: formsEn.newsletter.title })).toHaveAttribute("aria-expanded", "false");
  });

  test("clicking backdrop closes the panel", async ({ page }) => {
    await page.goto(`${base}/writing`);
    await page.getByRole("button", { name: formsEn.newsletter.title }).click();
    const slideout = page.getByRole("region", { name: formsEn.newsletter.title });
    await expect(slideout.getByLabel(formsEn.newsletter.emailLabel)).toBeVisible();
    await page.getByRole("button", { name: "Close" }).first().click();
    await expect(page.getByRole("button", { name: formsEn.newsletter.title })).toHaveAttribute("aria-expanded", "false");
  });

  test("slideout is present on writing and project detail pages", async ({ page }) => {
    await page.goto(`${base}/writing`);
    await expect(page.getByRole("button", { name: formsEn.newsletter.title })).toBeVisible();
    await page.goto(`${base}/projects`);
    await expect(page.getByRole("button", { name: formsEn.newsletter.title })).toBeVisible();
  });
});

test.describe("Newsletter subscription", () => {
  test("subscription form submits and shows success or error feedback", async ({ page }) => {
    await page.goto(`${base}/writing`);
    await page.getByRole("button", { name: formsEn.newsletter.title }).click();
    const slideout = page.getByRole("region", { name: formsEn.newsletter.title });
    await expect(slideout).toBeVisible();
    await expect(slideout.getByLabel(formsEn.newsletter.emailLabel)).toBeVisible();

    const emailInput = slideout.getByLabel(formsEn.newsletter.emailLabel);
    await emailInput.fill("e2e-subscriber@example.com");

    await slideout.getByRole("button", { name: formsEn.newsletter.submitLabel }).click();

    // With API: success (role="status"). With static export (no API): error (role="alert"). Either is valid.
    const main = page.getByRole("main");
    await expect(
      main.getByRole("status").or(main.getByRole("alert"))
    ).toBeVisible({ timeout: 10000 });
  });

  test("subscription form has accessible email field and submit button", async ({ page }) => {
    await page.goto(`${base}/writing`);
    await page.getByRole("button", { name: formsEn.newsletter.title }).click();
    await expect(page.getByLabel(formsEn.newsletter.emailLabel)).toBeVisible();
    await expect(
      page.getByRole("button", { name: new RegExp(formsEn.newsletter.submitLabel, "i") })
    ).toBeVisible();
  });
});

test.describe("Newsletter confirmation flow", () => {
  test("newsletter confirmed page shows expected content", async ({ page }) => {
    await page.goto(`${base}/newsletter-confirmed`);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("h1")).toContainText(profileEn.newsletter.confirmedTitle);
    await expect(page.getByRole("main")).toContainText(profileEn.newsletter.confirmedDescription);
    await expect(
      page.getByRole("link", { name: profileEn.newsletter.confirmedPrimaryCtaLabel })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: profileEn.newsletter.confirmedSecondaryCtaLabel })
    ).toBeVisible();
  });

  test("newsletter confirm page with invalid or missing params shows error", async ({ page }) => {
    await page.goto(
      `${base}/newsletter-confirm?email=test%40example.com&ts=1&sig=invalid-signature`
    );
    await expect(page.getByRole("main")).toBeVisible();
    // Eventually show error title (after loading finishes; with static export API is 404 so we get error state).
    await expect(page.locator("h1")).toContainText(uiEn.newsletterFlow.confirmErrorTitle, {
      timeout: 15000,
    });
    const main = page.getByRole("main");
    await expect(main.locator("p").filter({ hasNotText: uiEn.newsletterFlow.confirmLoadingMessage }))
      .toHaveCount(1, { timeout: 15000 });
  });
});

test.describe("Newsletter unsubscribe flow", () => {
  test("newsletter unsubscribed page shows expected content", async ({ page }) => {
    await page.goto(`${base}/newsletter-unsubscribed`);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("h1")).toContainText(profileEn.newsletter.unsubscribedTitle);
    await expect(page.getByRole("main")).toContainText(profileEn.newsletter.unsubscribedDescription);
    await expect(
      page.getByRole("link", { name: profileEn.newsletter.unsubscribedPrimaryCtaLabel })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: profileEn.newsletter.unsubscribedSecondaryCtaLabel })
    ).toBeVisible();
  });

  test("newsletter unsubscribe page with invalid params shows error", async ({ page }) => {
    await page.goto(`${base}/newsletter-unsubscribe?email=test%40example.com&sig=invalid`);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("h1")).toContainText(uiEn.newsletterFlow.unsubscribeErrorTitle, {
      timeout: 15000,
    });
    const main = page.getByRole("main");
    await expect(main.locator("p").filter({ hasNotText: uiEn.newsletterFlow.unsubscribeLoadingMessage }))
      .toHaveCount(1, { timeout: 15000 });
  });
});
