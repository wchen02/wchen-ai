import type { Metadata } from "next";
import NewsletterSlideout from "@/components/NewsletterSlideout";
import SearchWriting from "@/components/SearchWriting";
import SectionReveal from "@/components/SectionReveal";
import WritingCard from "@/components/WritingCard";
import { getWritings } from "@/lib/mdx";
import { getMetadataDefaults } from "@/lib/metadata-defaults";
import { getCanonicalUrl, getLanguageAlternates } from "@/lib/route-localization";
import { resolveLocale } from "@/lib/locales";
import { getSiteProfile } from "@/lib/site-config";
import { getUiContent } from "@/lib/site-content";
import { getThemeDescriptor, getThemeLabel } from "@/lib/theme-config";
import type { Writing } from "@/lib/schemas";

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
  const writings = getWritings(resolvedLocale);
  const themeGroups = groupByTheme(writings);
  const themes = Object.keys(themeGroups).sort();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-24 space-y-12">
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
        <SectionReveal>
          <nav
            id="theme-nav"
            className="flex flex-wrap gap-2"
            aria-label={uiContent.writing.themeNavAriaLabel}
          >
            {themes.map((theme) => (
              <a
                key={theme}
                href={`#theme-${theme.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3 py-1 text-sm font-medium rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                {getThemeLabel(theme, resolvedLocale)}
              </a>
            ))}
          </nav>
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

      <NewsletterSlideout />
    </main>
  );
}
