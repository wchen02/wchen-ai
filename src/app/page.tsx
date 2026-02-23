import Link from "next/link";
import { getProjects } from "@/lib/mdx";
import ContactForm from "@/components/ContactForm";
import HeroMotion from "@/components/HeroMotion";
import GitHubGraph from "@/components/GitHubGraph";

export default function Home() {
  const projects = getProjects().slice(0, 3); // Get 3 most recent

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-24 space-y-16">
      {/* 15-Second Overview: Priority "what I'm exploring now" > problems > past work > contact */}
      
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
        </header>
      </HeroMotion>

      <section className="space-y-6">
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
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-gray-200 dark:border-gray-800 pb-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Selected Work
          </h2>
          <Link href="/projects" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            View all →
          </Link>
        </div>
        
        {projects.length > 0 ? (
          <div className="grid gap-6">
            {projects.map((project) => (
              <div key={project.slug} className="group flex flex-col gap-2 p-4 -mx-4 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                <Link href={`/projects/${project.slug}`} className="flex justify-between items-baseline">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {project.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {project.motivation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No projects added yet.</p>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Activity
        </h2>
        <GitHubGraph />
      </section>

      <section id="contact" className="pt-8">
        <h2 className="text-xl font-medium tracking-tight text-gray-900 dark:text-white mb-4">
          Let&apos;s collaborate
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg">
          I&apos;m always open to discussing new ideas, sharing insights, or exploring 
          how we can build the future together.
        </p>
        <ContactForm />
      </section>
    </main>
  );
}
