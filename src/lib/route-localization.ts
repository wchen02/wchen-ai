import { localizePath } from "./i18n";
import { getMetadataDefaults } from "./metadata-defaults";
import { SUPPORTED_LOCALES, resolveLocale, type SupportedLocale } from "./locales";

export function getLocalizedPath(locale: string, pathname: string): string {
  return localizePath(resolveLocale(locale), pathname);
}

export function getCanonicalUrl(locale: string, pathname: string): string {
  const resolvedLocale = resolveLocale(locale);
  return `${getMetadataDefaults(resolvedLocale).canonicalBaseUrl}${localizePath(resolvedLocale, pathname)}`;
}

export function getLanguageAlternates(pathname: string): Record<SupportedLocale, string> {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, getCanonicalUrl(locale, pathname)])
  ) as Record<SupportedLocale, string>;
}
