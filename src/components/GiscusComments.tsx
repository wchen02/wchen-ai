"use client";

import { useEffect, useRef, useState } from "react";
import { getGiscusTheme } from "@/lib/giscus-theme";

export interface GiscusCommentsProps {
  /** Human-readable discussion title shown in GitHub (e.g. "Writing: My Post (en)") */
  discussionTerm: string;
  repo: string;
  repoId: string;
  categoryId: string;
  category?: string;
  /** Section heading shown above the widget */
  heading?: string;
}

const GISCUS_SCRIPT_SRC = "https://giscus.app/client.js";

export default function GiscusComments({
  discussionTerm,
  repo,
  repoId,
  categoryId,
  category,
  heading,
}: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [themeKey, setThemeKey] = useState(0);

  // Re-run Giscus when site theme toggles (light/dark) so the widget uses the correct theme
  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      setThemeKey((k) => k + 1);
    });
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !discussionTerm) return;

    const theme = getGiscusTheme();

    // Clear existing widget (script + iframe) so we can inject with the new theme
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = GISCUS_SCRIPT_SRC;
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category ?? "General");
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", discussionTerm);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [discussionTerm, repo, repoId, categoryId, category, themeKey]);

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800" aria-labelledby="giscus-heading">
      {heading && (
        <h2 id="giscus-heading" className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {heading}
        </h2>
      )}
      <div ref={containerRef} className="giscus-container min-w-0 min-h-[200px] overflow-x-auto" />
    </section>
  );
}
