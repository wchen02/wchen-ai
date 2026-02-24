"use client";

import { useState, useRef } from "react";

export default function ContactForm() {
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
      // Note: In local Next.js dev, /api/contact won't exist unless using wrangler.
      // We assume the user is using pnpm run dev for UI, or wrangler for full test.
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json() as { error?: string };

      if (!response.ok) {
        throw new Error(result?.error || "Failed to submit form");
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
      <div className="p-6 border border-emerald-200 dark:border-emerald-900 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-center text-emerald-800 dark:text-emerald-300">
        <p className="font-medium">Message sent successfully!</p>
        <p className="text-sm mt-1">Thanks for reaching out. I&apos;ll get back to you soon.</p>
        <button 
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm underline hover:no-underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field - visually hidden, explicitly removed from screen readers if possible, but kept accessible to bots */}
      <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
        <label htmlFor="_honey">Ignore this field</label>
        <input type="text" id="_honey" name="_honey" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Jane Founder"
            disabled={status === "loading"}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="jane@example.com"
            disabled={status === "loading"}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
          placeholder="I&apos;d love to collaborate on..."
          disabled={status === "loading"}
        />
      </div>

      {status === "error" && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full md:w-auto px-6 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
