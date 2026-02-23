import Link from "next/link";
import { type Writing } from "@/lib/schemas";

export default function WritingCard({ writing }: { writing: Writing }) {
  return (
    <article className="group flex flex-col gap-2 p-5 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-all">
      <div className="flex justify-between items-baseline gap-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          <Link href={`/writing/${writing.slug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {writing.title}
          </Link>
        </h3>
      </div>
      
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <time dateTime={writing.publishDate}>
          {new Date(writing.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </time>
        <span>•</span>
        <span>{writing.readingTimeMinutes} min read</span>
        <span>•</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {writing.theme}
        </span>
      </div>
    </article>
  );
}