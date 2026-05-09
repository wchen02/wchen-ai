import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import InvestingCard from "../src/components/InvestingCard";
import ProjectCard from "../src/components/ProjectCard";
import WritingCard from "../src/components/WritingCard";
import type { Project, Writing } from "../src/lib/schemas";

const writingWithImage: Writing = {
  slug: "static-first-audio",
  title: "Read-along audio without a server",
  publishDate: "2026-03-14T12:00:00Z",
  theme: "Architecture",
  tags: ["static", "audio"],
  ogImage: "https://wchen.ai/writing/static-first-audio/feature.png",
  featured: false,
  draft: false,
  readingTimeMinutes: 3,
  excerpt: "Read-along audio on a website without adding a runtime.",
  content: "",
};

const investingWithImage: Writing = {
  ...writingWithImage,
  slug: "simple-macro-regime-tracker",
  title: "A Simple Macro Regime Tracker",
  theme: "Investing",
  ogImage: "https://wchen.ai/writing/simple-macro-regime-tracker/feature.png",
  investing: {
    kind: "process-note",
    showDecisionRecord: false,
    summary: "A simple market dashboard for checking risk appetite, breadth, stress, credit, and speculative liquidity.",
    catalysts: [],
    decisionTriggers: [],
  },
};

const projectWithImage: Project = {
  slug: "cursor-agent-learning",
  title: "Cursor agent learning lab",
  date: "2026-03-20T12:00:00Z",
  type: ["agent", "experiment", "skill"],
  motivation: "I wanted one small repo where I could master Cursor agent setup through experiments.",
  problemAddressed: "Most agent tutorials stop at prompts instead of showing repo-native configuration.",
  ogImage: "https://wchen.ai/projects/cursor-agent-learning/hero.jpg",
  featured: false,
  content: "",
};

describe("listing card feature images", () => {
  it("renders writing ogImage assets on writing listing cards", () => {
    const html = renderToStaticMarkup(<WritingCard writing={writingWithImage} locale="en" />);

    expect(html).toContain('src="/writing/static-first-audio/feature.png"');
    expect(html).toContain('alt="Read-along audio without a server"');
  });

  it("renders investing ogImage assets on investing listing cards", () => {
    const html = renderToStaticMarkup(<InvestingCard writing={investingWithImage} locale="en" />);

    expect(html).toContain('src="/writing/simple-macro-regime-tracker/feature.png"');
    expect(html).toContain('alt="A Simple Macro Regime Tracker"');
  });

  it("renders project ogImage assets on project listing cards", () => {
    const html = renderToStaticMarkup(<ProjectCard project={projectWithImage} locale="en" />);

    expect(html).toContain('src="/projects/cursor-agent-learning/hero.jpg"');
    expect(html).toContain('alt="Cursor agent learning lab"');
  });
});
