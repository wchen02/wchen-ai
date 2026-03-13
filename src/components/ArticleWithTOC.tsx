import type { ReactNode } from "react";
import type { TOCItem } from "@/lib/mdx";
import TableOfContents from "@/components/TableOfContents";
import { getUiContent } from "@/lib/site-content";

interface ArticleWithTOCProps {
  backLink: ReactNode;
  header: ReactNode;
  children: ReactNode;
  tocHeadings: TOCItem[];
  footer?: ReactNode;
  locale?: string;
}

export default function ArticleWithTOC({
  backLink,
  header,
  children,
  tocHeadings,
  footer,
  locale,
}: ArticleWithTOCProps) {
  const showToc = tocHeadings.length >= 3;
  const uiContent = getUiContent(locale);

  return (
    <>
      <div className="mb-8">{backLink}</div>

      <article className="min-w-0 space-y-12">
        {header}

        {showToc && (
          <div className="xl:hidden py-3 -mx-6 px-6 bg-background border-b border-gray-200 dark:border-gray-800">
            <TableOfContents headings={tocHeadings} locale={locale} />
          </div>
        )}

        {children}
      </article>

      {showToc && (
        <aside
          className="hidden xl:block xl:fixed xl:top-24 xl:left-[calc(50%+25rem)] xl:w-48"
          aria-label={uiContent.tableOfContents.ariaLabel}
        >
          <TableOfContents headings={tocHeadings} locale={locale} />
        </aside>
      )}

      {footer}
    </>
  );
}
