import Link from "next/link";
import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import GitHubGraphClient from "@/components/GitHubGraphClient";
import HeroMotion from "@/components/HeroMotion";
import MarkdownSnippet from "@/components/MarkdownSnippet";
import ProjectsListClient from "@/components/ProjectsListClient";
import SectionReveal from "@/components/SectionReveal";
import WritingsListClient from "@/components/WritingsListClient";
import { getGitHubContributions, getProjects, getWritings } from "@/lib/mdx";
import { getMetadataDefaults } from "@/lib/metadata-defaults";
import { localizePath } from "@/lib/i18n";
import { getCanonicalUrl, getLanguageAlternates } from "@/lib/route-localization";
import { resolveLocale } from "@/lib/locales";
import { getSiteProfile } from "@/lib/site-config";
import { getHomeContent } from "@/lib/site-content";

function featuredFirst<T extends { featured: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const metadataDefaults = getMetadataDefaults(resolvedLocale);

  return {
    title: metadataDefaults.defaultTitle,
    description: metadataDefaults.defaultDescription,
    alternates: {
      canonical: getCanonicalUrl(resolvedLocale, "/"),
      languages: getLanguageAlternates("/"),
    },
    openGraph: {
      title: metadataDefaults.defaultTitle,
      description: metadataDefaults.defaultDescription,
      url: getCanonicalUrl(resolvedLocale, "/"),
      siteName: metadataDefaults.siteName,
      locale: metadataDefaults.locale,
      type: "website",
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
      site: metadataDefaults.twitterHandle,
      creator: metadataDefaults.twitterHandle,
    },
  };
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const homeContent = getHomeContent(resolvedLocale);
  const projects = featuredFirst(getProjects(resolvedLocale)).slice(0, 3);
  const writings = featuredFirst(getWritings(resolvedLocale)).slice(0, 3);
  const githubData = getGitHubContributions();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-24 space-y-16">
      <div className="relative min-h-[420px] [contain:layout] overflow-hidden" data-hero>
        <div
          className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.04] pointer-events-none [background-image:linear-gradient(var(--grid-color,#e5e7eb)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color,#e5e7eb)_1px,transparent_1px)] [background-size:24px_24px] [--grid-color:theme(colors.gray.300)] dark:[--grid-color:theme(colors.neutral.700)]"
          aria-hidden="true"
        />
        <HeroMotion>
          <header className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {siteProfile.siteName}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium">
              {siteProfile.role}
            </p>
            <MarkdownSnippet
              source={homeContent.hero.intro}
              className="prose dark:prose-invert text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed prose-p:my-0 prose-a:text-emerald-600 dark:prose-a:text-emerald-400"
            />
            <div className="prose dark:prose-invert text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              {homeContent.hero.paragraphs.map((paragraph) => (
                <MarkdownSnippet key={paragraph} source={paragraph} />
              ))}
            </div>
            <Link
              href={localizePath(resolvedLocale, homeContent.hero.aboutLink.href)}
              className="inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {homeContent.hero.aboutLink.label} →
            </Link>
          </header>
        </HeroMotion>
      </div>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          {homeContent.currentFocus.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {homeContent.currentFocus.description}
        </p>
        <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 leading-relaxed">
          {homeContent.currentFocus.paragraphs.map((paragraph) => (
            <MarkdownSnippet key={paragraph} source={paragraph} />
          ))}
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-gray-200 dark:border-gray-800 pb-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {homeContent.selectedWork.title}
          </h2>
          <Link
            href={localizePath(resolvedLocale, "/projects")}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {homeContent.selectedWork.viewAllLabel} →
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {homeContent.selectedWork.description}
        </p>
        {projects.length > 0 ? (
          <ProjectsListClient projects={projects} />
        ) : (
          <p className="text-gray-500 italic">{homeContent.selectedWork.emptyState}</p>
        )}
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-gray-200 dark:border-gray-800 pb-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {homeContent.recentThinking.title}
          </h2>
          <Link
            href={localizePath(resolvedLocale, "/writing")}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {homeContent.recentThinking.viewAllLabel} →
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {homeContent.recentThinking.description}
        </p>
        {writings.length > 0 ? (
          <WritingsListClient writings={writings} />
        ) : (
          <p className="text-gray-500 italic">{homeContent.recentThinking.emptyState}</p>
        )}
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          {homeContent.activity.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {homeContent.activity.description}
        </p>
        <GitHubGraphClient data={githubData} />
      </SectionReveal>

      <SectionReveal id="contact" className="pt-8 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          {siteProfile.contact.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg">
          {siteProfile.contact.description}
        </p>
        <ContactForm />
      </SectionReveal>
    </main>
  );
}
