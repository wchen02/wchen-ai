import type { Metadata } from "next";
import BackToTop from "@/components/BackToTop";
import LoadMoreProjects from "@/components/LoadMoreProjects";
import ProjectsFilter from "@/components/ProjectsFilter";
import NewsletterSlideout from "@/components/NewsletterSlideout";
import SectionReveal from "@/components/SectionReveal";
import { getProjects } from "@/lib/mdx";

const INITIAL_PROJECT_COUNT = 20;
import { getMetadataDefaults } from "@/lib/metadata-defaults";
import { getCanonicalUrl, getLanguageAlternates } from "@/lib/route-localization";
import { resolveLocale } from "@/lib/locales";
import { getSiteProfile } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const metadataDefaults = getMetadataDefaults(resolvedLocale);
  const projectsDescription = siteProfile.projectsPage.metadataDescription;

  return {
    title: `${siteProfile.projectsPage.metadataTitle} | ${siteProfile.siteName}`,
    description: projectsDescription,
    alternates: {
      canonical: getCanonicalUrl(resolvedLocale, "/projects"),
      languages: getLanguageAlternates("/projects"),
    },
    openGraph: {
      title: `${siteProfile.projectsPage.metadataTitle} | ${siteProfile.siteName}`,
      description: projectsDescription,
      url: getCanonicalUrl(resolvedLocale, "/projects"),
      siteName: metadataDefaults.siteName,
      locale: metadataDefaults.locale,
      type: "website",
      images: [
        {
          url: metadataDefaults.defaultOgImageUrl,
          width: metadataDefaults.defaultOgImageWidth,
          height: metadataDefaults.defaultOgImageHeight,
          alt: siteProfile.projectsPage.openGraphAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteProfile.projectsPage.metadataTitle} | ${siteProfile.siteName}`,
      description: projectsDescription,
      images: [metadataDefaults.defaultOgImageUrl],
    },
  };
}

export default async function LocalizedProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);
  const allProjects = getProjects(resolvedLocale);
  const initialProjects = allProjects.slice(0, INITIAL_PROJECT_COUNT);
  const totalCount = allProjects.length;

  return (
    <main id="page-top" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-24 space-y-16">
      <SectionReveal className="space-y-4">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {siteProfile.projectsPage.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
            {siteProfile.projectsPage.intro}
          </p>
        </header>
      </SectionReveal>

      <SectionReveal>
        <ProjectsFilter projects={initialProjects} />
      </SectionReveal>

      {totalCount > INITIAL_PROJECT_COUNT && (
        <SectionReveal>
          <LoadMoreProjects totalCount={totalCount} locale={resolvedLocale} />
        </SectionReveal>
      )}

      {totalCount > 0 && (
        <SectionReveal>
          <BackToTop section="projects" />
        </SectionReveal>
      )}

      <NewsletterSlideout />
    </main>
  );
}
