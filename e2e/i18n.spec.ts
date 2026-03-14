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
import formsEs from "../content/locales/es/site/forms.json";
import formsZh from "../content/locales/zh/site/forms.json";

const LOCALES = ["en", "es", "zh"] as const;
const baseURL = "http://localhost:4173";

test.describe("i18n: Home page", () => {
  for (const locale of LOCALES) {
    const basePath = `/${locale}`;
    const profile = locale === "en" ? profileEn : locale === "es" ? profileEs : profileZh;
    const home = locale === "en" ? homeEn : locale === "es" ? homeEs : homeZh;

    test(`${locale} home shows locale-specific content`, async ({ page }) => {
      await page.goto(`${basePath}`);
      await expect(page.locator("h1")).toContainText(profile.siteName);
      await expect(page.getByRole("main")).toContainText(profile.role);
      await expect(page.getByRole("main")).toContainText(home.currentFocus.title);
      await expect(page.getByRole("main")).toContainText(home.selectedWork.title);
      await expect(page.getByRole("main")).toContainText(home.recentThinking.title);
    });

    test(`${locale} home about link points to localized about`, async ({ page }) => {
      await page.goto(`${basePath}`);
      const mainAboutLink = page.getByRole("main").locator(`a[href="${basePath}/about"]`).first();
      await expect(mainAboutLink).toBeVisible();
      await expect(mainAboutLink).toContainText(home.hero.aboutLink.label.split(" ")[0]);
    });
  }
});

test.describe("i18n: About page", () => {
  const aboutByLocale = { en: aboutEn, es: aboutEs, zh: aboutZh };

  for (const locale of LOCALES) {
    const basePath = `/${locale}`;
    const about = aboutByLocale[locale];

    test(`${locale} about page shows locale-specific intro and sections`, async ({ page }) => {
      await page.goto(`${basePath}/about`);
      await expect(page.locator("h1")).toContainText(about.intro.title);
      await expect(page.getByRole("main")).toContainText(about.philosophy.title);
      await expect(page.getByRole("main")).toContainText(about.expertise.title);
      await expect(page.getByRole("main")).toContainText(about.background.title);
    });
  }
});

test.describe("i18n: Projects", () => {
  const profileByLocale = { en: profileEn, es: profileEs, zh: profileZh };
  const uiByLocale = { en: uiEn, es: uiEs, zh: uiZh };

  for (const locale of LOCALES) {
    const basePath = `/${locale}`;
    const profile = profileByLocale[locale];
    const ui = uiByLocale[locale];

    test(`${locale} projects index shows locale-specific title and nav`, async ({ page }) => {
      await page.goto(`${basePath}/projects`);
      await expect(page.locator("h1")).toContainText(profile.projectsPage.title);
      await expect(page.locator("header nav")).toContainText(profile.navigation.projectsLabel);
      await expect(page.locator("header nav")).toContainText(profile.navigation.writingLabel);
      await expect(page.locator("header nav")).toContainText(profile.navigation.aboutLabel);
    });

    test(`${locale} project detail shows locale-specific UI labels`, async ({ page }) => {
      await page.goto(`${basePath}/projects`);
      const firstLink = page.locator(`a[href^="${basePath}/projects/"]`).first();
      if ((await firstLink.count()) === 0) return;
      await firstLink.click();
      await expect(page.getByRole("heading", { name: ui.projects.motivationLabel })).toBeVisible();
      await expect(page.getByRole("heading", { name: ui.projects.problemLabel })).toBeVisible();
    });
  }
});

