import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/formatting";
import { localizePath } from "@/lib/i18n";
import { listingImageSrc } from "@/lib/listing-image";
import { resolveLocale } from "@/lib/locales";
import { getUiContent } from "@/lib/site-content";
import type { Writing } from "@/lib/schemas";

function lookupLabel(labels: Record<string, string>, value: string): string {
  return labels[value] ?? value;
}

export default function InvestingCard({
  writing,
  locale,
}: {
  writing: Writing;
  locale?: string;
}) {
  const resolvedLocale = resolveLocale(locale);
  const uiContent = getUiContent(resolvedLocale);
  const investing = writing.investing;
  const href = localizePath(resolvedLocale, `/investing/${writing.slug}`);
  const imageSrc = listingImageSrc(writing.ogImage);

  if (!investing) {
    return null;
  }

  return (
    <article className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 p-5 transition-shadow hover:shadow-sm">
      <div className="space-y-4">
        {imageSrc ? (
          <Link href={href} className="block overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-neutral-800">
            <Image
              src={imageSrc}
              alt={writing.title}
              width={1200}
              height={675}
              loading="lazy"
              unoptimized
              sizes="(min-width: 768px) 768px, 100vw"
              className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              {lookupLabel(uiContent.investing.kindLabels, investing.kind)}
            </p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              <Link href={href} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {writing.title}
              </Link>
            </h2>
          </div>
          {investing.status ? (
            <span className="rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {lookupLabel(uiContent.investing.statusLabels, investing.status)}
            </span>
          ) : null}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">{investing.summary}</p>

        {(investing.direction || investing.horizon || investing.disclosure) && (
          <dl className="grid gap-3 sm:grid-cols-3">
            {investing.direction ? (
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">{uiContent.investing.directionLabel}</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {lookupLabel(uiContent.investing.directionLabels, investing.direction)}
                </dd>
              </div>
            ) : null}
            {investing.horizon ? (
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">{uiContent.investing.horizonLabel}</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{investing.horizon}</dd>
              </div>
            ) : null}
            {investing.disclosure ? (
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">{uiContent.investing.disclosureLabel}</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{investing.disclosure}</dd>
              </div>
            ) : null}
          </dl>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <time dateTime={writing.publishDate}>
            {formatDate(writing.publishDate, { year: "numeric", month: "short", day: "numeric" }, resolvedLocale)}
          </time>
          <span>{uiContent.investing.notFinancialAdvice}</span>
        </div>
      </div>
    </article>
  );
}
