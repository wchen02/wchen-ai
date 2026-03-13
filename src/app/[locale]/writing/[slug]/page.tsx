import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import GiscusComments from "@/components/GiscusComments";
import NewsletterSlideout from "@/components/NewsletterSlideout";
import ReadNext from "@/components/ReadNext";
import ShareButton from "@/components/ShareButton";
import {
  extractExcerpt,
  extractHeadings,
  getRelatedWritings,
  getWritingBySlug,
  getWritings,
} from "@/lib/mdx";
import { formatDate, resolveContentTokens } from "@/lib/formatting";
import { getMetadataDefaults } from "@/lib/metadata-defaults";
import { localizePath } from "@/lib/i18n";
import { getCanonicalUrl, getLanguageAlternates } from "@/lib/route-localization";
import { resolveLocale, SUPPORTED_LOCALES } from "@/lib/locales";
import { absoluteUrl, getSiteProfile } from "@/lib/site-config";
import { getGiscusConfig } from "@/lib/giscus-config";
import { getThemeLabel } from "@/lib/theme-config";
import { getUiContent } from "@/lib/site-content";

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    getWritings(locale).map((writing) => ({
      locale,
      slug: writing.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const uiContent = getUiContent(resolvedLocale);
  const metadataDefaults = getMetadataDefaults(resolvedLocale);
  const writing = getWritingBySlug(slug, resolvedLocale);

  if (!writing) {
    return { title: uiContent.writing.notFoundTitle };
  }

  const description = extractExcerpt(writing.content);
  const ogImageUrl = writing.ogImage ?? metadataDefaults.defaultOgImageUrl;

  return {
    title: resolveContentTokens(uiContent.writing.detailTitleTemplate, {
      title: writing.title,
      siteName: siteProfile.siteName,
    }),
    description,
    alternates: {
      canonical: getCanonicalUrl(resolvedLocale, `/writing/${slug}`),
      languages: getLanguageAlternates(`/writing/${slug}`),
    },
    openGraph: {
      title: writing.title,
      description,
      url: getCanonicalUrl(resolvedLocale, `/writing/${slug}`),
      siteName: metadataDefaults.siteName,
      locale: metadataDefaults.locale,
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: metadataDefaults.defaultOgImageWidth,
          height: metadataDefaults.defaultOgImageHeight,
          alt: writing.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: writing.title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function LocalizedWritingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const metadataDefaults = getMetadataDefaults(resolvedLocale);
  const uiContent = getUiContent(resolvedLocale);
  const writing = getWritingBySlug(slug, resolvedLocale);

  if (!writing) {
    notFound();
  }

  const shareDescription = extractExcerpt(writing.content);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: writing.title,
    author: { "@type": "Person", name: siteProfile.siteName, url: siteProfile.url },
    datePublished: writing.publishDate,
    ...(writing.updatedAt ? { dateModified: writing.updatedAt } : {}),
    description: shareDescription,
    url: absoluteUrl(`/writing/${slug}`, resolvedLocale),
    image: writing.ogImage ?? metadataDefaults.defaultOgImageUrl,
  };

  const tocHeadings = extractHeadings(writing.content);
  const giscusConfig = getGiscusConfig();
  const discussionTerm = `Writing: ${writing.title} (${resolvedLocale})`;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleWithTOC
        locale={resolvedLocale}
        backLink={
          <Link
            href={localizePath(resolvedLocale, "/writing")}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            ← {uiContent.writing.backToAllLabel}
          </Link>
        }
        header={
          <header className="space-y-6 pb-8 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              {writing.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 items-center">
              <time dateTime={writing.publishDate}>
                {formatDate(writing.publishDate, { year: "numeric", month: "long", day: "numeric" }, resolvedLocale)}
              </time>
              <span>•</span>
              <span>
                {writing.readingTimeMinutes} {uiContent.writing.minuteReadLabel}
              </span>
              <span>•</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {getThemeLabel(writing.theme, resolvedLocale)}
              </span>
              <span>•</span>
              <ShareButton
                url={absoluteUrl(`/writing/${slug}`, resolvedLocale)}
                title={writing.title}
                description={shareDescription}
              />
            </div>
            {writing.tags && writing.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {writing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>
        }
        tocHeadings={tocHeadings}
        footer={
          <>
            <ReadNext writings={getRelatedWritings(slug, 3, resolvedLocale)} locale={resolvedLocale} />
            {giscusConfig && (
              <GiscusComments
                discussionTerm={discussionTerm}
                repo={giscusConfig.repo}
                repoId={giscusConfig.repoId}
                categoryId={giscusConfig.categoryId}
                category={giscusConfig.category}
                heading={uiContent.comments.heading}
              />
            )}
          </>
        }
      >
        <div className="prose dark:prose-invert prose-emerald min-w-0 max-w-full overflow-x-auto prose-p:leading-relaxed prose-headings:font-bold prose-headings:scroll-mt-24 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-pre:overflow-x-auto prose-pre:max-w-full prose-img:max-w-full prose-img:h-auto">
          <MDXRemote
            source={writing.content}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
          />
        </div>
      </ArticleWithTOC>
      <NewsletterSlideout />
    </main>
  );
}
