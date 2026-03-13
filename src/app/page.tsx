import Link from "next/link";
import { getProjects, getWritings, getGitHubContributions } from "@/lib/mdx";
import ContactForm from "@/components/ContactForm";
import HeroMotion from "@/components/HeroMotion";
import GitHubGraphClient from "@/components/GitHubGraphClient";
import MarkdownSnippet from "@/components/MarkdownSnippet";
import ProjectsListClient from "@/components/ProjectsListClient";
import SectionReveal from "@/components/SectionReveal";
import WritingsListClient from "@/components/WritingsListClient";
import { SITE_PROFILE } from "@/lib/site-config";
import { getHomeContent } from "@/lib/site-content";

function featuredFirst<T extends { featured: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
}

export default function Home() {
  const projects = featuredFirst(getProjects()).slice(0, 3);
  const writings = featuredFirst(getWritings()).slice(0, 3);
  const githubData = getGitHubContributions();
  const homeContent = getHomeContent();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-24 space-y-16">
      {/* 15-Second Overview: Priority "what I'm exploring now" > problems > past work > contact */}
      
      <div className="relative min-h-[420px] [contain:layout] overflow-hidden" data-hero>
        <div className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.04] pointer-events-none [background-image:linear-gradient(var(--grid-color,#e5e7eb)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color,#e5e7eb)_1px,transparent_1px)] [background-size:24px_24px] [--grid-color:theme(colors.gray.300)] dark:[--grid-color:theme(colors.neutral.700)]" aria-hidden="true" />
        <HeroMotion>
          <header className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {SITE_PROFILE.siteName}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium">
              {SITE_PROFILE.role}
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
              href={homeContent.hero.aboutLink.href}
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
          <Link href="/projects" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
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
          <Link href="/writing" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
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
          {SITE_PROFILE.contact.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg">
          {SITE_PROFILE.contact.description}
        </p>
        <ContactForm />
      </SectionReveal>
    </main>
  );
}
