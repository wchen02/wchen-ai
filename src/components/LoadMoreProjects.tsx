"use client";

import { useState, useCallback } from "react";
import { useCurrentLocale } from "@/components/LocaleProvider";
import ProjectCard from "@/components/ProjectCard";
import { getUiContent } from "@/lib/site-content";
import { resolveContentTokens } from "@/lib/formatting";
import type { Project, ProjectType } from "@/lib/schemas";

const INITIAL_COUNT = 20;
const PAGE_SIZE = 20;

export interface ProjectPayload {
  slug: string;
  title: string;
  date: string;
  type: ProjectType[];
  motivation: string;
  problemAddressed: string;
  featured: boolean;
}

function toProject(p: ProjectPayload): Project {
  return {
    ...p,
    content: "",
  };
}

export default function LoadMoreProjects({
  totalCount,
  locale,
}: {
  totalCount: number;
  locale: string;
}) {
  const resolvedLocale = useCurrentLocale() ?? locale;
  const uiContent = getUiContent(resolvedLocale);
  const [fullList, setFullList] = useState<Project[] | null>(null);
  const [displayedCount, setDisplayedCount] = useState(INITIAL_COUNT);
  const [loading, setLoading] = useState(false);

  const hasMore = displayedCount < totalCount;
  const showingEnd = Math.min(displayedCount, totalCount);

  const loadMore = useCallback(async () => {
    if (fullList === null) {
      setLoading(true);
      try {
        const res = await fetch(`/locales/${resolvedLocale}/projects.json`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data: ProjectPayload[] = await res.json();
        setFullList(data.map(toProject));
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
      aria-label={uiContent.projects.loadMoreAriaLabel}
    >
      {toShow.length > 0 && (
        <div className="grid gap-8">
          {toShow.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={resolvedLocale}
            />
          ))}
        </div>
      )}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {resolveContentTokens(uiContent.projects.showingCountTemplate, {
            end: String(showingEnd),
            total: String(totalCount),
          })}
        </p>
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-full border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50"
          aria-label={uiContent.projects.loadMoreAriaLabel}
        >
          {loading ? "…" : uiContent.projects.loadMoreLabel}
        </button>
      </div>
    </section>
  );
}
