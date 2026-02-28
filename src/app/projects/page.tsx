import { getProjects } from "@/lib/mdx";
import ProjectsFilter from "@/components/ProjectsFilter";
import ReachOutCTA from "@/components/ReachOutCTA";
import SectionReveal from "@/components/SectionReveal";
import { METADATA_DEFAULTS } from "@/lib/metadata-defaults";

const projectsDescription = "Things I've built, including apps, agents, and experiments.";

export const metadata = {
  title: "Projects | Wilson Chen",
  description: projectsDescription,
  alternates: { canonical: `${METADATA_DEFAULTS.canonicalBaseUrl}/projects` },
  openGraph: {
    title: "Projects | Wilson Chen",
    description: projectsDescription,
    url: `${METADATA_DEFAULTS.canonicalBaseUrl}/projects`,
    siteName: METADATA_DEFAULTS.siteName,
    locale: METADATA_DEFAULTS.locale,
    type: "website",
    images: [{
      url: METADATA_DEFAULTS.defaultOgImageUrl,
      width: METADATA_DEFAULTS.defaultOgImageWidth,
      height: METADATA_DEFAULTS.defaultOgImageHeight,
      alt: "Wilson Chen — Projects",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Wilson Chen",
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
            Projects & Explorations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
            A collection of apps, agents, and experiments I&apos;ve built to explore new ideas
            and solve interesting problems.
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