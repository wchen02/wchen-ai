import type { GitHubContributions } from "@/lib/schemas";
import { resolveContentTokens } from "@/lib/formatting";
import { getUiContent } from "@/lib/site-content";

interface GitHubGraphProps {
  data: GitHubContributions | null;
  locale?: string;
}

export default function GitHubGraph({ data, locale }: GitHubGraphProps) {
  const uiContent = getUiContent(locale);

  if (!data || !data.weeks) {
    return <div className="text-sm text-gray-500">{uiContent.github.noDataLabel}</div>;
  }

  const allDays = data.weeks.flatMap((w) => w.contributionDays);
  const recentDays = allDays.slice(-100);

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
