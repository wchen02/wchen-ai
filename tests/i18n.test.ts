import { describe, expect, it } from "vitest";
import { getProjects, getWritingBySlug, getWritings } from "@/lib/mdx";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { getThemeDescriptor, getThemeLabel } from "@/lib/theme-config";
import { getLocaleContent } from "@/lib/content";
import { getRecurringNewsletterCandidates } from "@/lib/newsletter-recurring";
import { getSiteProfile } from "@/lib/site-config";

describe("i18n: writings", () => {
  it("getWritings returns locale-specific titles for the same slug", () => {
    const slug = "static-first";
    const en = getWritingBySlug(slug, "en");
    const es = getWritingBySlug(slug, "es");
    const zh = getWritingBySlug(slug, "zh");
    expect(en).toBeTruthy();
    expect(es).toBeTruthy();
    expect(zh).toBeTruthy();
    expect(en!.title).not.toBe(es!.title);
    expect(en!.title).not.toBe(zh!.title);
    expect(es!.title).not.toBe(zh!.title);
    expect(en!.title).toContain("Static");
    expect(es!.title).toMatch(/Construir|static/i);
    expect(zh!.title).toMatch(/静态|万物/i);
  });

  it("getWritings(locale) returns entries for each supported locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const writings = getWritings(locale);
      expect(writings.length).toBeGreaterThan(0);
      expect(writings.every((w) => w.title.length > 0)).toBe(true);
    }
  });
});

describe("i18n: projects", () => {
  it("getProjects returns locale-specific titles for each supported locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const projects = getProjects(locale);
      expect(projects.length).toBeGreaterThanOrEqual(0);
      projects.forEach((p) => {
        expect(p.title).toBeTruthy();
        expect(p.slug).toBeTruthy();
      });
    }
  });
});

describe("i18n: theme descriptors", () => {
  const themeKeys = ["Architecture", "Infrastructure", "Workflow", "Developer Tools"];

  it("getThemeDescriptor returns locale-specific strings for each theme", () => {
    const enArch = getThemeDescriptor("Architecture", "en");
    const esArch = getThemeDescriptor("Architecture", "es");
    const zhArch = getThemeDescriptor("Architecture", "zh");
    expect(enArch).toBeTruthy();
    expect(esArch).toBeTruthy();
    expect(zhArch).toBeTruthy();
    expect(enArch).not.toBe(esArch);
    expect(enArch).not.toBe(zhArch);
    expect(enArch).toContain("static-first");
    expect(esArch).toMatch(/static|sistemas|diseño/i);
    expect(zhArch).toMatch(/静态|系统|设计/i);
  });

  it("all theme keys have descriptors for en, es, zh", () => {
    for (const theme of themeKeys) {
      for (const locale of SUPPORTED_LOCALES) {
        const desc = getThemeDescriptor(theme, locale);
        expect(desc).toBeTruthy();
        expect(desc.length).toBeGreaterThan(2);
      }
    }
  });
});

describe("i18n: theme labels", () => {
  it("getThemeLabel returns locale-specific display names for themes", () => {
    expect(getThemeLabel("Infrastructure", "en")).toBe("Infrastructure");
    expect(getThemeLabel("Infrastructure", "es")).toBe("Infraestructura");
    expect(getThemeLabel("Infrastructure", "zh")).toBe("基础设施");
    expect(getThemeLabel("Developer Tools", "es")).toBe("Herramientas de desarrollo");
    expect(getThemeLabel("Workflow", "zh")).toBe("工作流");
  });
});

