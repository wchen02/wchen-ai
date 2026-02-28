"use client";

import { useState } from "react";

export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <button
      onClick={handleShare}
      type="button"
      aria-label="Share or copy link"
      className="relative inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      <span className={`transition-opacity duration-200 ${copied ? "opacity-100" : "opacity-0"} absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded whitespace-nowrap`}>
        Copied!
      </span>
    </button>
  );
}
