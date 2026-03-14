"use client";

import { useEffect, useId, useState } from "react";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useCurrentLocale } from "@/components/LocaleProvider";
import { getFormsContent } from "@/lib/site-content";
import { getSiteProfile } from "@/lib/site-config";

const STORAGE_KEY = "newsletter-slideout-expanded";

export default function NewsletterSlideout() {
  const locale = useCurrentLocale();
  const formsContent = getFormsContent(locale);
  const siteProfile = getSiteProfile(locale);
  const title = formsContent.newsletter.title;
  const rssHref = `/rss/${locale}.xml`;
  const rssLabel = siteProfile.navigation.rssLabel;
  const panelId = useId();
  // Always false on first paint so server HTML matches client hydration.
  // Restoring from sessionStorage happens after mount to avoid mismatches.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        // Defer so hydration always sees closed state; avoids setState-in-effect lint.
        queueMicrotask(() => setOpen(true));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (open) sessionStorage.setItem(STORAGE_KEY, "1");
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [open]);

  // Lock body scroll when panel is open (mobile)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Spacer so page content isn’t hidden behind the collapsed bar */}
      <div
        className="h-14 w-full sm:h-12 sm:w-80 sm:max-w-[calc(100vw-2rem)] sm:ml-auto shrink-0 pointer-events-none"
        aria-hidden="true"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      />

      <div
        className="fixed bottom-0 z-50 left-0 right-0 sm:left-auto sm:right-4 sm:w-80 sm:max-w-[calc(100vw-2rem)] min-[1665px]:right-[max(1rem,calc((100vw-64rem)/2))] min-[1665px]:left-auto flex flex-col items-stretch"
        style={{
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        {/* Backdrop when open; hidden from a11y tree when closed so axe does not flag unnamed button */}
        <button
          type="button"
          aria-label="Close"
          aria-hidden={!open}
          className={`pointer-events-auto fixed inset-0 bg-black/40 transition-opacity duration-200 md:bg-black/30 ${
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          } motion-reduce:transition-none`}
          onClick={() => setOpen(false)}
        />

        {/* Single card: bar at top, content slides up below when open */}
        <div
          role="region"
          aria-label={title}
          className="flex flex-col rounded-t-2xl border-x border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.35)] overflow-hidden"
        >
          {/* Bar: always visible, top of card when expanded; pb-safe keeps content above home indicator */}
          <div
            className="relative z-10 flex min-h-12 h-14 sm:h-12 w-full shrink-0 items-center justify-between gap-3 px-4 sm:px-4"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? "Close" : title}
              onClick={() => setOpen((v) => !v)}
              className="flex min-w-0 flex-1 items-center justify-between gap-3 touch-manipulation transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/80 active:bg-gray-100 dark:active:bg-neutral-800 -m-1 rounded-lg p-1"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {title}
                </span>
              </span>
              <span
                className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 transition-transform duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>

          {/* Content: slides up below bar when open; inert + fully hidden when closed so only bar is visible */}
          <div
            id={panelId}
            inert={!open}
            className={`grid min-h-0 overflow-hidden transition-[grid-template-rows] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr] max-h-0"
            } ${!open ? "pointer-events-none invisible" : ""}`}
          >
            <div className="overflow-y-auto overscroll-contain min-h-0 max-h-[70vh] px-4 pt-4 pb-5 space-y-5">
              <NewsletterSignup variant="slideout" />
              <div className="pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Or follow via feed</p>
                <a
                  href={rssHref}
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.75-7.163-15.892-15.839-15.849zm0-3.236v4.811c9.937.093 18.017 8.175 18.11 18.11h4.811c-.101-12.651-10.322-22.872-22.972-22.972z" />
                  </svg>
                  {rssLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
