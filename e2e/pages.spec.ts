import { test, expect } from "@playwright/test";
import aboutEn from "../content/locales/en/site/about.json";
import aboutEs from "../content/locales/es/site/about.json";
import aboutZh from "../content/locales/zh/site/about.json";
import homeEn from "../content/locales/en/site/home.json";
import homeEs from "../content/locales/es/site/home.json";
import homeZh from "../content/locales/zh/site/home.json";
import profileEn from "../content/locales/en/site/profile.json";
import profileEs from "../content/locales/es/site/profile.json";
import profileZh from "../content/locales/zh/site/profile.json";
import uiEn from "../content/locales/en/site/ui.json";
import uiEs from "../content/locales/es/site/ui.json";
import uiZh from "../content/locales/zh/site/ui.json";

const LOCALES = ["en", "es", "zh"] as const;
type Locale = (typeof LOCALES)[number];

const profileByLocale = { en: profileEn, es: profileEs, zh: profileZh };
const homeByLocale = { en: homeEn, es: homeEs, zh: homeZh };
const aboutByLocale = { en: aboutEn, es: aboutEs, zh: aboutZh };
const uiByLocale = { en: uiEn, es: uiEs, zh: uiZh };

function basePath(locale: Locale): string {
  return `/${locale}`;
}

test.describe("Layout (every localized page)", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);
    const profile = profileByLocale[locale];

    test(`${locale} home has full layout: skip link, header, main, footer`, async ({ page }) => {
      await page.goto(base);
      await expect(page.getByRole("link", { name: profile.navigation.skipToContentLabel })).toBeVisible();
      const siteHeader = page.locator("header").first();
      await expect(siteHeader).toBeVisible();
      await expect(siteHeader.locator(`a[href="${base}"]`)).toContainText(profile.brandMark);
      const desktopNav = siteHeader.getByRole("navigation", { name: profile.navigation.mainAriaLabel }).first();
      await expect(desktopNav).toBeVisible();
      await expect(desktopNav.locator(`a[href="${base}/projects"]`)).toBeVisible();
      await expect(desktopNav.locator(`a[href="${base}/writing"]`)).toBeVisible();
      await expect(desktopNav.locator(`a[href="${base}/about"]`)).toBeVisible();
      const main = page.locator("#main-content");
      await expect(main).toBeVisible();
      await expect(main.getByRole("main")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expect(page.locator("footer")).toContainText(profile.siteName);
      await expect(page.locator("footer")).toContainText(profile.footer.rightsLabel);
      await expect(page.locator(`footer a[href="/rss/${locale}.xml"]`)).toBeVisible();
      await expect(page.locator(`footer a[href="${base}#contact"]`)).toContainText(profile.navigation.contactLabel);
    });

    test(`${locale} about page has full layout`, async ({ page }) => {
      await page.goto(`${base}/about`);
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expect(page.locator("header").first().locator(`a[href="${base}"]`)).toContainText(profile.brandMark);
    });

    test(`${locale} writing index has full layout`, async ({ page }) => {
      await page.goto(`${base}/writing`);
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
    });

    test(`${locale} projects index has full layout`, async ({ page }) => {
      await page.goto(`${base}/projects`);
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
    });

    test(`${locale} newsletter-confirmed has full layout`, async ({ page }) => {
      await page.goto(`${base}/newsletter-confirmed`);
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
    });

    test(`${locale} newsletter-unsubscribed has full layout`, async ({ page }) => {
      await page.goto(`${base}/newsletter-unsubscribed`);
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("#main-content")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
    });
  }
});

test.describe("Home page – content rendering", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);
    const profile = profileByLocale[locale];
    const home = homeByLocale[locale];

    test(`${locale} home renders h1, role, and hero`, async ({ page }) => {
      await page.goto(base);
      await expect(page.locator("h1")).toContainText(profile.siteName);
      await expect(page.getByRole("main")).toContainText(profile.role);
      await expect(page.getByRole("main")).toContainText(home.currentFocus.title);
      await expect(page.getByRole("main")).toContainText(home.selectedWork.title);
      await expect(page.getByRole("main")).toContainText(home.recentThinking.title);
    });

    test(`${locale} home has activity section`, async ({ page }) => {
      await page.goto(base);
      await expect(page.getByRole("heading", { name: home.activity.title })).toBeVisible();
    });

    test(`${locale} home has contact section`, async ({ page }) => {
      await page.goto(base);
      const contact = page.locator("#contact");
      await expect(contact).toBeVisible();
      await expect(contact).toContainText(profile.contact.title);
    });

    test(`${locale} home has about link in main`, async ({ page }) => {
      await page.goto(base);
      await expect(page.getByRole("main").locator(`a[href="${base}/about"]`).first()).toBeVisible();
    });
  }
});

