import { test, expect } from "@playwright/test";
import aboutContent from "../content/locales/en/site/about.json";
import homeContent from "../content/locales/en/site/home.json";
import siteProfileEs from "../content/locales/es/site/profile.json";
import siteProfile from "../content/locales/en/site/profile.json";
import uiContent from "../content/locales/en/site/ui.json";

const defaultLocale = "en";
const defaultBasePath = `/${defaultLocale}`;

test.describe("Homepage - 15-Second Overview", () => {
  test("redirects bare homepage to the preferred locale", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(`**/${defaultLocale}`);
  });

  test("renders configured identity and key sections", async ({ page }) => {
    await page.goto(defaultBasePath);
    await expect(page.locator("h1")).toContainText(siteProfile.siteName);
    await expect(page.locator(`text=${siteProfile.role}`)).toBeVisible();
    await expect(page.getByRole("main")).toContainText(`go by ${siteProfile.givenName}`);

    await expect(page.locator(`text=${homeContent.currentFocus.title}`)).toBeVisible();
    await expect(page.locator(`text=${homeContent.selectedWork.title}`)).toBeVisible();
    await expect(page.locator(`text=${homeContent.recentThinking.title}`)).toBeVisible();
    await expect(page.getByRole("heading", { name: homeContent.activity.title })).toBeVisible();
  });

  test("contact section is accessible from homepage", async ({ page }) => {
    await page.goto(defaultBasePath);

    const contactSection = page.locator("#contact");
    await expect(contactSection).toBeVisible();
    await expect(contactSection.locator(`text=${siteProfile.contact.title}`)).toBeVisible();
  });

  test("navigation links point to correct pages", async ({ page }) => {
    await page.goto(defaultBasePath);

    const nav = page.locator("header nav");
    await expect(nav.locator(`a[href="${defaultBasePath}/projects"]`)).toBeVisible();
    await expect(nav.locator(`a[href="${defaultBasePath}/writing"]`)).toBeVisible();
    await expect(nav.locator(`a[href="${defaultBasePath}/about"]`)).toBeVisible();
    await expect(nav.locator(`a[href="${defaultBasePath}#contact"]`)).toBeVisible();
  });

  test("language switcher appears when multiple locales are supported", async ({ page }) => {
    await page.goto(defaultBasePath);
    await expect(page.getByLabel(uiContent.languageSwitcher.ariaLabel)).toBeVisible();
  });

  test("language switcher preserves the current route", async ({ page }) => {
    await page.goto(`${defaultBasePath}/about`);
    await page.getByLabel(uiContent.languageSwitcher.ariaLabel).selectOption("es");
    await page.waitForURL("**/es/about");
    await expect(page.locator("h1")).toContainText(siteProfileEs.navigation.aboutLabel);
  });
});

test.describe("Projects Section", () => {
  test("projects index page loads and lists projects", async ({ page }) => {
    await page.goto(`${defaultBasePath}/projects`);

    await expect(page.locator("h1")).toContainText(siteProfile.projectsPage.title);
    const projectCards = page.locator("article, [class*='ProjectCard'], .grid > div");
    await expect(projectCards.first()).toBeVisible();
  });

  test("project detail page renders narrative sections", async ({ page }) => {
    await page.goto(`${defaultBasePath}/projects`);

    const firstProjectLink = page.locator(`a[href^="${defaultBasePath}/projects/"]`).first();
    await firstProjectLink.click();

    await expect(page.getByRole("heading", { name: uiContent.projects.motivationLabel })).toBeVisible();
    await expect(page.getByRole("heading", { name: uiContent.projects.problemLabel })).toBeVisible();
  });

  test("project detail page has reach-out CTA", async ({ page }) => {
    await page.goto(`${defaultBasePath}/projects`);

    const firstProjectLink = page.locator(`a[href^="${defaultBasePath}/projects/"]`).first();
    await firstProjectLink.click();

    await expect(page.locator(`text=${siteProfile.cta.buttonLabel}`)).toBeVisible();
  });
});

test.describe("Writing Section", () => {
  test("writing index page loads and groups by theme", async ({ page }) => {
    await page.goto(`${defaultBasePath}/writing`);

    await expect(page.locator("h1")).toContainText(siteProfile.writingPage.title);
    const writingCards = page.locator("article");
    await expect(writingCards.first()).toBeVisible();
  });

  test("writing detail page renders content and metadata", async ({ page }) => {
    await page.goto(`${defaultBasePath}/writing`);

    const firstWritingLink = page.locator(`a[href^="${defaultBasePath}/writing/"]`).first();
    const href = await firstWritingLink.getAttribute("href");
    await firstWritingLink.click();
    await page.waitForURL(`**${href}`);

    const mainArticle = page.getByRole("main").locator("article").first();
    await expect(mainArticle).toBeVisible();
    await expect(mainArticle.getByText(new RegExp(uiContent.writing.minuteReadLabel))).toBeVisible();
  });

  test("writing detail page has reach-out CTA", async ({ page }) => {
    await page.goto(`${defaultBasePath}/writing`);

    const firstWritingLink = page.locator(`a[href^="${defaultBasePath}/writing/"]`).first();
    const href = await firstWritingLink.getAttribute("href");
    await firstWritingLink.click();
    await page.waitForURL(`**${href}`);

    await expect(page.locator(`text=${siteProfile.cta.buttonLabel}`)).toBeVisible();
  });
});

