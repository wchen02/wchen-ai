"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useCurrentLocale } from "@/components/LocaleProvider";
import { resolveContentTokens } from "@/lib/formatting";
import { localizePath } from "@/lib/i18n";
import { getUiContent } from "@/lib/site-content";

interface SearchEntry {
  slug: string;
  title: string;
  theme: string;
  tags: string[];
}

interface SearchIndex {
  writings: SearchEntry[];
  themes: string[];
}

function matchQuery(entry: SearchEntry, q: string): boolean {
  const lower = q.toLowerCase().trim();
  if (!lower) return true;
  if (entry.title.toLowerCase().includes(lower)) return true;
  if (entry.theme.toLowerCase().includes(lower)) return true;
  if (entry.tags.some((t) => t.toLowerCase().includes(lower))) return true;
  return false;
}

export default function SearchWriting() {
  const locale = useCurrentLocale();
  const uiContent = getUiContent(locale);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/locales/${locale}/search-index.json`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("No index"))))
      .then((data: SearchIndex) => setIndex(data))
      .catch(() => setIndex({ writings: [], themes: [] }))
      .finally(() => setLoading(false));
  }, [locale]);

  const results = useMemo(() => {
    if (!index || !query.trim()) return null;
    const filtered = index.writings.filter((e) => matchQuery(e, query));
    return filtered;
  }, [index, query]);

  if (loading || !index) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <label htmlFor="writing-search" className="sr-only">
          {uiContent.searchWriting.label}
        </label>
        <input
          id="writing-search"
          type="search"
          placeholder={uiContent.searchWriting.loadingPlaceholder}
          disabled
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 text-sm"
        />
      </div>
    );
  }

  const showResults = query.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <label htmlFor="writing-search" className="sr-only">
          {uiContent.searchWriting.label}
        </label>
        <input
          id="writing-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={uiContent.searchWriting.placeholder}
          aria-describedby={showResults ? "search-results-desc" : undefined}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-sm"
        />
      </div>

      {showResults && results !== null && (
        <div id="search-results-desc" className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-neutral-900/50" role="region" aria-live="polite">
          {results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={localizePath(locale, `/writing/${entry.slug}`)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    {entry.title}
                  </Link>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">{entry.theme}</span>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400">
                {resolveContentTokens(uiContent.searchWriting.noResults, { query: query.trim() })}
              </p>
              <p className="text-sm mt-2">
                <a href="#theme-nav" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  {uiContent.searchWriting.browseByThemeLabel}
                </a>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
