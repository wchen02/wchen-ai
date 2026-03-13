"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "loading" | "error";

function NewsletterConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Confirming your subscription...");

  const payload = useMemo(
    () => ({
      email: searchParams?.get("email") ?? null,
      ts: searchParams?.get("ts") ?? null,
      sig: searchParams?.get("sig") ?? null,
    }),
    [searchParams]
  );

  useEffect(() => {
    let cancelled = false;

    async function confirm() {
      const response = await fetch("/api/newsletter-confirm-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

    confirm().catch((error: unknown) => {
      if (cancelled) return;
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again later."
      );
    });

    return () => {
      cancelled = true;
    };
  }, [payload, router]);

  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        {status === "loading" ? "Confirming..." : "Confirmation failed"}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        {message}
      </p>
    </main>
  );
}

function NewsletterConfirmFallback() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        Confirming...
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Confirming your subscription...
      </p>
    </main>
  );
}

export default function NewsletterConfirmPage() {
  return (
    <Suspense fallback={<NewsletterConfirmFallback />}>
      <NewsletterConfirmContent />
    </Suspense>
  );
}
