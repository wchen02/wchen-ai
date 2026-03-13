"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentLocale } from "@/components/LocaleProvider";
import { getUiContent } from "@/lib/site-content";
import { LOCALE_INFO, SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/locales";
import { persistLocalePreference, replacePathLocale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const locale = useCurrentLocale();
  const pathname = usePathname() ?? `/${locale}`;
  const router = useRouter();
  const uiContent = getUiContent(locale);

  const options = useMemo(
    () =>
      SUPPORTED_LOCALES.map((supportedLocale) => ({
        value: supportedLocale,
        label: LOCALE_INFO[supportedLocale].nativeLabel,
      })),
    []
  );

  if (SUPPORTED_LOCALES.length <= 1) {
    return null;
  }

  return (
    <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <span className="sr-only">{uiContent.languageSwitcher.label}</span>
      <select
        aria-label={uiContent.languageSwitcher.ariaLabel}
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as SupportedLocale;
          persistLocalePreference(nextLocale);
          router.push(replacePathLocale(pathname, nextLocale));
        }}
        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-gray-800 dark:bg-neutral-900 dark:text-gray-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
