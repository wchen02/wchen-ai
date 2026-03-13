import { test, expect } from "@playwright/test";
import uiContent from "../content/locales/en/site/ui.json";

const basePath = "/en";

test.describe("Share on writing and project detail pages", () => {
  test("writing detail page has share button that opens menu with Copy link and social channels", async ({
    page,
  }) => {
    await page.goto(`${basePath}/writing`);
    const firstLink = page.locator(`a[href^="${basePath}/writing/"]`).first();
    if ((await firstLink.count()) === 0) {
      test.skip(true, "No writing detail links on index");
    }
    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(`${basePath}/writing/`));

    const shareTrigger = page.getByRole("button", {
      name: uiContent.shareButton.ariaLabel,
    });
    await expect(shareTrigger).toBeVisible();
    await shareTrigger.click();

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: uiContent.shareButton.copyLink })
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: uiContent.shareButton.email })
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: uiContent.shareButton.twitter })
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: uiContent.shareButton.linkedIn })
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: uiContent.shareButton.facebook })
    ).toBeVisible();

    const emailLink = menu.getByRole("menuitem", {
      name: uiContent.shareButton.emailAriaLabel,
    });
    await expect(emailLink).toHaveAttribute("href", /^mailto:\?/);
    const twitterLink = menu.getByRole("menuitem", {
      name: uiContent.shareButton.twitterAriaLabel,
    });
    await expect(twitterLink).toHaveAttribute(
      "href",
      /^https:\/\/twitter\.com\/intent\/tweet\?/
    );
  });

  test("project detail page has share button that opens menu with Copy link and social channels", async ({
    page,
  }) => {
    await page.goto(`${basePath}/projects`);
    const firstLink = page.locator(`a[href^="${basePath}/projects/"]`).first();
    if ((await firstLink.count()) === 0) {
      test.skip(true, "No project detail links on index");
    }
    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(`${basePath}/projects/`));

    const shareTrigger = page.getByRole("button", {
      name: uiContent.shareButton.ariaLabel,
    });
    await expect(shareTrigger).toBeVisible();
    await shareTrigger.click();

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: uiContent.shareButton.copyLink })
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: uiContent.shareButton.twitter })
    ).toBeVisible();
  });

  test("Copy link copies URL and shows copied feedback", async ({ page }) => {
    await page.goto(`${basePath}/writing`);
    const firstLink = page.locator(`a[href^="${basePath}/writing/"]`).first();
    if ((await firstLink.count()) === 0) {
      test.skip(true, "No writing detail links on index");
    }
    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(`${basePath}/writing/`));

    const shareTrigger = page.getByRole("button", {
      name: uiContent.shareButton.ariaLabel,
    });
    await shareTrigger.click();

    const copyMenuItem = page.getByRole("menuitem", {
      name: uiContent.shareButton.copyLinkAriaLabel,
    });
    await copyMenuItem.click();

    await expect(
      page.getByText(uiContent.shareButton.copiedLabel)
    ).toBeVisible({ timeout: 2000 });
  });
});
