import { test, expect } from "@playwright/test";
import formsEn from "../content/locales/en/site/forms.json";
import profileEn from "../content/locales/en/site/profile.json";
import uiEn from "../content/locales/en/site/ui.json";

const base = "/en";

test.describe("Newsletter subscription", () => {
  test("subscription form submits and shows success or error feedback", async ({ page }) => {
    await page.goto(`${base}/writing`);
    await page.getByRole("button", { name: formsEn.newsletter.title }).click();
    await expect(page.getByLabel(formsEn.newsletter.emailLabel)).toBeVisible();

    const emailInput = page.getByLabel(formsEn.newsletter.emailLabel);
    await emailInput.fill("e2e-subscriber@example.com");

    await page.getByRole("button", { name: formsEn.newsletter.submitLabel }).click();

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
