import { test, expect } from "@playwright/test";
import formsEn from "../content/locales/en/site/forms.json";
import profileEn from "../content/locales/en/site/profile.json";

const base = "/en";

test.describe("Contact section", () => {
  test("contact section is visible on homepage and has title", async ({ page }) => {
    await page.goto(base);
    const contactSection = page.locator("#contact");
    await expect(contactSection).toBeVisible();
    await expect(contactSection.locator(`text=${profileEn.contact.title}`)).toBeVisible();
  });

  test("contact form has accessible name, email, message fields and submit button", async ({ page }) => {
    await page.goto(`${base}/#contact`);
    await expect(page.getByLabel(formsEn.contact.fields.name.label)).toBeVisible();
    await expect(page.getByLabel(formsEn.contact.fields.email.label)).toBeVisible();
    await expect(page.getByLabel(formsEn.contact.fields.message.label)).toBeVisible();
    await expect(
      page.getByRole("button", { name: new RegExp(formsEn.contact.submitLabel, "i") })
    ).toBeVisible();
  });

  test("contact form submits and shows success or error feedback", async ({ page }) => {
    await page.goto(`${base}/#contact`);
    await expect(page.locator("#contact")).toBeVisible();

    // Wait for client hydration so submit uses fetch, not native form POST
    const contactResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/contact") && resp.request().method() === "POST",
      { timeout: 15000 }
    );

    await page.getByLabel(formsEn.contact.fields.name.label).fill("E2E Tester");
    await page.getByLabel(formsEn.contact.fields.email.label).fill("e2e-contact@example.com");
    await page.getByLabel(formsEn.contact.fields.message.label).fill("This is an e2e test message with enough length.");
    await page.getByRole("button", { name: new RegExp(formsEn.contact.submitLabel, "i") }).click();

    await contactResponsePromise;

    // With API: success (role="status"). Without API or on error: alert. Either is valid.
    const contactSection = page.locator("#contact");
    await expect(
      contactSection.getByRole("status").or(contactSection.getByRole("alert"))
    ).toBeVisible({ timeout: 5000 });
  });

  test("short message does not result in success (HTML5 or API validation)", async ({ page }) => {
    await page.goto(`${base}/#contact`);
    await page.getByLabel(formsEn.contact.fields.name.label).fill("E2E Tester");
    await page.getByLabel(formsEn.contact.fields.email.label).fill("e2e@example.com");
    await page.getByLabel(formsEn.contact.fields.message.label).fill("Hi");
    await page.getByRole("button", { name: new RegExp(formsEn.contact.submitLabel, "i") }).click();

    // HTML5 minLength prevents submit, or API returns 400: in either case success status should not appear.
    await expect(page.locator("#contact").getByRole("status")).not.toBeVisible({ timeout: 3000 });
    // Form or error alert still visible.
    await expect(
      page.locator("#contact").locator("form").or(page.locator("#contact").getByRole("alert"))
    ).toBeVisible();
  });

  test("on success, reset button is shown; on error, alert is shown", async ({ page }) => {
    await page.goto(`${base}/#contact`);
    await page.getByLabel(formsEn.contact.fields.name.label).fill("E2E Tester");
    await page.getByLabel(formsEn.contact.fields.email.label).fill("e2e-success@example.com");
    await page.getByLabel(formsEn.contact.fields.message.label).fill("Testing success state and reset.");
    await page.getByRole("button", { name: new RegExp(formsEn.contact.submitLabel, "i") }).click();

    const contact = page.locator("#contact");
    const status = contact.getByRole("status");
    const alert = contact.getByRole("alert");
    await expect(status.or(alert)).toBeVisible({ timeout: 10000 });
    // When API is available we get success (status) and reset; when static-only we get error (alert).
    if (await status.isVisible()) {
      await expect(page.getByRole("button", { name: formsEn.contact.resetLabel })).toBeVisible();
    }
  });
});
