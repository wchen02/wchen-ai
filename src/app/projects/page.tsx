import { getProjects } from "@/lib/mdx";
import ProjectsFilter from "@/components/ProjectsFilter";
import ReachOutCTA from "@/components/ReachOutCTA";
import SectionReveal from "@/components/SectionReveal";
import { METADATA_DEFAULTS } from "@/lib/metadata-defaults";
import { SITE_PROFILE } from "@/lib/site-config";

const projectsDescription = SITE_PROFILE.projectsPage.metadataDescription;

export const metadata = {
  title: `Projects | ${SITE_PROFILE.siteName}`,
  description: projectsDescription,
  alternates: { canonical: `${METADATA_DEFAULTS.canonicalBaseUrl}/projects` },
  openGraph: {
    title: `Projects | ${SITE_PROFILE.siteName}`,
    description: projectsDescription,
    url: `${METADATA_DEFAULTS.canonicalBaseUrl}/projects`,
    siteName: METADATA_DEFAULTS.siteName,
    locale: METADATA_DEFAULTS.locale,
    type: "website",
    images: [{
      url: METADATA_DEFAULTS.defaultOgImageUrl,
      width: METADATA_DEFAULTS.defaultOgImageWidth,
      height: METADATA_DEFAULTS.defaultOgImageHeight,
      alt: `${SITE_PROFILE.siteName} — Projects`,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Projects | ${SITE_PROFILE.siteName}`,
    description: projectsDescription,
    images: [METADATA_DEFAULTS.defaultOgImageUrl],
  },
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-24 space-y-16">
      <SectionReveal className="space-y-4">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {SITE_PROFILE.projectsPage.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
            {SITE_PROFILE.projectsPage.intro}
          </p>
        </header>
      </SectionReveal>

      <SectionReveal>
        <ProjectsFilter projects={projects} />
      </SectionReveal>

      <SectionReveal className="pt-8">
        <ReachOutCTA />
      </SectionReveal>
    </main>
  );
}