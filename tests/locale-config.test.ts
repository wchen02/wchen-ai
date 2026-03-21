import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import localeConfig from "../content/locales/locale-config.json";
import {
  DEFAULT_LOCALE,
  LOCALE_INFO,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  resolveLocale,
} from "../src/lib/locales";
import { getLocaleContent } from "../src/lib/content";

const LOCALE_SITE_FILES = [
  "about.json",
  "forms.json",
  "home.json",
  "newsletter.json",
  "profile.json",
  "system.json",
  "ui.json",
];

describe("locale-config.json structure", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(localeConfig)).toBe(true);
    expect(localeConfig.length).toBeGreaterThan(0);
  });

  it("every entry has code, label, and nativeLabel", () => {
    for (const entry of localeConfig) {
      expect(typeof entry.code).toBe("string");
      expect(entry.code.length).toBeGreaterThan(0);
      expect(typeof entry.label).toBe("string");
      expect(entry.label.length).toBeGreaterThan(0);
      expect(typeof entry.nativeLabel).toBe("string");
      expect(entry.nativeLabel.length).toBeGreaterThan(0);
    }
  });

  it("has exactly one default locale (isDefault: true)", () => {
    const defaults = localeConfig.filter((l) => l.isDefault === true);
    expect(defaults).toHaveLength(1);
  });

  it("all locale codes are unique", () => {
    const codes = localeConfig.map((l) => l.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});

describe("SUPPORTED_LOCALES derived from locale-config.json", () => {
  it("matches the codes in locale-config.json — no hardcoding", () => {
    const configCodes = localeConfig.map((l) => l.code);
    expect([...SUPPORTED_LOCALES]).toEqual(configCodes);
  });

  it("has the same length as locale-config.json", () => {
    expect(SUPPORTED_LOCALES.length).toBe(localeConfig.length);
  });
});

describe("DEFAULT_LOCALE derived from locale-config.json", () => {
  it("matches the code of the entry with isDefault: true", () => {
    const expected = localeConfig.find((l) => l.isDefault)?.code;
    expect(DEFAULT_LOCALE).toBe(expected);
  });

  it("is included in SUPPORTED_LOCALES", () => {
    expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
  });
});

describe("LOCALE_INFO derived from locale-config.json", () => {
  it("has an entry for every locale code in locale-config.json", () => {
    for (const entry of localeConfig) {
      expect(LOCALE_INFO[entry.code]).toBeDefined();
    }
  });

  it("each entry has label and nativeLabel matching locale-config.json", () => {
    for (const entry of localeConfig) {
      expect(LOCALE_INFO[entry.code]?.label).toBe(entry.label);
      expect(LOCALE_INFO[entry.code]?.nativeLabel).toBe(entry.nativeLabel);
    }
  });

  it("has no extra entries beyond locale-config.json codes", () => {
    const infoKeys = Object.keys(LOCALE_INFO).sort();
    const configCodes = localeConfig.map((l) => l.code).sort();
    expect(infoKeys).toEqual(configCodes);
  });
});

describe("isSupportedLocale and resolveLocale with dynamic config", () => {
  it("isSupportedLocale returns true for every locale in locale-config.json", () => {
    for (const entry of localeConfig) {
      expect(isSupportedLocale(entry.code)).toBe(true);
    }
  });

  it("isSupportedLocale returns false for clearly unsupported locales", () => {
    expect(isSupportedLocale("")).toBe(false);
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale("de")).toBe(false);
  });

  it("resolveLocale returns DEFAULT_LOCALE for empty/null/unknown input", () => {
    expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("fr-FR")).toBe(DEFAULT_LOCALE);
  });

  it("resolveLocale maps each supported locale code to itself", () => {
    for (const entry of localeConfig) {
      expect(resolveLocale(entry.code)).toBe(entry.code);
    }
  });
});

describe("content file presence for all locales in SUPPORTED_LOCALES", () => {
  for (const locale of SUPPORTED_LOCALES) {
    it(`locale "${locale}" has all required site JSON files`, () => {
      const dir = path.resolve(__dirname, `../content/locales/${locale}/site`);
      expect(fs.existsSync(dir), `directory ${dir} must exist`).toBe(true);
      for (const file of LOCALE_SITE_FILES) {
        const filePath = path.join(dir, file);
        expect(fs.existsSync(filePath), `${locale}/site/${file} must exist`).toBe(true);
      }
    });
  }
});

describe("getLocaleContent loads all locales dynamically", () => {
  it("returns content for every locale in SUPPORTED_LOCALES without error", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(() => getLocaleContent(locale)).not.toThrow();
    }
  });

  it("each locale bundle has all required sections", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const bundle = getLocaleContent(locale);
      expect(bundle.profile).toBeDefined();
      expect(bundle.home).toBeDefined();
      expect(bundle.about).toBeDefined();
      expect(bundle.newsletter).toBeDefined();
      expect(bundle.ui).toBeDefined();
      expect(bundle.forms).toBeDefined();
      expect(bundle.system).toBeDefined();
    }
  });

  it("profile.languageTag matches the locale code for each locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const { profile } = getLocaleContent(locale);
      expect(profile.languageTag).toBe(locale);
    }
  });

  it("ui.languageSwitcher.label is non-empty for each locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const { ui } = getLocaleContent(locale);
      expect(ui.languageSwitcher.label.length).toBeGreaterThan(0);
    }
  });

  it("home.hero.aboutLink.label is non-empty for each locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const { home } = getLocaleContent(locale);
      expect(home.hero.aboutLink.label.length).toBeGreaterThan(0);
    }
  });

  it("locale bundles are distinct (languageTag differs across locales)", () => {
    if (SUPPORTED_LOCALES.length < 2) return;
    const tags = SUPPORTED_LOCALES.map((locale) => getLocaleContent(locale).profile.languageTag);
    const uniqueTags = new Set(tags);
    expect(uniqueTags.size).toBe(SUPPORTED_LOCALES.length);
  });

  it("resolves unsupported locale code to default locale content", () => {
    const defaultBundle = getLocaleContent(DEFAULT_LOCALE);
    // "fr" is not in locale-config.json; resolveLocale("fr") → DEFAULT_LOCALE
    const unknownBundle = getLocaleContent("fr");
    expect(unknownBundle.profile.languageTag).toBe(defaultBundle.profile.languageTag);
  });
});

describe("locale-config.json is the source of truth (no TS hardcoding)", () => {
  it("locales.ts does not contain a hardcoded locale array literal", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "../src/lib/locales.ts"), "utf8");
    expect(source).not.toMatch(/\[\s*["']en["'],\s*["']es["'],\s*["']zh["']\s*\]/);
    expect(source).not.toMatch(/DEFAULT_LOCALE\s*=\s*["']en["']/);
  });

  it("locales.ts imports from locale-config.json", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "../src/lib/locales.ts"), "utf8");
    expect(source).toContain("locale-config.json");
  });

  it("content.ts has static JSON imports for every locale in locale-config (Pages Functions / esbuild)", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "../src/lib/content.ts"), "utf8");
    for (const { code } of localeConfig) {
      for (const file of LOCALE_SITE_FILES) {
        expect(source, `expected static import path locales/${code}/site/${file}`).toContain(
          `locales/${code}/site/${file}`
        );
      }
    }
  });
});

