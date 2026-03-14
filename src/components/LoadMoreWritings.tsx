"use client";

import { useState, useCallback } from "react";
import { useCurrentLocale } from "@/components/LocaleProvider";
import WritingCard from "@/components/WritingCard";
import { getUiContent } from "@/lib/site-content";
import { resolveContentTokens } from "@/lib/formatting";
import type { Writing } from "@/lib/schemas";

const INITIAL_COUNT = 20;
const PAGE_SIZE = 20;

export interface WritingPayload {
  slug: string;
  title: string;
  theme: string;
  tags: string[];
  publishDate: string;
  updatedAt: string | null;
  readingTimeMinutes: number;
  excerpt: string;
  featured: boolean;
}

function toWriting(p: WritingPayload): Writing {
  return {
    ...p,
    updatedAt: p.updatedAt ?? undefined,
    content: "",
    draft: false,
  };
}

export default function LoadMoreWritings({
  totalCount,
  locale,
}: {
  totalCount: number;
  locale: string;
}) {
  const resolvedLocale = useCurrentLocale() ?? locale;
  const uiContent = getUiContent(resolvedLocale);
  const [fullList, setFullList] = useState<Writing[] | null>(null);
  const [displayedCount, setDisplayedCount] = useState(INITIAL_COUNT);
  const [loading, setLoading] = useState(false);

  const hasMore = displayedCount < totalCount;
  const showingEnd = Math.min(displayedCount, totalCount);

  const loadMore = useCallback(async () => {
    if (fullList === null) {
      setLoading(true);
      try {
        const res = await fetch(`/locales/${resolvedLocale}/writings.json`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data: WritingPayload[] = await res.json();
        setFullList(data.map(toWriting));
        setDisplayedCount(INITIAL_COUNT + PAGE_SIZE);
      } catch {
        setLoading(false);
        return;
      }
      setLoading(false);
    } else {
      setDisplayedCount((c) => Math.min(c + PAGE_SIZE, totalCount));
    }
  }, [fullList, resolvedLocale, totalCount]);

  if (!hasMore) return null;

  const toShow = fullList ? fullList.slice(INITIAL_COUNT, displayedCount) : [];

  return (
    <section
      className="space-y-6"
      aria-label={uiContent.writing.loadMoreAriaLabel}
    >
      {toShow.length > 0 && (
        <div className="flex flex-col gap-2 -mx-5">
          {toShow.map((writing) => (
            <WritingCard
              key={writing.slug}
              writing={writing}
              locale={resolvedLocale}
            />
          ))}
        </div>
      )}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {resolveContentTokens(uiContent.writing.showingCountTemplate, {
            end: String(showingEnd),
            total: String(totalCount),
          })}
        </p>
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-full border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50"
          aria-label={uiContent.writing.loadMoreAriaLabel}
        >
          {loading ? "…" : uiContent.writing.loadMoreLabel}
        </button>
      </div>
    </section>
  );
}
