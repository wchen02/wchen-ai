import { getSiteProfile } from "./site-config";

type DateInput = string | number | Date;

export function resolveContentTokens(
  value: string,
  tokens: Record<string, string | number>
): string {
  return value.replace(/\{([a-zA-Z0-9]+)\}/g, (_match, key) => String(tokens[key] ?? `{${key}}`));
}

export function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions,
  locale?: string
): string {
  return new Date(value).toLocaleDateString(getSiteProfile(locale).locale, options);
}
