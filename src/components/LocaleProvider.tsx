"use client";

import { createContext, useContext } from "react";
import type { SupportedLocale } from "@/lib/locales";

const LocaleContext = createContext<SupportedLocale | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: SupportedLocale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useOptionalLocale(): SupportedLocale | null {
  return useContext(LocaleContext);
}

export function useCurrentLocale(): SupportedLocale {
  const locale = useOptionalLocale();
  if (!locale) {
    throw new Error("useCurrentLocale must be used within a LocaleProvider.");
  }
  return locale;
}
