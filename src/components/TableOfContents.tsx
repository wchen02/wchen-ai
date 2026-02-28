"use client";

import { useEffect, useState } from "react";
import type { TOCItem } from "@/lib/mdx";

export default function TableOfContents({ headings }: { headings: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length < 3) return;

    const offset = 100;

    const getActiveId = (): string => {
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el && el.getBoundingClientRect().top <= offset) return headings[i].id;
      }
      return headings[0].id;
    };

    const onScrollOrResize = () => setActiveId(getActiveId());

    const observer = new IntersectionObserver(
      () => onScrollOrResize(),
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [headings]);

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
              className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                activeId === h.id
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
