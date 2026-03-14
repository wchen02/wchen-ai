"use client";

import { useEffect, useState, type ReactElement } from "react";
import ArticleBodyHighlighter from "@/components/ArticleBodyHighlighter";

export default function WritingProseWithHighlight({
  subtitlesUrl,
  expectedTextHash,
  children,
}: {
  subtitlesUrl?: string;
  expectedTextHash?: string;
  children: ReactElement;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!subtitlesUrl) return children;
  if (!mounted) return children;

  return (
    <ArticleBodyHighlighter subtitlesUrl={subtitlesUrl} expectedTextHash={expectedTextHash}>
      {children}
    </ArticleBodyHighlighter>
  );
}
