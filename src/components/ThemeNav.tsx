"use client";

import { useCurrentLocale } from "@/components/LocaleProvider";
import { getUiContent } from "@/lib/site-content";
import { getThemeLabel } from "@/lib/theme-config";

const COMPACT_THEME_THRESHOLD = 10;

function themeToId(theme: string): string {
  return `theme-${theme.toLowerCase().replace(/\s+/g, "-")}`;
}

export default function ThemeNav({
  themes,
  locale,
}: {
  themes: string[];
  locale: string;
}) {
  const resolvedLocale = useCurrentLocale() ?? locale;
  const uiContent = getUiContent(resolvedLocale);
  const useCompact = themes.length > COMPACT_THEME_THRESHOLD;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      const el = document.getElementById(value);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (typeof window !== "undefined") window.location.hash = value;
    }
  };

  if (themes.length <= 1) return null;

  if (useCompact) {
    return (
      <nav
        id="theme-nav"
        className="space-y-2"
        aria-label={uiContent.writing.themeNavAriaLabel}
      >
        <label htmlFor="theme-select" className="sr-only">
          {uiContent.writing.filterByThemeLabel}
        </label>
        <select
          id="theme-select"
          defaultValue=""
          onChange={handleSelectChange}
          className="block w-full max-w-xs px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label={uiContent.writing.themeNavAriaLabel}
        >
          <option value="" disabled>
            {uiContent.writing.allThemesLabel}
          </option>
          {themes.map((theme) => (
            <option key={theme} value={themeToId(theme)}>
              {getThemeLabel(theme, resolvedLocale)}
            </option>
          ))}
        </select>
      </nav>
    );
  }

  return (
    <nav
      id="theme-nav"
      className="flex flex-wrap gap-2"
      aria-label={uiContent.writing.themeNavAriaLabel}
    >
      {themes.map((theme) => (
        <a
          key={theme}
          href={`#${themeToId(theme)}`}
          className="px-3 py-1 text-sm font-medium rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
        >
          {getThemeLabel(theme, resolvedLocale)}
        </a>
      ))}
    </nav>
  );
}
