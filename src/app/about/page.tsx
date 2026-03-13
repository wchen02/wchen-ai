import type { Metadata } from "next";
import ReachOutCTA from "@/components/ReachOutCTA";
import Headshot from "@/components/Headshot";
import MarkdownSnippet from "@/components/MarkdownSnippet";
import SectionReveal from "@/components/SectionReveal";
import { SOCIAL_LINKS, SITE_PROFILE, absoluteUrl } from "@/lib/site-config";
import { METADATA_DEFAULTS } from "@/lib/metadata-defaults";
import { getAboutContent } from "@/lib/site-content";

const aboutContent = getAboutContent();
const aboutDescription = aboutContent.metadataDescription;

export const metadata: Metadata = {
  title: `About | ${SITE_PROFILE.siteName}`,
  description: aboutDescription,
  alternates: { canonical: `${METADATA_DEFAULTS.canonicalBaseUrl}/about` },
  openGraph: {
    title: `About ${SITE_PROFILE.siteName}`,
    description: aboutDescription,
    url: `${METADATA_DEFAULTS.canonicalBaseUrl}/about`,
    siteName: METADATA_DEFAULTS.siteName,
    locale: METADATA_DEFAULTS.locale,
    type: "profile",
    images: [{
      url: METADATA_DEFAULTS.defaultOgImageUrl,
      width: METADATA_DEFAULTS.defaultOgImageWidth,
      height: METADATA_DEFAULTS.defaultOgImageHeight,
      alt: METADATA_DEFAULTS.defaultOgImageAlt,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: `About ${SITE_PROFILE.siteName}`,
    description: aboutDescription,
    images: [METADATA_DEFAULTS.defaultOgImageUrl],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_PROFILE.siteName,
  url: SITE_PROFILE.url,
  jobTitle: SITE_PROFILE.role,
  sameAs: SOCIAL_LINKS.map((l) => l.url),
  image: absoluteUrl(SITE_PROFILE.assets.headshotPath),
};

export default function AboutPage() {
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
        <ReachOutCTA />
      </SectionReveal>
    </main>
  );
}
