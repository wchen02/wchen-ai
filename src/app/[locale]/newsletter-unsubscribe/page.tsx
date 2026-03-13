"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentLocale } from "@/components/LocaleProvider";
import { localizePath } from "@/lib/i18n";
import { getSystemContent, getUiContent } from "@/lib/site-content";

type Status = "loading" | "error";

function NewsletterUnsubscribeContent() {
  const locale = useCurrentLocale();
  const uiContent = getUiContent(locale);
  const systemContent = getSystemContent(locale);
  const genericError = systemContent.common.genericError;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState(uiContent.newsletterFlow.unsubscribeLoadingMessage);

  const queryString = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("locale", locale);
    return params.toString();
  }, [locale, searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function unsubscribe() {
      const response = await fetch(`/api/newsletter-unsubscribe-local?${queryString}`, {
        method: "POST",
      });
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        redirectTo?: string;
      };

      if (cancelled) return;

      if (response.ok && result.success && result.redirectTo) {
        router.replace(localizePath(locale, result.redirectTo));
        return;
      }

      setStatus("error");
      setMessage(result.error ?? genericError);
    }

    unsubscribe().catch((error: unknown) => {
      if (cancelled) return;
      setStatus("error");
      setMessage(error instanceof Error ? error.message : genericError);
    });

    return () => {
      cancelled = true;
    };
  }, [genericError, locale, queryString, router]);

  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        {status === "loading"
          ? uiContent.newsletterFlow.unsubscribeLoadingTitle
          : uiContent.newsletterFlow.unsubscribeErrorTitle}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">{message}</p>
    </main>
  );
}

function NewsletterUnsubscribeFallback() {
  const locale = useCurrentLocale();
  const uiContent = getUiContent(locale);

  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        {uiContent.newsletterFlow.unsubscribeLoadingTitle}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        {uiContent.newsletterFlow.unsubscribeLoadingMessage}
      </p>
    </main>
  );
}

export default function LocalizedNewsletterUnsubscribePage() {
  return (
    <Suspense fallback={<NewsletterUnsubscribeFallback />}>
      <NewsletterUnsubscribeContent />
    </Suspense>
  );
}
