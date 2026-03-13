import type { Metadata } from "next";
import ReachOutCTA from "@/components/ReachOutCTA";
import Headshot from "@/components/Headshot";
import MarkdownSnippet from "@/components/MarkdownSnippet";
import SectionReveal from "@/components/SectionReveal";
import { getMetadataDefaults } from "@/lib/metadata-defaults";
import { getCanonicalUrl, getLanguageAlternates } from "@/lib/route-localization";
import { resolveLocale } from "@/lib/locales";
import { absoluteUrl, getSiteProfile, getSocialLinks } from "@/lib/site-config";
import { getAboutContent } from "@/lib/site-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const metadataDefaults = getMetadataDefaults(resolvedLocale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const aboutContent = getAboutContent(resolvedLocale);

  return {
    title: `${aboutContent.intro.title} | ${siteProfile.siteName}`,
    description: aboutContent.metadataDescription,
    alternates: {
      canonical: getCanonicalUrl(resolvedLocale, "/about"),
      languages: getLanguageAlternates("/about"),
    },
    openGraph: {
      title: `${aboutContent.intro.title} | ${siteProfile.siteName}`,
      description: aboutContent.metadataDescription,
      url: getCanonicalUrl(resolvedLocale, "/about"),
      siteName: metadataDefaults.siteName,
      locale: metadataDefaults.locale,
      type: "profile",
      images: [
        {
          url: metadataDefaults.defaultOgImageUrl,
          width: metadataDefaults.defaultOgImageWidth,
          height: metadataDefaults.defaultOgImageHeight,
          alt: metadataDefaults.defaultOgImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${aboutContent.intro.title} | ${siteProfile.siteName}`,
      description: aboutContent.metadataDescription,
      images: [metadataDefaults.defaultOgImageUrl],
    },
  };
}

export default async function LocalizedAboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const socialLinks = getSocialLinks(resolvedLocale);
  const aboutContent = getAboutContent(resolvedLocale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteProfile.siteName,
    url: siteProfile.url,
    jobTitle: siteProfile.role,
    sameAs: socialLinks.map((link) => link.url),
    image: absoluteUrl(siteProfile.assets.headshotPath, resolvedLocale),
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-24 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectionReveal className="space-y-6">
        <header className="flex flex-col sm:flex-row gap-6 items-start">
          <Headshot />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              {aboutContent.intro.title}
            </h1>
            <MarkdownSnippet
              source={aboutContent.intro.description}
              className="prose dark:prose-invert text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mt-4 prose-p:my-0"
            />
          </div>
        </header>
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          {aboutContent.philosophy.title}
        </h2>
        <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 leading-relaxed max-w-none">
          {aboutContent.philosophy.paragraphs.map((paragraph) => (
            <MarkdownSnippet key={paragraph} source={paragraph} />
          ))}
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          {aboutContent.expertise.title}
        </h2>
        <MarkdownSnippet
          source={aboutContent.expertise.description}
          className="prose dark:prose-invert text-gray-600 dark:text-gray-400 leading-relaxed max-w-none"
        />
        <div className="grid gap-6 md:grid-cols-2">
          {aboutContent.expertise.items.map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-gray-800"
            >
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          {aboutContent.background.title}
        </h2>
        <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 leading-relaxed max-w-none">
          {aboutContent.background.paragraphs.map((paragraph) => (
            <MarkdownSnippet key={paragraph} source={paragraph} />
          ))}
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          {aboutContent.principles.title}
        </h2>
        <ul className="space-y-4">
          {aboutContent.principles.items.map((item) => (
            <li key={item.principle} className="flex gap-4">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {item.principle}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SectionReveal>

      <SectionReveal className="pt-8">
        <ReachOutCTA locale={resolvedLocale} />
      </SectionReveal>
    </main>
  );
}
