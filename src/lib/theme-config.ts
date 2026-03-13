import { getUiContent } from "./site-content";

/**
 * Short descriptors for writing themes. Keys must match the `theme` field in writing frontmatter.
 */
export const THEME_DESCRIPTORS = getUiContent().themeDescriptors;

export function getThemeDescriptor(theme: string, locale?: string): string {
  const descriptors = locale ? getUiContent(locale).themeDescriptors : THEME_DESCRIPTORS;
  return descriptors[theme] ?? theme;
}

/**
 * Localized display label for a writing theme (e.g. "Infrastructure" → "Infraestructura" for es).
 * Keys must match the `theme` field in writing frontmatter.
 */
export function getThemeLabel(theme: string, locale?: string): string {
  const labels = locale ? getUiContent(locale).themeLabels : getUiContent().themeLabels;
  return labels[theme] ?? theme;
}
