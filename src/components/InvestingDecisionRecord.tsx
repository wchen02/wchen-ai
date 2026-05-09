import { formatDate } from "@/lib/formatting";
import { getUiContent } from "@/lib/site-content";
import type { Writing } from "@/lib/schemas";
import type { ReactNode } from "react";

function lookupLabel(labels: Record<string, string>, value: string): string {
  return labels[value] ?? value;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 dark:text-gray-100">{children}</dd>
    </div>
  );
}

export default function InvestingDecisionRecord({
  writing,
  locale,
}: {
  writing: Writing;
  locale?: string;
}) {
  if (!writing.investing) return null;

  const labels = getUiContent(locale).investing;
  const investing = writing.investing;

  return (
    <aside className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-5">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {labels.decisionRecordHeading}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">{investing.summary}</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <Field label={labels.kindLabel}>
          {lookupLabel(labels.kindLabels, investing.kind)}
        </Field>
        <Field label={labels.statusLabel}>
          {lookupLabel(labels.statusLabels, investing.status)}
        </Field>
        <Field label={labels.directionLabel}>
          {lookupLabel(labels.directionLabels, investing.direction)}
        </Field>
        <Field label={labels.horizonLabel}>{investing.horizon}</Field>
        <Field label={labels.disclosureLabel}>{investing.disclosure}</Field>
        {investing.lastReviewed ? (
          <Field label={labels.lastReviewedLabel}>
            {formatDate(investing.lastReviewed, { year: "numeric", month: "short", day: "numeric" }, locale)}
          </Field>
        ) : null}
      </dl>

      <div className="grid gap-4">
        <Field label={labels.thesisLabel}>{investing.thesis}</Field>
        <Field label={labels.invalidationLabel}>{investing.invalidation}</Field>
        <Field label={labels.riskLabel}>{investing.risk}</Field>
      </div>

      {(investing.catalysts.length > 0 || investing.decisionTriggers.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {investing.catalysts.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {labels.catalystsLabel}
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                {investing.catalysts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {investing.decisionTriggers.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {labels.decisionTriggersLabel}
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                {investing.decisionTriggers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      <p className="rounded-xl bg-white/70 dark:bg-neutral-950/40 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">
        {labels.notFinancialAdvice}
      </p>
    </aside>
  );
}
