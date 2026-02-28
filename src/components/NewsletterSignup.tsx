"use client";

import { useState, useRef } from "react";

export default function NewsletterSignup() {
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
        : { error: "Server returned an invalid response. Please try again." };

      if (!response.ok) {
        throw new Error(result?.error || "Failed to subscribe");
      }

      formRef.current?.reset();
      setStatus("success");
    } catch (error: unknown) {
      console.error(error);
      setStatus("error");
      const errMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setErrorMessage(errMessage);
    }
  };

  if (status === "success") {
    return (
      <div role="status" className="p-6 border border-emerald-200 dark:border-emerald-900 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-center text-emerald-800 dark:text-emerald-300">
        <p className="font-medium">Check your email to confirm your subscription.</p>
        <p className="text-sm mt-1">We sent a confirmation link to your inbox.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">Stay in the loop</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Get notified when I publish new writing. No spam, unsubscribe anytime.
        </p>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
          <label htmlFor="nl_honey">Ignore this field</label>
          <input type="text" id="nl_honey" name="_honey" tabIndex={-1} autoComplete="off" />
        </div>
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          disabled={status === "loading"}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
