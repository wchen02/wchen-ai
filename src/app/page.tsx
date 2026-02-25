import Link from "next/link";
import { getProjects, getWritings, getGitHubContributions } from "@/lib/mdx";
import ContactForm from "@/components/ContactForm";
import HeroMotion from "@/components/HeroMotion";
import GitHubGraphClient from "@/components/GitHubGraphClient";
import ProjectsListClient from "@/components/ProjectsListClient";
import SectionReveal from "@/components/SectionReveal";
import WritingsListClient from "@/components/WritingsListClient";

function featuredFirst<T extends { featured: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
}

export default function Home() {
  const projects = featuredFirst(getProjects()).slice(0, 3);
  const writings = featuredFirst(getWritings()).slice(0, 3);
  const githubData = getGitHubContributions();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-24 space-y-16">
      {/* 15-Second Overview: Priority "what I'm exploring now" > problems > past work > contact */}
      
      <div className="relative min-h-[420px] md:min-h-[320px] [contain:layout] overflow-hidden" data-hero>
        <div className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.04] pointer-events-none [background-image:linear-gradient(var(--grid-color,#e5e7eb)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color,#e5e7eb)_1px,transparent_1px)] [background-size:24px_24px] [--grid-color:theme(colors.gray.300)] dark:[--grid-color:theme(colors.neutral.700)]" aria-hidden="true" />
        <HeroMotion>
          <header className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Wilson Chen
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium">
            Founder & Builder
          </p>
          <div className="prose dark:prose-invert text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
            <p>
              I am currently exploring the intersection of artificial intelligence and 
              developer tools, building systems that act as true thought partners.
            </p>
            <p>
              My primary focus right now is on reducing friction between intention and execution
              for software engineering teams through context-aware agents.
            </p>
          </div>
          <Link href="/about" className="inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            More about me & my philosophy →
          </Link>
        </header>
        </HeroMotion>
      </div>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Current Focus & Problems
        </h2>
        <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            The core problem I am obsessed with is knowledge fragmentation. We have more tools 
            than ever, yet context is continuously lost across platforms.
          </p>
          <p>
            I believe the next wave of foundational companies will be built around unifying 
            this context into seamless, invisible workflows rather than adding new dashboards.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-gray-200 dark:border-gray-800 pb-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Selected Work
          </h2>
          <Link href="/projects" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            View all →
          </Link>
        </div>
        
        {projects.length > 0 ? (
          <ProjectsListClient projects={projects} />
        ) : (
          <p className="text-gray-500 italic">No projects added yet.</p>
        )}
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-gray-200 dark:border-gray-800 pb-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Recent Thinking
          </h2>
          <Link href="/writing" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            View all →
          </Link>
        </div>

        {writings.length > 0 ? (
          <WritingsListClient writings={writings} />
        ) : (
          <p className="text-gray-500 italic">No writing yet.</p>
        )}
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Activity
        </h2>
        <GitHubGraphClient data={githubData} />
      </SectionReveal>

      <SectionReveal id="contact" className="pt-8">
        <h2 className="text-xl font-medium tracking-tight text-gray-900 dark:text-white mb-4">
          Let&apos;s collaborate
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg">
          I&apos;m always open to discussing new ideas, sharing insights, or exploring 
          how we can build the future together.
        </p>
        <ContactForm />
      </SectionReveal>
    </main>
  );
}
