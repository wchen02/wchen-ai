import type { TOCItem } from "@/lib/mdx";

export default function TableOfContents({ headings }: { headings: TOCItem[] }) {
  if (headings.length < 3) return null;

  return (
    <nav aria-label="Table of contents" className="border-l-2 border-gray-200 dark:border-gray-800 pl-4 mb-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
        On this page
      </p>
      <ol className="space-y-1.5 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${h.id}`}
              className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
