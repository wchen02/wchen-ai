"use client";

import { useCurrentLocale } from "@/components/LocaleProvider";
import { getUiContent } from "@/lib/site-content";

type Section = "writing" | "projects";

export default function BackToTop({ section = "writing" }: { section?: Section }) {
  const locale = useCurrentLocale();
  const uiContent = getUiContent(locale);
  const { backToTopLabel, backToTopAriaLabel } = uiContent[section];

  return (
    <p className="text-center">
      <a
        href="#page-top"
        className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
        aria-label={backToTopAriaLabel}
      >
        {backToTopLabel}
      </a>
    </p>
  );
}
