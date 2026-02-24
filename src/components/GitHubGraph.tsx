import type { GitHubContributions } from "@/lib/schemas";

interface GitHubGraphProps {
  data: GitHubContributions | null;
}

export default function GitHubGraph({ data }: GitHubGraphProps) {
  if (!data || !data.weeks) {
    return <div className="text-sm text-gray-500">No contribution data available.</div>;
  }

  const allDays = data.weeks.flatMap((w) => w.contributionDays);
  const recentDays = allDays.slice(-100);

  return (
    <div
      className="flex flex-col gap-2"
      role="img"
      aria-label={`GitHub contribution graph showing ${data.totalContributions} contributions in the last year across the most recent 100 days`}
    >
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-gray-100">{data.totalContributions}</span> contributions in the last year
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
              title={`${day.contributionCount} contributions on ${day.date}`}
              className={`w-3 h-3 rounded-sm ${bgColor}`}
            />
          );
        })}
      </div>
    </div>
  );
}