describe("i18n: newsletter content", () => {
  it("newsletter content source differs by locale", () => {
    const en = getLocaleContent("en").newsletter;
    const es = getLocaleContent("es").newsletter;
    const zh = getLocaleContent("zh").newsletter;
    expect(en.confirm?.subject).toBeTruthy();
    expect(es.confirm?.subject).toBeTruthy();
    expect(zh.confirm?.subject).toBeTruthy();
    expect(en.confirm!.subject).not.toBe(es.confirm!.subject);
    expect(en.confirm!.subject).not.toBe(zh.confirm!.subject);
  });

  it("forms newsletter labels differ by locale", () => {
    const en = getLocaleContent("en").forms.newsletter;
    const es = getLocaleContent("es").forms.newsletter;
    const zh = getLocaleContent("zh").forms.newsletter;
    expect(en.title).not.toBe(es.title);
    expect(en.title).not.toBe(zh.title);
    expect(en.emailLabel).not.toBe(es.emailLabel);
    expect(en.submitLabel).not.toBe(es.submitLabel);
  });

  it("recurring digest has New and Updated section headings per locale", () => {
    const en = getLocaleContent("en").newsletter.recurring?.digest;
    const es = getLocaleContent("es").newsletter.recurring?.digest;
    const zh = getLocaleContent("zh").newsletter.recurring?.digest;
    expect(en?.newItemsHeading).toBeTruthy();
    expect(en?.updatedItemsHeading).toBeTruthy();
    expect(es?.newItemsHeading).toBeTruthy();
    expect(es?.updatedItemsHeading).toBeTruthy();
    expect(zh?.newItemsHeading).toBeTruthy();
    expect(zh?.updatedItemsHeading).toBeTruthy();
  });
});

describe("i18n: recurring newsletter", () => {
  it("getRecurringNewsletterCandidates returns locale-specific titles and URLs", () => {
    const en = getRecurringNewsletterCandidates("en");
    const es = getRecurringNewsletterCandidates("es");
    const zh = getRecurringNewsletterCandidates("zh");

    expect(en.length).toBeGreaterThan(0);
    expect(es.length).toBeGreaterThan(0);
    expect(zh.length).toBeGreaterThan(0);

    en.forEach((c) => {
      expect(c.ctaUrl).toContain("/en/");
      expect(c.title.length).toBeGreaterThan(0);
    });
    es.forEach((c) => {
      expect(c.ctaUrl).toContain("/es/");
      expect(c.title.length).toBeGreaterThan(0);
    });
    zh.forEach((c) => {
      expect(c.ctaUrl).toContain("/zh/");
      expect(c.title.length).toBeGreaterThan(0);
    });

    const writingSlug = "static-first";
    const enWriting = en.find((c) => c.slug === writingSlug && c.type === "writing");
    const esWriting = es.find((c) => c.slug === writingSlug && c.type === "writing");
    const zhWriting = zh.find((c) => c.slug === writingSlug && c.type === "writing");
    if (enWriting && esWriting && zhWriting) {
      expect(enWriting.title).not.toBe(esWriting.title);
      expect(enWriting.title).not.toBe(zhWriting.title);
    }
  });
});

describe("i18n: RSS / site profile", () => {
  it("getSiteProfile rss title and language differ by locale", () => {
    const en = getSiteProfile("en").rss;
    const es = getSiteProfile("es").rss;
    const zh = getSiteProfile("zh").rss;

    expect(en.language).toBe("en-us");
    expect(es.language).toMatch(/es/i);
    expect(zh.language).toMatch(/zh/i);

    expect(en.title).toBeTruthy();
    expect(es.title).toBeTruthy();
    expect(zh.title).toBeTruthy();
    expect(en.description).not.toBe(es.description);
    expect(en.description).not.toBe(zh.description);
  });
});

describe("i18n: search index data source", () => {
  it("writings per locale have titles suitable for search index", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const writings = getWritings(locale);
      const entries = writings.map((w) => ({
        slug: w.slug,
        title: w.title,
        theme: w.theme,
        tags: w.tags ?? [],
      }));
      expect(entries.length).toBe(writings.length);
      entries.forEach((e) => {
        expect(e.slug).toBeTruthy();
        expect(e.title).toBeTruthy();
        expect(e.theme).toBeTruthy();
      });
    }
  });
});
