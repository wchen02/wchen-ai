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

// Dynamic require: webpack/turbopack bundles all matching locale JSON files at build time.
// This avoids hardcoding locale names while remaining compatible with client bundles.
const readLocaleJson = (locale: string, name: string): unknown => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`../../content/locales/${locale}/site/${name}.json`);
  } catch (err) {
    throw new Error(`Failed to load locale file "${name}.json" for locale "${locale}": ${err}`);
  }
};

function buildBundle(locale: string): LocaleContentBundle {
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
