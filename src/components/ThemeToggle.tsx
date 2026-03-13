"use client";

import { useEffect, useState } from "react";
import { useCurrentLocale } from "@/components/LocaleProvider";
import { resolveContentTokens } from "@/lib/formatting";
import { getUiContent } from "@/lib/site-content";

type Theme = "system" | "light" | "dark";

function getEffectiveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function capitalize(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const locale = useCurrentLocale();
  const uiContent = getUiContent(locale);
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    queueMicrotask(() => {
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      }
      setMounted(true);
    });
  }, []);

  function cycleTheme() {
    const next: "light" | "dark" = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label={uiContent.themeToggle.staticLabel}
        className={`flex items-center gap-3 text-gray-500 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded ${
          showLabel ? "min-h-[2.75rem] py-2 pr-2 w-full text-left" : "w-8 h-8 justify-center"
        }`}
      >
        <span className="w-[18px] h-[18px] shrink-0" />
      </button>
    );
  }

  const effective = getEffectiveTheme(theme);
  const isDark = effective === "dark";

  const modeLabel = isDark
    ? capitalize(uiContent.themeToggle.darkModeLabel) + " mode"
    : capitalize(uiContent.themeToggle.lightModeLabel) + " mode";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={resolveContentTokens(uiContent.themeToggle.announcement, {
        currentMode: isDark
          ? uiContent.themeToggle.darkModeLabel
          : uiContent.themeToggle.lightModeLabel,
        nextMode: isDark
          ? uiContent.themeToggle.lightModeLabel
          : uiContent.themeToggle.darkModeLabel,
      })}
      aria-pressed={isDark}
      className={`flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded ${
        showLabel ? "min-h-[2.75rem] py-2 pr-2 w-full text-left" : "w-8 h-8 justify-center"
      }`}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      {showLabel && <span className="text-lg">{modeLabel}</span>}
    </button>
  );
}
