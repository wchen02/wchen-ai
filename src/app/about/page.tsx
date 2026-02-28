import type { Metadata } from "next";
import ReachOutCTA from "@/components/ReachOutCTA";
import Headshot from "@/components/Headshot";
import SectionReveal from "@/components/SectionReveal";
import { SOCIAL_LINKS, SITE_URL } from "@/lib/site-config";

const aboutDescription =
  "Philosophy, interests, and background of Wilson Chen — founder and builder at the intersection of AI and developer tools.";
const ogImage = { url: "https://wchen.ai/og-default.png", width: 1200, height: 630, alt: "Wilson Chen — Founder & Builder" };

export const metadata: Metadata = {
  title: "About | Wilson Chen",
  description: aboutDescription,
  openGraph: {
    title: "About Wilson Chen",
    description: aboutDescription,
    url: "https://wchen.ai/about",
    siteName: "Wilson Chen",
    locale: "en_US",
    type: "profile",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Wilson Chen",
    description: aboutDescription,
    images: [ogImage.url],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Wilson Chen",
  url: SITE_URL,
  jobTitle: "Founder & Builder",
  sameAs: SOCIAL_LINKS.map((l) => l.url),
  image: `${SITE_URL}/headshot.jpg`,
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-24 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectionReveal className="space-y-6">
        <header className="flex flex-col sm:flex-row gap-6 items-start">
          <Headshot />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              About
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mt-4">
              I&apos;m Wensheng Chen; I go by Wilson. I build things at the intersection of artificial intelligence and
              developer tools. This page is a snapshot of what drives me, what I care
              about, and how I think about the work.
            </p>
          </div>
        </header>
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Philosophy
        </h2>
        <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 leading-relaxed max-w-none">
          <p>
            I believe the best tools disappear. The software worth building
            doesn&apos;t demand attention — it removes friction so quietly that
            people forget it&apos;s there. That conviction shapes everything I
            work on.
          </p>
          <p>
            Most of the technology industry optimizes for engagement. I&apos;m
            more interested in the opposite: building systems that help people
            spend less time in tools and more time in the work that matters to
            them. The measure of a great product isn&apos;t how long someone uses
            it — it&apos;s how quickly they achieve what they set out to do.
          </p>
          <p>
            I also believe in building in public and thinking out loud. Writing
            is how I stress-test ideas. Shipping is how I stress-test intuition.
            Both are necessary, and neither is sufficient alone.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Interests & Expertise
        </h2>
        <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 leading-relaxed max-w-none">
          <p>
            The problems I gravitate toward sit at the seam between how people
            think and how software works. A few areas I keep returning to:
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
              Context-Aware Agents
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Building AI systems that understand the full picture — not just the
              prompt, but the intent, history, and surrounding constraints that
              shape what someone actually needs.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
              Developer Experience
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              The gap between what a developer intends and what they have to type
              is still too wide. I&apos;m interested in tooling that closes that
              gap without adding new abstractions to learn.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
              Knowledge Systems
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              We generate more context than we can retain. I&apos;m drawn to
              systems that capture, connect, and surface knowledge at the moment
              it&apos;s actually useful.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
              Static-First Architecture
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              I favor systems that are fast by default, predictable to deploy,
              and resilient to failure. Complexity should be earned, not
              inherited.
            </p>
          </div>
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Background
        </h2>
        <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 leading-relaxed max-w-none">
          <p>
            I started my career at the Financial Times, where I spent close to
            five years as an engineer working across their digital platform. That
            experience gave me a deep appreciation for systems that serve millions
            of readers without getting in the way — tools that disappear.
          </p>
          <p>
            From there I founded Innovative Web Services and served as CTO for
            about three years, building custom web solutions for businesses that
            needed more than off-the-shelf templates could offer. After that I
            moved through a series of engineering roles — at Zume, then as a
            senior engineer at HubSpot and FullStory — each sharpening a
            different part of how I think about developer experience, data
            pipelines, and product quality.
          </p>
          <p>
            Most recently I served as CTO at The Juicy Crab, where I led the
            technology strategy for a growing restaurant group. Today I
            run{" "}
            <a href="https://bestpos.io" target="_blank" rel="noopener noreferrer">bestpos.io</a>,
            a restaurant marketing agency, and{" "}
            <a href="https://kloudeats.com" target="_blank" rel="noopener noreferrer">kloudeats.com</a>,
            a first-party online ordering platform — while continuing to build
            AI-powered developer tools on the side.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
          Principles I Build By
        </h2>
        <ul className="space-y-4">
          {[
            {
              principle: "Ship, then refine",
              detail:
                "Working software teaches you more than planning documents. Get something real in front of people early.",
            },
            {
              principle: "Complexity must be earned",
              detail:
                "Every abstraction, service, and dependency should justify its existence. Default to the simpler path.",
            },
            {
              principle: "Tools should disappear",
              detail:
                "The best software is invisible. If someone has to think about the tool instead of the work, the tool has failed.",
            },
          ].map((item) => (
            <li key={item.principle} className="flex gap-4">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {item.principle}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SectionReveal>

      <SectionReveal className="pt-8">
        <ReachOutCTA />
      </SectionReveal>
    </main>
  );
}
