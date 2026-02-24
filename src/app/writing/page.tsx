import { getWritings } from "@/lib/mdx";
import WritingCard from "@/components/WritingCard";
import ReachOutCTA from "@/components/ReachOutCTA";
import type { Writing } from "@/lib/schemas";

export const metadata = {
  title: "Writing | Wilson Chen",
  description: "Thoughts and reflections on building, technology, and developer tools.",
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
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-24 space-y-12">
      <header className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Writing & Ideas
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          A living record of my evolving thoughts on engineering, products, and the friction 
          of building software.
        </p>
      </header>

      {themes.length > 1 && (
        <nav className="flex flex-wrap gap-2">
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
      )}

      <div className="space-y-16">
        {themes.length > 0 ? (
          themes.map(theme => (
            <section
              key={theme}
              id={`theme-${theme.toLowerCase().replace(/\s+/g, '-')}`}
              className="space-y-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                {theme}
              </h2>
              <div className="flex flex-col gap-2 -mx-5">
                {themeGroups[theme].map((writing) => (
                  <WritingCard key={writing.slug} writing={writing} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="text-gray-500 italic">No writings found.</p>
        )}
      </div>

      <ReachOutCTA />
    </main>
  );
}
