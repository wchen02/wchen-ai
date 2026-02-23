import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getWritingBySlug, getWritings } from "@/lib/mdx";
import ReachOutCTA from "@/components/ReachOutCTA";
import Link from "next/link";

export async function generateStaticParams() {
  const writings = getWritings();
  return writings.map((writing) => ({
    slug: writing.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const writing = getWritingBySlug(resolvedParams.slug);
  
  if (!writing) {
    return { title: 'Writing Not Found' };
  }
  
  return {
    title: `${writing.title} | Wilson Chen`,
  };
}

export default async function WritingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const writing = getWritingBySlug(resolvedParams.slug);

  if (!writing) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-24">
      <div className="mb-8">
        <Link href="/writing" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
          ← Back to all writing
        </Link>
      </div>

      <article className="space-y-12">
        <header className="space-y-6 pb-8 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            {writing.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 items-center">
            <time dateTime={writing.publishDate}>
              {new Date(writing.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span>•</span>
            <span>{writing.readingTimeMinutes} min read</span>
            <span>•</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {writing.theme}
            </span>
          </div>

          {writing.tags && writing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {writing.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Dynamic MDX Content */}
        <div className="prose dark:prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-emerald-600 dark:prose-a:text-emerald-400">
          <MDXRemote source={writing.content} />
        </div>
      </article>

      <ReachOutCTA />
    </main>
  );
}