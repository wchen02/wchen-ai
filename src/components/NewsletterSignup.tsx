"use client";

import { useState, useRef } from "react";
import { useCurrentLocale } from "@/components/LocaleProvider";
import { getFormsContent } from "@/lib/site-content";
import { getSiteProfile } from "@/lib/site-config";

export default function NewsletterSignup() {
  const locale = useCurrentLocale();
  const formsContent = getFormsContent(locale);
  const siteProfile = getSiteProfile(locale);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("Content-Type") ?? "";
      const isJson = contentType.includes("application/json");
      const text = await response.text();
      const result = isJson
        ? (JSON.parse(text) as { error?: string })
        : { error: formsContent.common.invalidResponseError };

      if (!response.ok) {
        throw new Error(result?.error || formsContent.newsletter.submitErrorFallback);
      }

      formRef.current?.reset();
      setStatus("success");
    } catch (error: unknown) {
      console.error(error);
      setStatus("error");
      const errMessage = error instanceof Error ? error.message : formsContent.common.unexpectedError;
      setErrorMessage(errMessage);
    }
  };

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className="p-6 border border-emerald-200 dark:border-emerald-900 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-center text-emerald-800 dark:text-emerald-300">
        <p className="font-medium">{siteProfile.newsletter.successTitle}</p>
        <p className="text-sm mt-1">{siteProfile.newsletter.successDescription}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">{formsContent.newsletter.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {siteProfile.newsletter.description}
        </p>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
          <label htmlFor="nl_honey">{formsContent.common.honeypotLabel}</label>
          <input type="text" id="nl_honey" name="_honey" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <label htmlFor="nl_email" className="sr-only">
            {formsContent.newsletter.emailLabel}
          </label>
          <input
            id="nl_email"
            type="email"
            name="email"
            required
            placeholder={formsContent.newsletter.emailPlaceholder}
            disabled={status === "loading"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary whitespace-nowrap text-sm"
        >
          {status === "loading" ? formsContent.newsletter.submittingLabel : formsContent.newsletter.submitLabel}
        </button>
      </form>
      {status === "error" && (
        <p role="alert" aria-live="assertive" className="text-sm text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 px-4 py-3">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
