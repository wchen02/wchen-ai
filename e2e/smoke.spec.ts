import { test, expect } from "@playwright/test";

test.describe("Homepage - 15-Second Overview", () => {
  test("renders Wilson's identity and key sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("Wilson Chen");
    await expect(page.locator("text=Founder & Builder")).toBeVisible();
    await expect(page.locator("text=I go by Wilson")).toBeVisible();

    await expect(page.locator("text=Current Focus")).toBeVisible();
    await expect(page.locator("text=Selected Work")).toBeVisible();
    await expect(page.locator("text=Recent Thinking")).toBeVisible();
    await expect(page.locator("text=Activity")).toBeVisible();
  });

  test("contact section is accessible from homepage", async ({ page }) => {
    await page.goto("/");

    const contactSection = page.locator("#contact");
    await expect(contactSection).toBeVisible();
    await expect(contactSection.locator("text=collaborate")).toBeVisible();
  });

  test("navigation links point to correct pages", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("header nav");
    await expect(nav.locator('a[href="/projects"]')).toBeVisible();
    await expect(nav.locator('a[href="/writing"]')).toBeVisible();
    await expect(nav.locator('a[href="/about"]')).toBeVisible();
    await expect(nav.locator('a[href="/#contact"]')).toBeVisible();
  });
});

test.describe("Projects Section", () => {
  test("projects index page loads and lists projects", async ({ page }) => {
    await page.goto("/projects");

    await expect(page.locator("h1")).toContainText("Projects");
    const projectCards = page.locator("article, [class*='ProjectCard'], .grid > div");
    await expect(projectCards.first()).toBeVisible();
  });

  test("project detail page renders narrative sections", async ({ page }) => {
    await page.goto("/projects");

    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    await firstProjectLink.click();

    await expect(page.locator("text=The Motivation")).toBeVisible();
    await expect(page.locator("text=The Problem")).toBeVisible();
  });

  test("project detail page has reach-out CTA", async ({ page }) => {
    await page.goto("/projects");

    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    await firstProjectLink.click();

    await expect(page.locator("text=Start a conversation")).toBeVisible();
  });
});

test.describe("Writing Section", () => {
  test("writing index page loads and groups by theme", async ({ page }) => {
    await page.goto("/writing");

    await expect(page.locator("h1")).toContainText("Writing");
    const writingCards = page.locator("article");
    await expect(writingCards.first()).toBeVisible();
  });

  test("writing detail page renders content and metadata", async ({ page }) => {
    await page.goto("/writing");

    const firstWritingLink = page.locator('a[href^="/writing/"]').first();
    const href = await firstWritingLink.getAttribute("href");
    await firstWritingLink.click();
    await page.waitForURL(`**${href}`);

    await expect(page.locator("article")).toBeVisible();
    await expect(page.locator("text=min read")).toBeVisible();
  });

  test("writing detail page has reach-out CTA", async ({ page }) => {
    await page.goto("/writing");

    const firstWritingLink = page.locator('a[href^="/writing/"]').first();
    const href = await firstWritingLink.getAttribute("href");
    await firstWritingLink.click();
    await page.waitForURL(`**${href}`);

    await expect(page.locator("text=Start a conversation")).toBeVisible();
  });
});

test.describe("About Page", () => {
  test("about page loads with key sections", async ({ page }) => {
    await page.goto("/about");

    await expect(page.locator("h1")).toContainText("About");
    await expect(page.locator("text=Philosophy")).toBeVisible();
    await expect(page.locator("text=Interests")).toBeVisible();
    await expect(page.locator("text=Background")).toBeVisible();
  });

  test("about page has reach-out CTA", async ({ page }) => {
    await page.goto("/about");

    await expect(page.locator("text=Start a conversation")).toBeVisible();
  });

  test("navigation includes About link", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("header nav");
    await expect(nav.locator('a[href="/about"]')).toBeVisible();
  });

  test("homepage has pathway to about page", async ({ page }) => {
    await page.goto("/");

    const aboutLink = page.locator('a[href="/about"]').first();
    await expect(aboutLink).toBeVisible();
  });
});

test.describe("No-JS Degradation", () => {
  test.use({ javaScriptEnabled: false });

  test("homepage core content is readable without JavaScript", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("Wilson Chen");
    await expect(page.locator("text=Founder & Builder")).toBeVisible();
    await expect(page.locator("text=Current Focus")).toBeVisible();
    await expect(page.locator("text=Selected Work")).toBeVisible();
  });

  test("projects page is readable without JavaScript", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator("h1")).toContainText("Projects");
  });

  test("writing page is readable without JavaScript", async ({ page }) => {
    await page.goto("/writing");
    await expect(page.locator("h1")).toContainText("Writing");
  });

  test("about page is readable without JavaScript", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1")).toContainText("About");
    await expect(page.locator("text=Philosophy")).toBeVisible();
  });
});

test.describe("404 Page", () => {
  test("shows not found page for invalid routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.locator("text=404")).toBeVisible();
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
  });
});

test.describe("SEO & Metadata", () => {
  test("homepage has correct title and meta description", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Wilson Chen/);

    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /Wilson Chen/);
  });

  test("homepage has OpenGraph tags", async ({ page }) => {
    await page.goto("/");

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /Wilson Chen/);

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toBeAttached();
  });

  test("project detail page has OpenGraph metadata", async ({ page }) => {
    await page.goto("/projects");
    const firstLink = page.locator('a[href^="/projects/"]').first();
    const href = await firstLink.getAttribute("href");
    await page.goto(href!);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toBeAttached();

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "article");
  });

  test("writing detail page has OpenGraph metadata", async ({ page }) => {
    await page.goto("/writing");
    const firstLink = page.locator('a[href^="/writing/"]').first();
    const href = await firstLink.getAttribute("href");
    await page.goto(href!);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toBeAttached();

    const metaDesc = page.locator('meta[name="description"]');
    const descContent = await metaDesc.getAttribute("content");
    expect(descContent!.length).toBeGreaterThan(20);
  });

  test("RSS feed link is in the document head", async ({ page }) => {
    await page.goto("/");
    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveAttribute("href", "/rss.xml");
  });

  test("favicon is referenced", async ({ page }) => {
    await page.goto("/");
    const favicon = page.locator('link[rel="icon"][href="/favicon.svg"]');
    await expect(favicon).toBeAttached();
  });
});
