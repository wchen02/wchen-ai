"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { useCurrentLocale } from "@/components/LocaleProvider";
import type { GitHubContributions } from "@/lib/schemas";
import { resolveContentTokens } from "@/lib/formatting";
import { getUiContent } from "@/lib/site-content";

const STAGGER_DELAY = 0.012;
const MAX_STAGGER = 0.4;

interface GitHubGraphClientProps {
  data: GitHubContributions | null;
}

export default function GitHubGraphClient({ data }: GitHubGraphClientProps) {
  const locale = useCurrentLocale();
  const uiContent = getUiContent(locale);
  const prefersReducedMotion = useReducedMotion();

  if (!data || !data.weeks) {
    return <div className="text-sm text-gray-500">{uiContent.github.noDataLabel}</div>;
  }

  const allDays = data.weeks.flatMap((w) => w.contributionDays);
  const recentDays = allDays.slice(-100);

  if (prefersReducedMotion) {
    return (
      <div
        className="flex flex-col gap-2"
        role="img"
          aria-label={resolveContentTokens(uiContent.github.ariaLabel, {
            totalContributions: data.totalContributions,
          })}
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">
            {resolveContentTokens(uiContent.github.summary, {
              totalContributions: data.totalContributions,
            })}
        </div>
        <div className="flex flex-wrap gap-1" aria-hidden="true">
          {recentDays.map((day) => {
            const intensity = Math.min(Math.ceil((day.contributionCount / 10) * 4), 4);
            let bgColor = "bg-gray-100 dark:bg-neutral-800";
            if (intensity === 1) bgColor = "bg-emerald-200 dark:bg-emerald-900";
            if (intensity === 2) bgColor = "bg-emerald-400 dark:bg-emerald-700";
            if (intensity === 3) bgColor = "bg-emerald-600 dark:bg-emerald-500";
            if (intensity === 4) bgColor = "bg-emerald-800 dark:bg-emerald-400";
            return (
              <div
                key={day.date}
                title={resolveContentTokens(uiContent.github.dayTitle, {
                  contributionCount: day.contributionCount,
                  date: day.date,
                })}
                className={`w-3 h-3 rounded-sm ${bgColor}`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        className="flex flex-col gap-2"
        role="img"
        aria-label={resolveContentTokens(uiContent.github.ariaLabel, {
          totalContributions: data.totalContributions,
        })}
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {resolveContentTokens(uiContent.github.summary, {
            totalContributions: data.totalContributions,
          })}
        </div>
        <div className="flex flex-wrap gap-1" aria-hidden="true">
          {recentDays.map((day, i) => {
            const intensity = Math.min(Math.ceil((day.contributionCount / 10) * 4), 4);
            let bgColor = "bg-gray-100 dark:bg-neutral-800";
            if (intensity === 1) bgColor = "bg-emerald-200 dark:bg-emerald-900";
            if (intensity === 2) bgColor = "bg-emerald-400 dark:bg-emerald-700";
            if (intensity === 3) bgColor = "bg-emerald-600 dark:bg-emerald-500";
            if (intensity === 4) bgColor = "bg-emerald-800 dark:bg-emerald-400";
            const delay = Math.min(i * STAGGER_DELAY, MAX_STAGGER);
            return (
              <m.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.25, delay, ease: "easeOut" }}
                title={resolveContentTokens(uiContent.github.dayTitle, {
                  contributionCount: day.contributionCount,
                  date: day.date,
                })}
                className={`w-3 h-3 rounded-sm ${bgColor}`}
              />
            );
          })}
        </div>
      </div>
    </LazyMotion>
  );
}
