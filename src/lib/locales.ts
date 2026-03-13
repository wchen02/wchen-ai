export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = [DEFAULT_LOCALE, "es", "zh"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_COOKIE_NAME = "preferred_locale";

export const LOCALE_INFO: Record<
  SupportedLocale,
  {
    label: string;
    nativeLabel: string;
  }
> = {
  en: {
    label: "English",
    nativeLabel: "English",
  },
  es: {
    label: "Spanish",
    nativeLabel: "Espanol",
  },
  zh: {
    label: "Chinese",
    nativeLabel: "中文",
  },
};

export function normalizeLocale(locale?: string | null): string {
  return (locale ?? "").trim().toLowerCase().replace(/_/g, "-");
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function resolveLocale(locale?: string | null): SupportedLocale {
  const normalized = normalizeLocale(locale);
  if (!normalized) return DEFAULT_LOCALE;

  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  const partialMatch = SUPPORTED_LOCALES.find((supportedLocale) =>
    normalized.startsWith(`${supportedLocale}-`)
  );

  return partialMatch ?? DEFAULT_LOCALE;
}

function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map((part) => {
      const [locale, qValue] = part.trim().split(";q=");
      return {
        locale,
        weight: qValue ? Number.parseFloat(qValue) : 1,
      };
    })
    .filter((entry) => entry.locale)
    .sort((a, b) => b.weight - a.weight)
    .map((entry) => entry.locale);
}

export function getPreferredLocale(candidates: readonly string[] = []): SupportedLocale {
  for (const candidate of candidates) {
    const resolved = resolveLocale(candidate);
    const normalized = normalizeLocale(candidate);
    if (normalized && resolved !== DEFAULT_LOCALE) {
      return resolved;
    }
    if (normalized && isSupportedLocale(normalized)) {
      return normalized;
    }
  }

  return DEFAULT_LOCALE;
}

export function getPreferredLocaleFromAcceptLanguage(
  acceptLanguageHeader?: string | null
): SupportedLocale {
  if (!acceptLanguageHeader) {
    return DEFAULT_LOCALE;
  }

  return getPreferredLocale(parseAcceptLanguage(acceptLanguageHeader));
}
