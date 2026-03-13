"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  DEFAULT_LOCALE,
  getPreferredLocaleForBrowser,
  localizePath,
  persistLocalePreference,
} from "@/lib/i18n";
import type { SupportedLocale } from "@/lib/locales";

export default function LocaleRedirectPage({
  targetPath,
  title = "Redirecting...",
  message = "Redirecting to your preferred language...",
}: {
  targetPath: string;
  title?: string;
  message?: string;
}) {
  const fallbackHref = useMemo(
    () => localizePath(DEFAULT_LOCALE as SupportedLocale, targetPath),
    [targetPath]
  );

  useEffect(() => {
    const preferredLocale = getPreferredLocaleForBrowser();
    persistLocalePreference(preferredLocale);
    const destination = `${localizePath(preferredLocale, targetPath)}${window.location.search}${window.location.hash}`;
    window.location.replace(destination);
  }, [targetPath]);

  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        {title}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        {message}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        <Link href={fallbackHref} className="text-emerald-600 dark:text-emerald-400 hover:underline">
          Continue to the default language
        </Link>
      </p>
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${fallbackHref}`} />
      </noscript>
    </main>
  );
}
