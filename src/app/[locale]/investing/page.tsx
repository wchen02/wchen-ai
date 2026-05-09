import type { Metadata } from "next";
import InvestingCard from "@/components/InvestingCard";
import NewsletterSlideout from "@/components/NewsletterSlideout";
import SectionReveal from "@/components/SectionReveal";
import { getWritings } from "@/lib/mdx";
import { getMetadataDefaults } from "@/lib/metadata-defaults";
import { getCanonicalUrl, getLanguageAlternates } from "@/lib/route-localization";
import { resolveLocale } from "@/lib/locales";
import { getSiteProfile } from "@/lib/site-config";
import { getUiContent } from "@/lib/site-content";
import { getInvestingWritings } from "@/lib/writing-sections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const metadataDefaults = getMetadataDefaults(resolvedLocale);
  const description = siteProfile.investingPage.metadataDescription;

  return {
    title: `${siteProfile.investingPage.metadataTitle} | ${siteProfile.siteName}`,
    description,
    alternates: {
      canonical: getCanonicalUrl(resolvedLocale, "/investing"),
      languages: getLanguageAlternates("/investing"),
    },
    openGraph: {
      title: `${siteProfile.investingPage.metadataTitle} | ${siteProfile.siteName}`,
      description,
      url: getCanonicalUrl(resolvedLocale, "/investing"),
      siteName: metadataDefaults.siteName,
      locale: metadataDefaults.locale,
      type: "website",
      images: [
        {
          url: metadataDefaults.defaultOgImageUrl,
          width: metadataDefaults.defaultOgImageWidth,
          height: metadataDefaults.defaultOgImageHeight,
          alt: siteProfile.investingPage.openGraphAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteProfile.investingPage.metadataTitle} | ${siteProfile.siteName}`,
      description,
      images: [metadataDefaults.defaultOgImageUrl],
    },
  };
}

export default async function LocalizedInvestingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const uiContent = getUiContent(resolvedLocale);
  const investingWritings = getInvestingWritings(getWritings(resolvedLocale));

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-24 space-y-12">
      <SectionReveal className="space-y-6">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {siteProfile.investingPage.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
            {siteProfile.investingPage.intro}
          </p>
        </header>
      </SectionReveal>

      {investingWritings.length > 0 ? (
        <SectionReveal className="space-y-6">
          <div className="flex flex-col gap-2 -mx-5">
            {investingWritings.map((writing) => (
              <InvestingCard key={writing.slug} writing={writing} locale={resolvedLocale} />
            ))}
          </div>
        </SectionReveal>
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
