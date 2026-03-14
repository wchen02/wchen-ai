import type { Metadata } from "next";
import BackToTop from "@/components/BackToTop";
import LoadMoreWritings from "@/components/LoadMoreWritings";
import NewsletterSlideout from "@/components/NewsletterSlideout";
import SearchWriting from "@/components/SearchWriting";
import SectionReveal from "@/components/SectionReveal";
import ThemeNav from "@/components/ThemeNav";
import WritingCard from "@/components/WritingCard";
import { getWritings } from "@/lib/mdx";
import { getMetadataDefaults } from "@/lib/metadata-defaults";
import { getCanonicalUrl, getLanguageAlternates } from "@/lib/route-localization";
import { resolveLocale } from "@/lib/locales";
import { getSiteProfile } from "@/lib/site-config";
import { getUiContent } from "@/lib/site-content";
import { getThemeDescriptor, getThemeLabel } from "@/lib/theme-config";
import type { Writing } from "@/lib/schemas";

const INITIAL_WRITING_COUNT = 20;

function groupByTheme(writings: Writing[]): Record<string, Writing[]> {
  const groups = writings.reduce(
    (acc, writing) => {
      const theme = writing.theme;
      if (!acc[theme]) {
        acc[theme] = [];
      }
      acc[theme].push(writing);
      return acc;
    },
    {} as Record<string, Writing[]>
  );

  for (const theme of Object.keys(groups)) {
    groups[theme].sort((a, b) => {
      const featuredDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (featuredDiff !== 0) return featuredDiff;
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });
  }

  return groups;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const metadataDefaults = getMetadataDefaults(resolvedLocale);
  const writingDescription = siteProfile.writingPage.metadataDescription;

  return {
    title: `${siteProfile.writingPage.metadataTitle} | ${siteProfile.siteName}`,
    description: writingDescription,
    alternates: {
      canonical: getCanonicalUrl(resolvedLocale, "/writing"),
      languages: getLanguageAlternates("/writing"),
    },
    openGraph: {
      title: `${siteProfile.writingPage.metadataTitle} | ${siteProfile.siteName}`,
      description: writingDescription,
      url: getCanonicalUrl(resolvedLocale, "/writing"),
      siteName: metadataDefaults.siteName,
      locale: metadataDefaults.locale,
      type: "website",
      images: [
        {
          url: metadataDefaults.defaultOgImageUrl,
          width: metadataDefaults.defaultOgImageWidth,
          height: metadataDefaults.defaultOgImageHeight,
          alt: siteProfile.writingPage.openGraphAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteProfile.writingPage.metadataTitle} | ${siteProfile.siteName}`,
      description: writingDescription,
      images: [metadataDefaults.defaultOgImageUrl],
    },
  };
}

export default async function LocalizedWritingIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const uiContent = getUiContent(resolvedLocale);
  const allWritings = getWritings(resolvedLocale);
  const initialWritings = allWritings.slice(0, INITIAL_WRITING_COUNT);
  const themeGroups = groupByTheme(initialWritings);
  const themes = Object.keys(themeGroups).sort();
  const totalCount = allWritings.length;

  return (
    <main id="page-top" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-24 space-y-12">
      <SectionReveal className="space-y-6">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {siteProfile.writingPage.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
            {siteProfile.writingPage.intro}
          </p>
        </header>
        <SearchWriting />
      </SectionReveal>

      {themes.length > 1 && (
        <a
          href="#theme-nav"
          className="sr-only focus:not-sr-only focus:static focus:inline-block focus:px-3 focus:py-2 focus:mb-4 focus:bg-emerald-500 focus:text-white focus:rounded"
        >
          {uiContent.writing.skipToThemeNavLabel}
        </a>
      )}

      {themes.length > 1 && (
        <SectionReveal>
          <ThemeNav themes={themes} locale={resolvedLocale} />
        </SectionReveal>
      )}

      {themes.length > 0 ? (
        themes.map((theme) => (
          <SectionReveal
            key={theme}
            id={`theme-${theme.toLowerCase().replace(/\s+/g, "-")}`}
            className="space-y-6 scroll-mt-24"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
              {getThemeLabel(theme, resolvedLocale)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {getThemeDescriptor(theme, resolvedLocale)}
            </p>
            <div className="flex flex-col gap-2 -mx-5">
              {themeGroups[theme].map((writing) => (
                <WritingCard key={writing.slug} writing={writing} locale={resolvedLocale} />
              ))}
            </div>
          </SectionReveal>
        ))
      ) : (
        <SectionReveal>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">{uiContent.writing.emptyState}</p>
          </div>
        </SectionReveal>
      )}

      {totalCount > INITIAL_WRITING_COUNT && (
        <SectionReveal>
          <LoadMoreWritings totalCount={totalCount} locale={resolvedLocale} />
        </SectionReveal>
      )}

      {totalCount > 0 && (
        <SectionReveal>
          <BackToTop section="writing" />
        </SectionReveal>
      )}

      <NewsletterSlideout />
    </main>
  );
}
