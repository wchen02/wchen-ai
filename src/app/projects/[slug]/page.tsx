import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getProjectBySlug, getProjects, extractHeadings, type TOCItem } from "@/lib/mdx";
import rehypeSlug from "rehype-slug";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import ShareButton from "@/components/ShareButton";
import ReachOutCTA from "@/components/ReachOutCTA";
import Link from "next/link";

export async function generateStaticParams() {
  const projects = getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.slug);
  
  if (!project) {
    return { title: 'Project Not Found' };
  }
  
  return {
    title: `${project.title} | Wilson Chen`,
    description: project.problemAddressed,
    openGraph: {
      title: project.title,
      description: project.problemAddressed,
      url: `https://wchen.ai/projects/${resolvedParams.slug}`,
      siteName: "Wilson Chen",
      locale: "en_US",
      type: "article",
      images: [{ url: "https://wchen.ai/og-default.png", width: 1200, height: 630, alt: project.title }],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.slug);

  if (!project) {
    notFound();
  }

  const fixedSections: TOCItem[] = [
    { id: "the-motivation", text: "The Motivation", level: 2 },
    { id: "the-problem", text: "The Problem", level: 2 },
    ...(project.learnings ? [{ id: "key-learnings", text: "Key Learnings", level: 2 as const }] : []),
  ];
  const tocHeadings = [...fixedSections, ...extractHeadings(project.content)];

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 md:py-24">
      <ArticleWithTOC
        backLink={
          <Link href="/projects" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            ← Back to all projects
          </Link>
        }
        header={
          <header className="space-y-6 border-b border-gray-200 dark:border-gray-800 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 items-center">
              <time dateTime={project.date}>{new Date(project.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
              <span>•</span>
              <div className="flex gap-2">
                {project.type.map((t) => (
                  <span key={t} className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
              <span>•</span>
              <ShareButton url={`https://wchen.ai/projects/${resolvedParams.slug}`} title={project.title} />
              {(project.github || project.url) && <span>•</span>}
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline">
                  GitHub
                </a>
              )}
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline">
                  Live App
                </a>
              )}
            </div>
          </header>
        }
        tocHeadings={tocHeadings}
        footer={<ReachOutCTA />}
      >
        <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-6 md:p-8 space-y-6 border border-gray-100 dark:border-gray-800">
          <section id="the-motivation">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 scroll-mt-24">The Motivation</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.motivation}</p>
          </section>
          <section id="the-problem">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 scroll-mt-24">The Problem</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.problemAddressed}</p>
          </section>
          {project.learnings && (
            <section id="key-learnings">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 scroll-mt-24">Key Learnings</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.learnings}</p>
            </section>
          )}
        </div>
        <div className="prose dark:prose-invert prose-emerald max-w-none prose-headings:font-bold prose-headings:scroll-mt-24 prose-a:text-emerald-600 dark:prose-a:text-emerald-400">
          <MDXRemote source={project.content} options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }} />
        </div>
      </ArticleWithTOC>
    </main>
  );
}