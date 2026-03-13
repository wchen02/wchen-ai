import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  getPreferredLocale,
  getPreferredLocaleFromAcceptLanguage,
  isSupportedLocale,
  resolveLocale,
} from "./locales";

function getBrowserDocument():
  | {
      cookie: string;
    }
  | undefined {
  return (globalThis as { document?: { cookie: string } }).document;
}

function getBrowserNavigator():
  | {
      languages?: readonly string[];
    }
  | undefined {
  return (globalThis as { navigator?: { languages?: readonly string[] } }).navigator;
}

function splitPath(pathname: string): {
  path: string;
  search: string;
  hash: string;
} {
  const hashIndex = pathname.indexOf("#");
  const hash = hashIndex >= 0 ? pathname.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? pathname.slice(0, hashIndex) : pathname;
  const searchIndex = withoutHash.indexOf("?");
  const search = searchIndex >= 0 ? withoutHash.slice(searchIndex) : "";
  const path = searchIndex >= 0 ? withoutHash.slice(0, searchIndex) : withoutHash;

  return {
    path: path || "/",
    search,
    hash,
  };
}

export function getLocaleFromPathname(pathname: string): SupportedLocale | null {
  const { path } = splitPath(pathname);
  const [, firstSegment] = path.split("/");
  return firstSegment && isSupportedLocale(firstSegment) ? firstSegment : null;
}

export function hasLocalePrefix(pathname: string): boolean {
  return getLocaleFromPathname(pathname) !== null;
}

export function stripLocalePrefix(pathname: string): string {
  const { path, search, hash } = splitPath(pathname);
  const locale = getLocaleFromPathname(path);
  if (!locale) {
    return `${path}${search}${hash}`;
  }

  const stripped = path.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
  return `${stripped}${search}${hash}`;
}

export function isLocalizablePath(pathname: string): boolean {
  const { path } = splitPath(pathname);

  if (!path.startsWith("/")) return false;
  if (path === "/") return true;
  if (path.startsWith("/api")) return false;
  if (path.startsWith("/_next")) return false;
  if (/\.[a-z0-9]+$/i.test(path)) return false;

  return true;
}

export function localizePath(locale: SupportedLocale, pathname: string): string {
  if (!pathname.startsWith("/") || !isLocalizablePath(pathname)) {
    return pathname;
  }

  const stripped = stripLocalePrefix(pathname);
  const { path, search, hash } = splitPath(stripped);
  const normalizedPath = path === "/" ? "" : path;
  return `/${locale}${normalizedPath}${search}${hash}`;
}

export function replacePathLocale(pathname: string, locale: SupportedLocale): string {
  if (!pathname.startsWith("/") || !isLocalizablePath(pathname)) {
    return pathname;
  }

  return localizePath(locale, pathname);
}

export function getLocaleCookieValue(cookieHeader?: string | null): SupportedLocale | null {
  if (!cookieHeader) return null;

  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE_NAME}=`));

  if (!entry) return null;

  const value = decodeURIComponent(entry.slice(LOCALE_COOKIE_NAME.length + 1));
  const locale = resolveLocale(value);
  return isSupportedLocale(locale) ? locale : null;
}

export function getPreferredLocaleForRequest(params: {
  cookieHeader?: string | null;
  acceptLanguageHeader?: string | null;
}): SupportedLocale {
  const persistedLocale = getLocaleCookieValue(params.cookieHeader);
  if (persistedLocale) {
    return persistedLocale;
  }

  return getPreferredLocaleFromAcceptLanguage(params.acceptLanguageHeader);
}

export function getPreferredLocaleForBrowser(): SupportedLocale {
  const browserDocument = getBrowserDocument();
  if (browserDocument) {
    const persistedLocale = getLocaleCookieValue(browserDocument.cookie);
    if (persistedLocale) {
      return persistedLocale;
    }
  }

  const browserNavigator = getBrowserNavigator();
  if (browserNavigator) {
    return getPreferredLocale(browserNavigator.languages ?? []);
  }

  return DEFAULT_LOCALE;
}

export function persistLocalePreference(locale: SupportedLocale): void {
  const browserDocument = getBrowserDocument();
  if (!browserDocument) return;
  browserDocument.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function shouldRedirectBarePath(pathname: string): boolean {
  return isLocalizablePath(pathname) && !hasLocalePrefix(pathname);
}

export { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, SUPPORTED_LOCALES };