test.describe("About page – content rendering", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);
    const profile = profileByLocale[locale];
    const about = aboutByLocale[locale];

    test(`${locale} about renders intro, philosophy, expertise, background`, async ({ page }) => {
      await page.goto(`${base}/about`);
      await expect(page.locator("h1")).toContainText(about.intro.title);
      await expect(page.getByRole("main")).toContainText(about.philosophy.title);
      await expect(page.getByRole("main")).toContainText(about.expertise.title);
      await expect(page.getByRole("main")).toContainText(about.background.title);
    });

    test(`${locale} about has CTA`, async ({ page }) => {
      await page.goto(`${base}/about`);
      await expect(page.getByRole("main")).toContainText(profile.cta.buttonLabel);
    });
  }
});

test.describe("Writing index – content rendering", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);
    const profile = profileByLocale[locale];
    const ui = uiByLocale[locale];

    test(`${locale} writing index has title and main content`, async ({ page }) => {
      await page.goto(`${base}/writing`, { waitUntil: "networkidle" });
      await expect(page.locator("h1")).toContainText(profile.writingPage.title);
      await expect(page.getByRole("main")).toBeVisible();
      const themeNav = page.getByRole("navigation", { name: ui.writing.themeNavAriaLabel });
      if ((await themeNav.count()) > 0) {
        await expect(themeNav).toBeVisible();
      }
    });

    test(`${locale} writing index has search or article list`, async ({ page }) => {
      await page.goto(`${base}/writing`, { waitUntil: "networkidle" });
      const main = page.getByRole("main");
      const hasSearch = (await main.locator("#writing-search").count()) > 0;
      const hasArticles = (await main.locator("article").count()) > 0;
      expect(hasSearch || hasArticles || (await main.locator(`text=${ui.writing.emptyState}`).count()) > 0).toBe(true);
    });
  }
});

test.describe("Writing detail – content rendering", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);
    const ui = uiByLocale[locale];

    test(`${locale} first writing detail renders article and read time`, async ({ page }) => {
      await page.goto(`${base}/writing`);
      const firstLink = page.locator(`a[href^="${base}/writing/"]`).first();
      if ((await firstLink.count()) === 0) return;
      await firstLink.click();
      await expect(page).toHaveURL(new RegExp(`${base}/writing/`));
      const main = page.getByRole("main");
      await expect(main.locator("article").first()).toBeVisible({ timeout: 5000 });
      await expect(main.getByText(new RegExp(ui.writing.minuteReadLabel)).first()).toBeVisible({ timeout: 5000 });
    });
  }
});

test.describe("Projects index – content rendering", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);
    const profile = profileByLocale[locale];

    test(`${locale} projects index has title and list or empty state`, async ({ page }) => {
      await page.goto(`${base}/projects`);
      await expect(page.locator("h1")).toContainText(profile.projectsPage.title);
      const main = page.getByRole("main");
      const ui = uiByLocale[locale];
      const hasCards = (await main.locator("article, [class*='card'], .grid > div").count()) > 0;
      const hasEmpty = (await main.locator(`text=${ui.projects.emptyState}`).count()) > 0;
      expect(hasCards || hasEmpty).toBe(true);
    });
  }
});

test.describe("Project detail – content rendering", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);
    const ui = uiByLocale[locale];

    test(`${locale} first project detail renders motivation and problem`, async ({ page }) => {
      await page.goto(`${base}/projects`);
      const firstLink = page.locator(`a[href^="${base}/projects/"]`).first();
      if ((await firstLink.count()) === 0) return;
      await firstLink.click();
      await expect(page.getByRole("heading", { name: ui.projects.motivationLabel })).toBeVisible();
      await expect(page.getByRole("heading", { name: ui.projects.problemLabel })).toBeVisible();
    });
  }
});

test.describe("Newsletter confirm page – content rendering", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);

    test(`${locale} newsletter-confirm loads and has main and heading`, async ({ page }) => {
      await page.goto(`${base}/newsletter-confirm`);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.locator("h1")).toBeVisible();
      const title = await page.locator("h1").textContent();
      expect(title!.length).toBeGreaterThan(0);
    });
  }
});

test.describe("Newsletter unsubscribe page – content rendering", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);

    test(`${locale} newsletter-unsubscribe loads and has main and heading`, async ({ page }) => {
      await page.goto(`${base}/newsletter-unsubscribe`);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.locator("h1")).toBeVisible();
      const title = await page.locator("h1").textContent();
      expect(title!.length).toBeGreaterThan(0);
    });
  }
});

test.describe("Newsletter confirmed page – content rendering", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);
    const profile = profileByLocale[locale];

    test(`${locale} newsletter-confirmed shows title, description, and CTAs`, async ({ page }) => {
      await page.goto(`${base}/newsletter-confirmed`);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.locator("h1")).toContainText(profile.newsletter.confirmedTitle);
      await expect(page.getByRole("main")).toContainText(profile.newsletter.confirmedDescription);
      await expect(
        page.getByRole("link", { name: profile.newsletter.confirmedPrimaryCtaLabel })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: profile.newsletter.confirmedSecondaryCtaLabel })
      ).toBeVisible();
    });
  }
});

