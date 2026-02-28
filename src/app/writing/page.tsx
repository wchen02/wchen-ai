import { getWritings } from "@/lib/mdx";
import WritingCard from "@/components/WritingCard";
import ReachOutCTA from "@/components/ReachOutCTA";
import NewsletterSignup from "@/components/NewsletterSignup";
import SearchWriting from "@/components/SearchWriting";
import SectionReveal from "@/components/SectionReveal";
import { getThemeDescriptor } from "@/lib/theme-config";
import { METADATA_DEFAULTS } from "@/lib/metadata-defaults";
import type { Writing } from "@/lib/schemas";

const writingDescription = "Thoughts and reflections on building, technology, and developer tools.";

export const metadata = {
  title: "Writing | Wilson Chen",
  description: writingDescription,
  alternates: { canonical: `${METADATA_DEFAULTS.canonicalBaseUrl}/writing` },
  openGraph: {
    title: "Writing | Wilson Chen",
    description: writingDescription,
    url: `${METADATA_DEFAULTS.canonicalBaseUrl}/writing`,
    siteName: METADATA_DEFAULTS.siteName,
    locale: METADATA_DEFAULTS.locale,
    type: "website",
    images: [{
      url: METADATA_DEFAULTS.defaultOgImageUrl,
      width: METADATA_DEFAULTS.defaultOgImageWidth,
      height: METADATA_DEFAULTS.defaultOgImageHeight,
      alt: "Wilson Chen — Writing",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing | Wilson Chen",
    description: writingDescription,
    images: [METADATA_DEFAULTS.defaultOgImageUrl],
  },
};

function groupByTheme(writings: Writing[]): Record<string, Writing[]> {
  const groups = writings.reduce((acc, writing) => {
    const theme = writing.theme;
    if (!acc[theme]) {
      acc[theme] = [];
    }
    acc[theme].push(writing);
    return acc;
  }, {} as Record<string, Writing[]>);

  for (const theme of Object.keys(groups)) {
    groups[theme].sort((a, b) => {
      const featuredDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (featuredDiff !== 0) return featuredDiff;
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });
  }

  return groups;
}

export default function WritingPage() {
  const writings = getWritings();
  const themeGroups = groupByTheme(writings);
  const themes = Object.keys(themeGroups).sort();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-24 space-y-16">
      <SectionReveal className="space-y-4">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Writing & Ideas
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
            A living record of my evolving thoughts on engineering, products, and the friction 
            of building software.
          </p>
        </header>
      </SectionReveal>

      <SectionReveal className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900/50">
        <NewsletterSignup />
        <p className="text-sm text-gray-600 dark:text-gray-400 shrink-0">
          <a href="/rss.xml" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded">
            Subscribe via RSS
          </a>
        </p>
      </SectionReveal>

      <SectionReveal>
        <SearchWriting />
      </SectionReveal>

      {themes.length > 1 && (
        <SectionReveal>
          <nav id="theme-nav" className="flex flex-wrap gap-2" aria-label="Browse by theme">
            {themes.map(theme => (
              <a
                key={theme}
                href={`#theme-${theme.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1 text-sm font-medium rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                {theme}
              </a>
            ))}
          </nav>
        </SectionReveal>
      )}

      {themes.length > 0 ? (
        themes.map(theme => (
          <SectionReveal
            key={theme}
            id={`theme-${theme.toLowerCase().replace(/\s+/g, '-')}`}
            className="space-y-6 scroll-mt-24"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
              {theme}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {getThemeDescriptor(theme)}
            </p>
            <div className="flex flex-col gap-2 -mx-5">
              {themeGroups[theme].map((writing) => (
                <WritingCard key={writing.slug} writing={writing} />
              ))}
            </div>
          </SectionReveal>
        ))
      ) : (
        <SectionReveal>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No writings found.</p>
          </div>
        </SectionReveal>
      )}

      <SectionReveal className="pt-8">
        <ReachOutCTA />
      </SectionReveal>
    </main>
  );
}
