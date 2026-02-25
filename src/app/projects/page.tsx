import { getProjects } from "@/lib/mdx";
import ProjectCard from "@/components/ProjectCard";
import ReachOutCTA from "@/components/ReachOutCTA";
import SectionReveal from "@/components/SectionReveal";

export const metadata = {
  title: "Projects | Wilson Chen",
  description: "Things I've built, including apps, agents, and experiments.",
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
        {projects.length > 0 ? (
          <div className="grid gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No projects found.</p>
        )}
      </SectionReveal>

      <SectionReveal className="pt-8">
        <ReachOutCTA />
      </SectionReveal>
    </main>
  );
}