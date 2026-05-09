import WritingCard from "@/components/WritingCard";
import type { Writing } from "@/lib/schemas";
import { getUiContent } from "@/lib/site-content";

export default function ReadNext({
  writings,
  locale,
  hrefBasePath = "/writing",
}: {
  writings: Writing[];
  locale?: string;
  hrefBasePath?: "/writing" | "/investing";
}) {
  if (writings.length === 0) return null;

  const uiContent = getUiContent(locale);
  const visibleWritings = writings.slice(0, 4);

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {uiContent.readNext.heading}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleWritings.map((w) => (
          <WritingCard key={w.slug} writing={w} locale={locale} hrefBasePath={hrefBasePath} />
        ))}
      </div>
    </section>
  );
}
