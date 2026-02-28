import type { ReactNode } from "react";
import type { TOCItem } from "@/lib/mdx";
import TableOfContents from "@/components/TableOfContents";

interface ArticleWithTOCProps {
  backLink: ReactNode;
  header: ReactNode;
  children: ReactNode;
  tocHeadings: TOCItem[];
  footer?: ReactNode;
}

export default function ArticleWithTOC({ backLink, header, children, tocHeadings, footer }: ArticleWithTOCProps) {
  const showToc = tocHeadings.length >= 3;

  return (
    <>
      <div className="mb-8">{backLink}</div>

      <div className="md:grid md:grid-cols-[1fr_200px] md:gap-10 lg:gap-12">
        <article className="min-w-0 space-y-12">
          {header}

          {showToc && (
            <div className="md:hidden sticky top-16 z-10 py-3 -mx-6 px-6 bg-white dark:bg-neutral-950 border-b border-gray-200 dark:border-gray-800">
              <TableOfContents headings={tocHeadings} />
            </div>
          )}

          {children}
        </article>

        {showToc && (
          <aside className="hidden md:block" aria-label="Table of contents">
            <div className="sticky top-24">
              <TableOfContents headings={tocHeadings} />
            </div>
          </aside>
        )}
      </div>

      {footer}
    </>
  );
}