test.describe("Newsletter unsubscribed page – content rendering", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);
    const profile = profileByLocale[locale];

    test(`${locale} newsletter-unsubscribed shows title, description, and CTAs`, async ({ page }) => {
      await page.goto(`${base}/newsletter-unsubscribed`);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.locator("h1")).toContainText(profile.newsletter.unsubscribedTitle);
      await expect(page.getByRole("main")).toContainText(profile.newsletter.unsubscribedDescription);
      await expect(
        page.getByRole("link", { name: profile.newsletter.unsubscribedPrimaryCtaLabel })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: profile.newsletter.unsubscribedSecondaryCtaLabel })
      ).toBeVisible();
    });
  }
});

test.describe("Root and redirects", () => {
  test("bare / redirects to preferred locale", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/(en|es|zh)(\/|$)/);
  });

  test("invalid locale path shows 404", async ({ page }) => {
    await page.goto("/xx/about");
    await expect(page.locator("text=404")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("404 page – layout and content", () => {
  test("404 shows title, description, and navigation links", async ({ page }) => {
    await page.goto("/en/nonexistent-page");
    await expect(page.locator("text=404")).toBeVisible();
    await expect(page.getByRole("main")).toContainText(profileEn.notFound.description);
    await expect(page.getByRole("link", { name: profileEn.notFound.homeLabel })).toBeVisible();
    await expect(page.getByRole("link", { name: profileEn.notFound.projectsLabel })).toBeVisible();
    await expect(page.getByRole("link", { name: profileEn.notFound.writingLabel })).toBeVisible();
  });

  test("404 with root path uses default locale copy", async ({ page }) => {
    await page.goto("/nonexistent");
    await expect(page.locator("text=404")).toBeVisible();
    await expect(page.getByRole("link", { name: profileEn.notFound.homeLabel })).toBeVisible();
  });
});

test.describe("Metadata and document", () => {
  for (const locale of LOCALES) {
    const base = basePath(locale);
    const profile = profileByLocale[locale];

    test(`${locale} home has document title and meta description`, async ({ page }) => {
      await page.goto(base);
      await expect(page).toHaveTitle(new RegExp(profile.siteName));
      const meta = page.locator('meta[name="description"]');
      await expect(meta).toHaveAttribute("content", new RegExp(profile.siteName));
    });

    test(`${locale} home has favicon`, async ({ page }) => {
      await page.goto(base);
      await expect(
        page.locator(`link[rel="icon"][href="${profile.assets.faviconPath}"]`)
      ).toBeAttached();
    });
  }
});

test.describe("Mobile navigation", () => {
  test("menu button opens drawer with nav links and contact", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/en");

    const profile = profileEn;

    const menuButton = page.getByRole("button", { name: profile.navigation.menuOpenAriaLabel });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const drawer = page.locator("#site-header-menu-panel");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: profile.navigation.projectsLabel })).toBeVisible();
    await expect(drawer.getByRole("link", { name: profile.navigation.writingLabel })).toBeVisible();
    await expect(drawer.getByRole("link", { name: profile.navigation.aboutLabel })).toBeVisible();
    await expect(drawer.getByRole("link", { name: profile.navigation.contactLabel })).toBeVisible();
  });
});

test.describe("Theme toggle and comment color theme", () => {
  test("theme toggle adds and removes dark class on document", async ({ page }) => {
    await page.goto("/en");
    const themeButton = page.getByRole("button", { name: /theme toggle/i });
    await expect(themeButton).toBeVisible();

    const hasDarkBefore = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    await themeButton.click();
    const hasDarkAfterFirst = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    expect(hasDarkAfterFirst).toBe(!hasDarkBefore);

    await themeButton.click();
    const hasDarkAfterSecond = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    expect(hasDarkAfterSecond).toBe(hasDarkBefore);
  });

  test("on page with comments, giscus script data-theme matches site theme and updates after toggle", async ({
    page,
  }) => {
    await page.goto("/en/writing/static-first");
    const container = page.locator(".giscus-container");
    const script = container.locator('script[src="https://giscus.app/client.js"]');

    const hasComments = (await script.count()) > 0;
    test.skip(!hasComments, "Comments section not rendered (GISCUS_* unset)");

    const isDarkBefore = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    const expectedThemeBefore = isDarkBefore ? "dark_dimmed" : "light";
    await expect(script).toHaveAttribute("data-theme", expectedThemeBefore);

    const themeButton = page.getByRole("button", { name: /theme toggle/i });
    await themeButton.click();
    await page.waitForTimeout(300);

    const isDarkAfter = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    const expectedThemeAfter = isDarkAfter ? "dark_dimmed" : "light";
    const scriptAfter = container.locator('script[src="https://giscus.app/client.js"]');
    await expect(scriptAfter).toHaveAttribute("data-theme", expectedThemeAfter);
  });
});
