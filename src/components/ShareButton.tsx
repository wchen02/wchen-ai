"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrentLocale } from "@/components/LocaleProvider";
import {
  shareUrlEmail,
  shareUrlFacebook,
  shareUrlLinkedIn,
  shareUrlTwitter,
} from "@/lib/share-urls";
import { getUiContent } from "@/lib/site-content";

export default function ShareButton({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description?: string;
}) {
  const locale = useCurrentLocale();
  const uiContent = getUiContent(locale);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
      setOpen(false);
    } catch {
      // Clipboard API not available
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share(
        description ? { title, text: description, url } : { title, url }
      );
      setOpen(false);
    } catch {
      // User cancelled or share failed
    }
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        type="button"
        aria-label={uiContent.shareButton.ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span className={`transition-opacity duration-200 ${copied ? "opacity-100" : "opacity-0"} absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10`}>
          {uiContent.shareButton.copiedLabel}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-1 min-w-[11rem] py-1 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-lg z-20"
          aria-orientation="vertical"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCopyLink}
            aria-label={uiContent.shareButton.copyLinkAriaLabel}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:bg-gray-100 dark:focus:bg-neutral-700 focus:outline-none rounded-none first:rounded-t-md"
          >
            {uiContent.shareButton.copyLink}
          </button>
          <a
            href={shareUrlEmail(title, url, description)}
            role="menuitem"
            aria-label={uiContent.shareButton.emailAriaLabel}
            className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:bg-gray-100 dark:focus:bg-neutral-700 focus:outline-none rounded-none"
            onClick={() => setOpen(false)}
          >
            {uiContent.shareButton.email}
          </a>
          <a
            href={shareUrlTwitter(title, url, description)}
            role="menuitem"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={uiContent.shareButton.twitterAriaLabel}
            className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:bg-gray-100 dark:focus:bg-neutral-700 focus:outline-none rounded-none"
            onClick={() => setOpen(false)}
          >
            {uiContent.shareButton.twitter}
          </a>
          <a
            href={shareUrlLinkedIn(url)}
            role="menuitem"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={uiContent.shareButton.linkedInAriaLabel}
            className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:bg-gray-100 dark:focus:bg-neutral-700 focus:outline-none rounded-none"
            onClick={() => setOpen(false)}
          >
            {uiContent.shareButton.linkedIn}
          </a>
          <a
            href={shareUrlFacebook(url)}
            role="menuitem"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={uiContent.shareButton.facebookAriaLabel}
            className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:bg-gray-100 dark:focus:bg-neutral-700 focus:outline-none rounded-none"
            onClick={() => setOpen(false)}
          >
            {uiContent.shareButton.facebook}
          </a>
          {canNativeShare && (
            <button
              type="button"
              role="menuitem"
              onClick={handleNativeShare}
              aria-label={uiContent.shareButton.nativeShareAriaLabel}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:bg-gray-100 dark:focus:bg-neutral-700 focus:outline-none rounded-none last:rounded-b-md"
            >
              {uiContent.shareButton.nativeShare}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
