import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import type { Metadata } from "next";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import GiscusComments from "@/components/GiscusComments";
import MdxImage from "@/components/MdxImage";
import NewsletterSlideout from "@/components/NewsletterSlideout";
import ShareButton from "@/components/ShareButton";
import { extractHeadings, getProjectBySlug, getProjects, type TOCItem } from "@/lib/mdx";
import { formatDate, resolveContentTokens } from "@/lib/formatting";
import { getMetadataDefaults } from "@/lib/metadata-defaults";
import { localizePath } from "@/lib/i18n";
import { getCanonicalUrl, getLanguageAlternates } from "@/lib/route-localization";
import { resolveLocale, SUPPORTED_LOCALES } from "@/lib/locales";
import { absoluteUrl, getSiteProfile } from "@/lib/site-config";
import { getUiContent } from "@/lib/site-content";
import { getGiscusConfig } from "@/lib/giscus-config";

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    getProjects(locale).map((project) => ({
      locale,
      slug: project.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const uiContent = getUiContent(resolvedLocale);
  const metadataDefaults = getMetadataDefaults(resolvedLocale);
  const project = getProjectBySlug(slug, resolvedLocale);

  if (!project) {
    return { title: uiContent.projects.notFoundTitle };
  }

  return {
    title: resolveContentTokens(uiContent.projects.detailTitleTemplate, {
      title: project.title,
      siteName: siteProfile.siteName,
    }),
    description: project.problemAddressed,
    alternates: {
      canonical: getCanonicalUrl(resolvedLocale, `/projects/${slug}`),
      languages: getLanguageAlternates(`/projects/${slug}`),
    },
    openGraph: {
      title: project.title,
      description: project.problemAddressed,
      url: absoluteUrl(`/projects/${slug}`, resolvedLocale),
      siteName: metadataDefaults.siteName,
      locale: metadataDefaults.locale,
      type: "article",
      images: [
        {
          url: metadataDefaults.defaultOgImageUrl,
          width: metadataDefaults.defaultOgImageWidth,
          height: metadataDefaults.defaultOgImageHeight,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.problemAddressed,
      images: [metadataDefaults.defaultOgImageUrl],
    },
  };
}

export default async function LocalizedProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolvedLocale = resolveLocale(locale);
  const project = getProjectBySlug(slug, resolvedLocale);
  const uiContent = getUiContent(resolvedLocale);

  if (!project) {
    notFound();
  }

  const fixedSections: TOCItem[] = [
    { id: "the-motivation", text: uiContent.projects.motivationLabel, level: 2 },
    { id: "the-problem", text: uiContent.projects.problemLabel, level: 2 },
    ...(project.learnings
      ? [{ id: "key-learnings", text: uiContent.projects.learningsLabel, level: 2 as const }]
      : []),
  ];
  const tocHeadings = [...fixedSections, ...extractHeadings(project.content)];
  const giscusConfig = getGiscusConfig();
  const discussionTerm = `Project: ${project.title} (${resolvedLocale})`;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-24">
      <ArticleWithTOC
        locale={resolvedLocale}
        backLink={
          <Link
            href={localizePath(resolvedLocale, "/projects")}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            ← {uiContent.projects.backToAllLabel}
          </Link>
        }
        header={
          <header className="space-y-6 border-b border-gray-200 dark:border-gray-800 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 items-center">
              <time dateTime={project.date}>
                {formatDate(project.date, { year: "numeric", month: "long", day: "numeric" }, resolvedLocale)}
              </time>
              <span>•</span>
              <div className="flex gap-2">
                {project.type.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-md"
                  >
                    {uiContent.projects.typeLabels[type]}
                  </span>
                ))}
              </div>
              <span>•</span>
              <ShareButton
                url={absoluteUrl(`/projects/${slug}`, resolvedLocale)}
                title={project.title}
                description={project.problemAddressed}
              />
              {(project.github || project.url) && <span>•</span>}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
                >
                  {uiContent.projects.githubLabel}
                </a>
              )}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
                >
                  {uiContent.projects.liveAppLabel}
                </a>
              )}
            </div>
          </header>
        }
        tocHeadings={tocHeadings}
        footer={
          <>
            {giscusConfig && (
              <GiscusComments
                discussionTerm={discussionTerm}
                repo={giscusConfig.repo}
                repoId={giscusConfig.repoId}
                categoryId={giscusConfig.categoryId}
                category={giscusConfig.category}
                heading={uiContent.comments.heading}
              />
            )}
          </>
        }
      >
        <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-6 md:p-8 space-y-6 border border-gray-100 dark:border-gray-800">
          <section id="the-motivation">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 scroll-mt-24">
              {uiContent.projects.motivationLabel}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.motivation}</p>
          </section>
          <section id="the-problem">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 scroll-mt-24">
              {uiContent.projects.problemLabel}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {project.problemAddressed}
            </p>
          </section>
          {project.learnings && (
            <section id="key-learnings">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 scroll-mt-24">
                {uiContent.projects.learningsLabel}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.learnings}</p>
            </section>
          )}
        </div>
        <div className="prose dark:prose-invert prose-emerald min-w-0 max-w-full overflow-x-auto prose-headings:font-bold prose-headings:scroll-mt-24 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-pre:overflow-x-auto prose-pre:max-w-full prose-img:max-w-full prose-img:h-auto">
          <MDXRemote
            source={project.content}
            options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
            components={{ img: MdxImage }}
          />
        </div>
      </ArticleWithTOC>
      <NewsletterSlideout />
    </main>
  );
}
