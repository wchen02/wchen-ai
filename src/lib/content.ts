import fs from "fs";
import path from "path";
import {
  AboutContentSchema,
  FormsContentSchema,
  HomeContentSchema,
  NewsletterContentSourceSchema,
  SiteProfileSchema,
  SystemContentSchema,
  UiContentSchema,
  type AboutContent,
  type FormsContent,
  type HomeContent,
  type NewsletterContentSource,
  type SiteProfile,
  type SystemContent,
  type UiContent,
} from "./schemas";
import { SUPPORTED_LOCALES, resolveLocale, type SupportedLocale } from "./locales";

export interface LocaleContentBundle {
  profile: SiteProfile;
  home: HomeContent;
  about: AboutContent;
  newsletter: NewsletterContentSource;
  ui: UiContent;
  forms: FormsContent;
  system: SystemContent;
}

function readLocaleJson(locale: SupportedLocale, name: string): unknown {
  const filePath = path.join(process.cwd(), "content", "locales", locale, "site", `${name}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    throw new Error(`Failed to load locale file "${name}.json" for locale "${locale}": ${err}`);
  }
}

function buildBundle(locale: SupportedLocale): LocaleContentBundle {
  return {
    profile: SiteProfileSchema.parse(readLocaleJson(locale, "profile")),
    home: HomeContentSchema.parse(readLocaleJson(locale, "home")),
    about: AboutContentSchema.parse(readLocaleJson(locale, "about")),
    newsletter: NewsletterContentSourceSchema.parse(readLocaleJson(locale, "newsletter")),
    ui: UiContentSchema.parse(readLocaleJson(locale, "ui")),
    forms: FormsContentSchema.parse(readLocaleJson(locale, "forms")),
    system: SystemContentSchema.parse(readLocaleJson(locale, "system")),
  };
}

const localeContent = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale, buildBundle(locale)])
) as Record<SupportedLocale, LocaleContentBundle>;

export function getLocaleContent(locale?: string): LocaleContentBundle {
  return localeContent[resolveLocale(locale)];
}
