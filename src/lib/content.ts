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

// Webpack injects a CommonJS-compatible `require` into all bundle chunks (server and client).
// Declaring it here satisfies TypeScript's `module: esnext` type checker.
// eslint-disable-next-line no-var
declare var require: (id: string) => unknown;

// Dynamic require: webpack bundles all matching locale JSON files at build time via static
// analysis of the template literal pattern. At runtime the call is a synchronous lookup in
// webpack's bundled module registry — no filesystem access in the browser.
const readLocaleJson = (locale: string, name: string): unknown => {
  try {
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
