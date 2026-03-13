"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "loading" | "error";

function NewsletterUnsubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Unsubscribing you from future newsletter emails...");

  const queryString = useMemo(() => searchParams?.toString() ?? "", [searchParams]);

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
        router.replace(result.redirectTo);
        return;
      }

      setStatus("error");
      setMessage(result.error ?? "Something went wrong. Please try again later.");
    }

    unsubscribe().catch((error: unknown) => {
      if (cancelled) return;
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again later."
      );
    });

    return () => {
      cancelled = true;
    };
  }, [queryString, router]);

  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        {status === "loading" ? "Unsubscribing..." : "Unsubscribe failed"}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        {message}
      </p>
    </main>
  );
}

function NewsletterUnsubscribeFallback() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        Unsubscribing...
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Unsubscribing you from future newsletter emails...
      </p>
    </main>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense fallback={<NewsletterUnsubscribeFallback />}>
      <NewsletterUnsubscribeContent />
    </Suspense>
  );
}
