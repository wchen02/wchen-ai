"use client";

import { useEffect, useState } from "react";

interface GitHubContributions {
  totalContributions: number;
  weeks: {
    contributionDays: {
      contributionCount: number;
      date: string;
    }[];
  }[];
}

export default function GitHubGraph() {
  const [data, setData] = useState<GitHubContributions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/github-contributions.json")
      .then((res) => res.json())
      .then((json: unknown) => {
        setData(json as GitHubContributions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load GitHub data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="h-32 w-full animate-pulse bg-gray-100 rounded-md dark:bg-neutral-800" />;
  }

  if (!data || !data.weeks) {
    return <div className="text-sm text-gray-500">Failed to load contribution data.</div>;
  }

  // Flatten days and get the last N days for a simpler "recent activity" graph
  const allDays = data.weeks.flatMap((w) => w.contributionDays);
  
  // Get last 100 days roughly
  const recentDays = allDays.slice(-100);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-gray-100">{data.totalContributions}</span> contributions in the last year
      </div>
      
      <div className="flex flex-wrap gap-1">
        {recentDays.map((day, i) => {
          // Calculate intensity 0-4
          const intensity = Math.min(Math.ceil((day.contributionCount / 10) * 4), 4);
          
          let bgColor = "bg-gray-100 dark:bg-neutral-800";
          if (intensity === 1) bgColor = "bg-emerald-200 dark:bg-emerald-900";
          if (intensity === 2) bgColor = "bg-emerald-400 dark:bg-emerald-700";
          if (intensity === 3) bgColor = "bg-emerald-600 dark:bg-emerald-500";
          if (intensity === 4) bgColor = "bg-emerald-800 dark:bg-emerald-400";

          return (
            <div
              key={i}
              title={`${day.contributionCount} contributions on ${day.date}`}
              className={`w-3 h-3 rounded-sm ${bgColor}`}
            />
          );
        })}
      </div>
    </div>
  );
}
