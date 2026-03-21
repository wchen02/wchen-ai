import aboutEn from "../../content/locales/en/site/about.json";
import formsEn from "../../content/locales/en/site/forms.json";
import homeEn from "../../content/locales/en/site/home.json";
import newsletterEn from "../../content/locales/en/site/newsletter.json";
import profileEn from "../../content/locales/en/site/profile.json";
import systemEn from "../../content/locales/en/site/system.json";
import uiEn from "../../content/locales/en/site/ui.json";
import aboutEs from "../../content/locales/es/site/about.json";
import formsEs from "../../content/locales/es/site/forms.json";
import homeEs from "../../content/locales/es/site/home.json";
import newsletterEs from "../../content/locales/es/site/newsletter.json";
import profileEs from "../../content/locales/es/site/profile.json";
import systemEs from "../../content/locales/es/site/system.json";
import uiEs from "../../content/locales/es/site/ui.json";
import aboutZh from "../../content/locales/zh/site/about.json";
import formsZh from "../../content/locales/zh/site/forms.json";
import homeZh from "../../content/locales/zh/site/home.json";
import newsletterZh from "../../content/locales/zh/site/newsletter.json";
import profileZh from "../../content/locales/zh/site/profile.json";
import systemZh from "../../content/locales/zh/site/system.json";
import uiZh from "../../content/locales/zh/site/ui.json";
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

type LocaleSourceRow = Record<keyof LocaleContentBundle, unknown>;

/** Static imports only — required for Cloudflare Pages Functions (esbuild), unlike webpack `require` globs. */
const localeContentSources: Record<string, LocaleSourceRow> = {
  en: {
    profile: profileEn,
    home: homeEn,
    about: aboutEn,
    newsletter: newsletterEn,
    ui: uiEn,
    forms: formsEn,
    system: systemEn,
  },
  es: {
    profile: profileEs,
    home: homeEs,
    about: aboutEs,
    newsletter: newsletterEs,
    ui: uiEs,
    forms: formsEs,
    system: systemEs,
  },
  zh: {
    profile: profileZh,
    home: homeZh,
    about: aboutZh,
    newsletter: newsletterZh,
    ui: uiZh,
    forms: formsZh,
    system: systemZh,
  },
};

function parseBundle(row: LocaleSourceRow): LocaleContentBundle {
  return {
    profile: SiteProfileSchema.parse(row.profile),
    home: HomeContentSchema.parse(row.home),
    about: AboutContentSchema.parse(row.about),
    newsletter: NewsletterContentSourceSchema.parse(row.newsletter),
    ui: UiContentSchema.parse(row.ui),
    forms: FormsContentSchema.parse(row.forms),
    system: SystemContentSchema.parse(row.system),
  };
}

const localeContent = Object.fromEntries(
  SUPPORTED_LOCALES.map((code) => {
    const row = localeContentSources[code];
    if (!row) {
      throw new Error(
        `Locale "${code}" is listed in locale-config.json but has no static imports in content.ts (add JSON imports and a "${code}" entry to localeContentSources).`
      );
    }
    return [code, parseBundle(row)] as const;
  })
) as Record<SupportedLocale, LocaleContentBundle>;

export function getLocaleContent(locale?: string): LocaleContentBundle {
  return localeContent[resolveLocale(locale)];
}
