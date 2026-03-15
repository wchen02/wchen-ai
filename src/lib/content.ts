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
import { resolveLocale, type SupportedLocale } from "./locales";

export interface LocaleContentBundle {
  profile: SiteProfile;
  home: HomeContent;
  about: AboutContent;
  newsletter: NewsletterContentSource;
  ui: UiContent;
  forms: FormsContent;
  system: SystemContent;
}

function buildBundle(sources: Record<keyof LocaleContentBundle, unknown>): LocaleContentBundle {
  return {
    profile: SiteProfileSchema.parse(sources.profile),
    home: HomeContentSchema.parse(sources.home),
    about: AboutContentSchema.parse(sources.about),
    newsletter: NewsletterContentSourceSchema.parse(sources.newsletter),
    ui: UiContentSchema.parse(sources.ui),
    forms: FormsContentSchema.parse(sources.forms),
    system: SystemContentSchema.parse(sources.system),
  };
}

const localeContent: Record<SupportedLocale, LocaleContentBundle> = {
  en: buildBundle({ profile: profileEn, home: homeEn, about: aboutEn, newsletter: newsletterEn, ui: uiEn, forms: formsEn, system: systemEn }),
  es: buildBundle({ profile: profileEs, home: homeEs, about: aboutEs, newsletter: newsletterEs, ui: uiEs, forms: formsEs, system: systemEs }),
  zh: buildBundle({ profile: profileZh, home: homeZh, about: aboutZh, newsletter: newsletterZh, ui: uiZh, forms: formsZh, system: systemZh }),
};

export function getLocaleContent(locale?: string): LocaleContentBundle {
  return localeContent[resolveLocale(locale)];
}