test.describe("About Page", () => {
  test("about page loads with key sections", async ({ page }) => {
    await page.goto(`${defaultBasePath}/about`);

    await expect(page.locator("h1")).toContainText(aboutContent.intro.title);
    await expect(page.locator(`text=${aboutContent.philosophy.title}`)).toBeVisible();
    await expect(page.locator(`text=${aboutContent.expertise.title}`)).toBeVisible();
    await expect(page.locator(`text=${aboutContent.background.title}`)).toBeVisible();
  });

  test("about page has reach-out CTA", async ({ page }) => {
    await page.goto(`${defaultBasePath}/about`);

    await expect(page.locator(`text=${siteProfile.cta.buttonLabel}`)).toBeVisible();
  });

  test("navigation includes About link", async ({ page }) => {
    await page.goto(defaultBasePath);

    const nav = page.locator("header nav");
    await expect(nav.locator(`a[href="${defaultBasePath}/about"]`)).toBeVisible();
  });

  test("homepage has pathway to about page", async ({ page }) => {
    await page.goto(defaultBasePath);

    const aboutLink = page.locator(`a[href="${defaultBasePath}/about"]`).first();
    await expect(aboutLink).toBeVisible();
  });
});

test.describe("No-JS Degradation", () => {
  test.use({ javaScriptEnabled: false });

  test("homepage core content is readable without JavaScript", async ({ page }) => {
    await page.goto(defaultBasePath);

    await expect(page.locator("h1")).toContainText(siteProfile.siteName);
    await expect(page.locator(`text=${siteProfile.role}`)).toBeVisible();
    await expect(page.locator(`text=${homeContent.currentFocus.title}`)).toBeVisible();
    await expect(page.locator(`text=${homeContent.selectedWork.title}`)).toBeVisible();
  });

  test("projects page is readable without JavaScript", async ({ page }) => {
    await page.goto(`${defaultBasePath}/projects`);
    await expect(page.locator("h1")).toContainText(siteProfile.projectsPage.title);
  });

  test("writing page is readable without JavaScript", async ({ page }) => {
    await page.goto(`${defaultBasePath}/writing`);
    await expect(page.locator("h1")).toContainText(siteProfile.writingPage.title);
  });

  test("about page is readable without JavaScript", async ({ page }) => {
    await page.goto(`${defaultBasePath}/about`);
    await expect(page.locator("h1")).toContainText(aboutContent.intro.title);
    await expect(page.locator(`text=${aboutContent.philosophy.title}`)).toBeVisible();
  });
});

test.describe("404 Page", () => {
  test("shows not found page for invalid routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.locator("text=404")).toBeVisible();
    await expect(page.getByRole("link", { name: siteProfile.notFound.homeLabel })).toBeVisible();
  });
});

test.describe("SEO & Metadata", () => {
  test("homepage has correct title and meta description", async ({ page }) => {
    await page.goto(defaultBasePath);
    await expect(page).toHaveTitle(new RegExp(siteProfile.siteName));

    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", new RegExp(siteProfile.siteName));
  });

  test("homepage has OpenGraph tags", async ({ page }) => {
    await page.goto(defaultBasePath);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", new RegExp(siteProfile.siteName));

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toBeAttached();
  });

  test("project detail page has OpenGraph metadata", async ({ page }) => {
    await page.goto(`${defaultBasePath}/projects`);
    const firstLink = page.locator(`a[href^="${defaultBasePath}/projects/"]`).first();
    const href = await firstLink.getAttribute("href");
    await page.goto(href!);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toBeAttached();

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "article");
  });

  test("writing detail page has OpenGraph metadata", async ({ page }) => {
    await page.goto(`${defaultBasePath}/writing`);
    const firstLink = page.locator(`a[href^="${defaultBasePath}/writing/"]`).first();
    const href = await firstLink.getAttribute("href");
    await page.goto(href!);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toBeAttached();

    const metaDesc = page.locator('meta[name="description"]');
    const descContent = await metaDesc.getAttribute("content");
    expect(descContent!.length).toBeGreaterThan(20);
  });

  test("RSS feed link is in the document head", async ({ page }) => {
    await page.goto(defaultBasePath);
    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveAttribute("href", "/rss.xml");
  });

  test("favicon is referenced", async ({ page }) => {
    await page.goto(defaultBasePath);
    const favicon = page.locator(`link[rel="icon"][href="${siteProfile.assets.faviconPath}"]`);
    await expect(favicon).toBeAttached();
  });
});
