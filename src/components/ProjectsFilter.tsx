"use client";

import { useState, useMemo } from "react";
import { useCurrentLocale } from "@/components/LocaleProvider";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/schemas";
import { getUiContent } from "@/lib/site-content";

type StatusFilter = "all" | Project["status"];

export default function ProjectsFilter({ projects }: { projects: Project[] }) {
  const locale = useCurrentLocale();
  const uiContent = getUiContent(locale);
  const statusLabels: Record<StatusFilter, string> = {
    all: uiContent.projects.statusLabels.all,
    active: uiContent.projects.statusLabels.active,
    archived: uiContent.projects.statusLabels.archived,
    "in-progress": uiContent.projects.statusLabels.inProgress,
  };
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const showFilter = projects.length > 1;
  const hasResults = filtered.length > 0;

  return (
    <div className="space-y-6">
      {showFilter && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{uiContent.projects.filterByStatusLabel}</span>
          {(["all", "active", "archived", "in-progress"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              aria-pressed={statusFilter === value}
              className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                statusFilter === value
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                  : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700"
              }`}
            >
              {statusLabels[value]}
            </button>
          ))}
        </div>
      )}

      {hasResults ? (
        <div className="grid gap-8">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {projects.length === 0 ? uiContent.projects.emptyState : uiContent.projects.filteredEmptyState}
          </p>
          {showFilter && statusFilter !== "all" && (
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
            >
              {uiContent.projects.clearFilterLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