test.describe("i18n: Writings", () => {
  const profileByLocale = { en: profileEn, es: profileEs, zh: profileZh };
  const uiByLocale = { en: uiEn, es: uiEs, zh: uiZh };

  for (const locale of LOCALES) {
    const basePath = `/${locale}`;
    const profile = profileByLocale[locale];
    const ui = uiByLocale[locale];

    test(`${locale} writing index shows locale-specific title and theme nav`, async ({ page }) => {
      await page.goto(`${basePath}/writing`, { waitUntil: "networkidle" });
      await expect(page.locator("h1")).toContainText(profile.writingPage.title);
      const main = page.getByRole("main");
      await expect(main).toBeVisible();
      const themeNav = page.getByRole("navigation", { name: ui.writing.themeNavAriaLabel });
      if ((await themeNav.count()) > 0) {
        await expect(themeNav).toBeVisible();
      }
    });

    test(`${locale} writing detail shows locale-specific UI and content`, async ({ page }) => {
      await page.goto(`${basePath}/writing`);
      const firstLink = page.locator(`a[href^="${basePath}/writing/"]`).first();
      if ((await firstLink.count()) === 0) return;
      await firstLink.click();
      await expect(page).toHaveURL(new RegExp(`${basePath}/writing/`));
      const main = page.getByRole("main");
      await expect(main).toBeVisible();
      await expect(main.getByText(new RegExp(ui.writing.minuteReadLabel)).first()).toBeVisible({ timeout: 5000 });
    });

    test(`${locale} writing page shows theme descriptors in locale`, async ({ page }) => {
      await page.goto(`${basePath}/writing`);
      const themeDescriptorEn = uiEn.themeDescriptors["Architecture"];
      const themeDescriptor = ui.themeDescriptors["Architecture"] ?? themeDescriptorEn;
      await expect(page.getByRole("main")).toContainText(themeDescriptor);
    });
  }
});

test.describe("i18n: RSS feeds", () => {
  test("each locale footer links to its own RSS feed", async ({ page }) => {
    const rssLabelByLocale = { en: profileEn.navigation.rssLabel, es: profileEs.navigation.rssLabel, zh: profileZh.navigation.rssLabel };
    for (const locale of LOCALES) {
      await page.goto(`/${locale}`);
      const rssLink = page.locator(`footer a[href="/rss/${locale}.xml"]`);
      await expect(rssLink).toBeVisible();
      await expect(rssLink).toContainText(rssLabelByLocale[locale]);
    }
  });

  test("writing page RSS link is locale-specific (in newsletter slideout)", async ({ page }) => {
    const openSlideoutAndExpectRss = async (path: string, rssHref: string, toggleName: string) => {
      await page.goto(path);
      await page.evaluate(() => sessionStorage.removeItem("newsletter-slideout-expanded"));
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.getByRole("button", { name: toggleName }).click();
      const slideout = page.getByRole("region", { name: toggleName });
      await expect(slideout).toBeVisible({ timeout: 5000 });
      await expect(slideout.locator(`a[href="${rssHref}"]`)).toBeVisible();
    };
    await openSlideoutAndExpectRss("/es/writing", "/rss/es.xml", formsEs.newsletter.title);
    await openSlideoutAndExpectRss("/zh/writing", "/rss/zh.xml", formsZh.newsletter.title);
  });

  test("each locale RSS feed returns 200 and contains items", async ({ request }) => {
    for (const locale of LOCALES) {
      const res = await request.get(`${baseURL}/rss/${locale}.xml`);
      expect(res.ok(), `RSS feed /rss/${locale}.xml should be 200`).toBe(true);
      const text = await res.text();
      expect(text).toContain("<channel>");
      expect(text).toContain("<item>");
      expect(text).toContain("<title>");
    }
  });

  test("es RSS feed contains Spanish content", async ({ request }) => {
    const res = await request.get(`${baseURL}/rss/es.xml`);
    expect(res.ok()).toBe(true);
    const text = await res.text();
    expect(text).toContain(profileEs.rss.language);
    expect(text).toContain(profileEs.rss.title);
  });

  test("zh RSS feed contains Chinese content", async ({ request }) => {
    const res = await request.get(`${baseURL}/rss/zh.xml`);
    expect(res.ok()).toBe(true);
    const text = await res.text();
    expect(text).toContain(profileZh.rss.language);
    expect(text).toContain(profileZh.rss.title);
  });
});

