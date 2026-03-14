"use client";

import { useState, useRef } from "react";
import { useCurrentLocale } from "@/components/LocaleProvider";
import { logger } from "@/lib/logger";
import { getFormsContent } from "@/lib/site-content";

export default function ContactForm() {
  const locale = useCurrentLocale();
  const formsContent = getFormsContent(locale);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // Note: In local Next.js dev, /api/contact won't exist unless using wrangler.
      // We assume the user is using pnpm run dev for UI, or wrangler for full test.
      const response = await fetch("/api/contact", {
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
        throw new Error(result?.error || formsContent.contact.submitErrorFallback);
      }

      formRef.current?.reset();
      setStatus("success");
    } catch (error: unknown) {
      logger.error(error);
      setStatus("error");
      const errMessage = error instanceof Error ? error.message : formsContent.common.unexpectedError;
      setErrorMessage(errMessage);
    }
  };

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className="p-6 border border-emerald-200 dark:border-emerald-900 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-center text-emerald-800 dark:text-emerald-300">
        <p className="font-medium">{formsContent.contact.successTitle}</p>
        <p className="text-sm mt-1">{formsContent.contact.successDescription}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          {formsContent.contact.resetLabel}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot field - visually hidden, explicitly removed from screen readers if possible, but kept accessible to bots */}
      <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
        <label htmlFor="_honey">{formsContent.common.honeypotLabel}</label>
        <input type="text" id="_honey" name="_honey" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formsContent.contact.fields.name.label}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            placeholder={formsContent.contact.fields.name.placeholder}
            disabled={status === "loading"}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formsContent.contact.fields.email.label}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            placeholder={formsContent.contact.fields.email.placeholder}
            disabled={status === "loading"}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formsContent.contact.fields.message.label}
        </label>
        <textarea
          id="message"
          name="message"
          autoComplete="off"
          required
          minLength={10}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 resize-y"
          placeholder={formsContent.contact.fields.message.placeholder}
          disabled={status === "loading"}
        />
      </div>

      {status === "error" && (
        <div role="alert" aria-live="assertive" className="text-sm text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 px-4 py-3">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full md:w-auto px-6"
      >
        {status === "loading" ? formsContent.contact.submittingLabel : formsContent.contact.submitLabel}
      </button>
    </form>
  );
}
