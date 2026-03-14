"use client";

import { useEffect, useState, type ReactElement } from "react";
import ArticleBodyHighlighter from "@/components/ArticleBodyHighlighter";

export default function WritingProseWithHighlight({
  subtitlesUrl,
  expectedTextHash,
  bodyStartOffset = 0,
  children,
}: {
  subtitlesUrl?: string;
  expectedTextHash?: string;
  /** For project pages: character offset in full audio where the MDX body starts. Enables correct highlight and legacy body-only JSON. */
  bodyStartOffset?: number;
  children: ReactElement;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!subtitlesUrl) return children;
  if (!mounted) return children;

  return (
    <ArticleBodyHighlighter
      subtitlesUrl={subtitlesUrl}
      expectedTextHash={expectedTextHash}
      bodyStartOffset={bodyStartOffset}
    >
      {children}
    </ArticleBodyHighlighter>
  );
}
