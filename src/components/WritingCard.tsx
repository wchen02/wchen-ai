import Link from "next/link";
import { type Writing } from "@/lib/schemas";

function isUpdated(writing: Writing): boolean {
  if (!writing.updatedAt) return false;
  return new Date(writing.updatedAt).getTime() > new Date(writing.publishDate).getTime();
}

export default function WritingCard({ writing }: { writing: Writing }) {
  const showUpdated = isUpdated(writing);
  const displayTags = writing.tags?.length ? writing.tags.slice(0, 3) : [];

  return (
    <article className={`group flex flex-col gap-2 p-5 rounded-xl transition-shadow hover:shadow-sm ${writing.featured ? "border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/10" : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900"}`}>
      <div className="flex justify-between items-baseline gap-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          <Link href={`/writing/${writing.slug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {writing.title}
          </Link>
        </h3>
      </div>

      {writing.excerpt ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {writing.excerpt}
        </p>
      ) : null}

      <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
        <time dateTime={writing.publishDate}>
          {new Date(writing.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </time>
        {showUpdated && (
          <>
            <span>•</span>
            <span title={writing.updatedAt}>
              Updated {new Date(writing.updatedAt!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </>
        )}
        <span>•</span>
        <span>{writing.readingTimeMinutes} min read</span>
        <span>•</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {writing.theme}
        </span>
      </div>

      {displayTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}