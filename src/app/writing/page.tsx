import { getWritings } from "@/lib/mdx";
import WritingCard from "@/components/WritingCard";

export const metadata = {
  title: "Writing | Wilson Chen",
  description: "Thoughts and reflections on building, technology, and developer tools.",
};

export default function WritingPage() {
  const writings = getWritings();

  // Group writings by year
  const groupedWritings = writings.reduce((acc, writing) => {
    const year = new Date(writing.publishDate).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(writing);
    return acc;
  }, {} as Record<string, typeof writings>);

  const years = Object.keys(groupedWritings).sort((a, b) => Number(b) - Number(a));

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

      <div className="space-y-16">
        {years.length > 0 ? (
          years.map(year => (
            <section key={year} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                {year}
              </h2>
              <div className="flex flex-col gap-2 -mx-5">
                {groupedWritings[year].map((writing) => (
                  <WritingCard key={writing.slug} writing={writing} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="text-gray-500 italic">No writings found.</p>
        )}
      </div>
    </main>
  );
}