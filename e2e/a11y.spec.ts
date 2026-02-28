import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const CRITICAL_ROUTES = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/writing", name: "writing index" },
  { path: "/projects", name: "projects index" },
];

test.describe("Accessibility (axe-core)", () => {
  for (const { path, name } of CRITICAL_ROUTES) {
    test(`${name} (${path}) has no critical a11y violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const critical = results.violations.filter((v) => v.impact === "critical");
      expect(critical, `Critical a11y violations on ${name}: ${JSON.stringify(critical, null, 2)}`).toEqual([]);
    });
  }

  test("one writing page has no critical a11y violations", async ({ page }) => {
    await page.goto("/writing");
    const firstLink = page.locator('a[href^="/writing/"]').first();
    const href = await firstLink.getAttribute("href");
    if (!href) {
      test.skip();
      return;
    }
    await page.goto(href);
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, `Critical a11y violations on writing page: ${JSON.stringify(critical, null, 2)}`).toEqual([]);
  });
});
