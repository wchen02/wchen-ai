import { getUiContent } from "./site-content";

/**
 * Short descriptors for writing themes. Keys must match the `theme` field in writing frontmatter.
 */
export const THEME_DESCRIPTORS = getUiContent().themeDescriptors;

export function getThemeDescriptor(theme: string, locale?: string): string {
  const descriptors = locale ? getUiContent(locale).themeDescriptors : THEME_DESCRIPTORS;
  return descriptors[theme] ?? theme;
}