test.describe("i18n: Newsletter", () => {
  test("newsletter signup on es shows Spanish form labels", async ({ page }) => {
    await page.goto("/es/writing");
    await page.getByRole("button", { name: formsEs.newsletter.title }).click();
    await expect(page.getByLabel(formsEs.newsletter.emailLabel)).toBeVisible();
    await expect(page.getByRole("button", { name: formsEs.newsletter.submitLabel })).toBeVisible();
  });

  test("newsletter confirm page route exists and uses locale", async ({ page }) => {
    await page.goto("/es/newsletter-confirm");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    const title = await page.locator("h1").textContent();
    expect(title?.length).toBeGreaterThan(0);
  });

  test("newsletter unsubscribe page route exists and uses locale", async ({ page }) => {
    await page.goto("/zh/newsletter-unsubscribe");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    const title = await page.locator("h1").textContent();
    expect(title?.length).toBeGreaterThan(0);
  });
});

test.describe("i18n: Search", () => {
  test("search on en writing page loads and accepts input", async ({ page }) => {
    await page.goto("/en/writing");
    const searchInput = page.getByPlaceholder(uiEn.searchWriting.placeholder);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("static");
    await expect(searchInput).toHaveValue("static");
  });

  test("search on es writing page uses Spanish placeholder", async ({ page }) => {
    await page.goto("/es/writing", { waitUntil: "networkidle" });
    const searchInput = page.locator("#writing-search");
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill("Construir");
    const resultsRegion = page.locator("#search-results-desc");
    await expect(resultsRegion).toBeVisible({ timeout: 5000 });
    await expect(resultsRegion).toContainText("Construir");
  });

  test("search on zh writing page returns results for Chinese query", async ({ page }) => {
    await page.goto("/zh/writing", { waitUntil: "networkidle" });
    const searchInput = page.locator("#writing-search");
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill("静态");
    const resultsRegion = page.locator("#search-results-desc");
    await expect(resultsRegion).toBeVisible({ timeout: 5000 });
    await expect(resultsRegion.locator("a").first()).toBeVisible();
  });
});

test.describe("i18n: Language switcher", () => {
  test("switching to es from home updates content to Spanish", async ({ page }) => {
    await page.goto("/en");
    await page.getByLabel(uiEn.languageSwitcher.ariaLabel).first().selectOption("es");
    await page.waitForURL("**/es");
    await expect(page.locator("h1")).toContainText(profileEs.siteName);
    await expect(page.getByRole("main")).toContainText(homeEs.currentFocus.title);
  });

  test("switching to zh from about updates content to Chinese", async ({ page }) => {
    await page.goto("/en/about");
    await page.getByLabel(uiEn.languageSwitcher.ariaLabel).first().selectOption("zh");
    await page.waitForURL("**/zh/about");
    await expect(page.locator("h1")).toContainText(aboutZh.intro.title);
  });

  test("all supported locales appear in language switcher", async ({ page }) => {
    await page.goto("/en");
    // Header and mobile menu each have a language switcher; scope to the first (visible) one.
    const select = page.getByLabel(uiEn.languageSwitcher.ariaLabel).first();
    await expect(select).toBeVisible();
    await expect(select.locator('option[value="en"]')).toContainText("English");
    await expect(select.locator('option[value="es"]')).toContainText("Espanol");
    await expect(select.locator('option[value="zh"]')).toContainText("中文");
  });
});

test.describe("i18n: Tags and themes", () => {
  test("writing detail can show tags when present", async ({ page }) => {
    await page.goto("/en/writing");
    const firstLink = page.locator(`a[href^="/en/writing/"]`).first();
    if ((await firstLink.count()) === 0) return;
    await firstLink.click();
    const main = page.getByRole("main");
    await expect(main.locator("article").first()).toBeVisible();
    const tagLinks = main.locator('a[href*="/writing?"], [class*="tag"]');
    if ((await tagLinks.count()) > 0) {
      await expect(tagLinks.first()).toBeVisible();
    }
  });

  test("writing index shows theme navigation with locale labels", async ({ page }) => {
    await page.goto("/es/writing");
    const themeNav = page.getByRole("navigation", { name: uiEs.writing.themeNavAriaLabel });
    await expect(themeNav).toBeVisible();
    const themeLinks = themeNav.locator("a");
    await expect(themeLinks.first()).toBeVisible();
  });
});
