import { describe, expect, it } from "vitest";
import { getUiContent } from "@/lib/site-content";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { getWritingBySlug, getProjectBySlug } from "@/lib/mdx";

describe("comments: UI content", () => {
  it("comments heading and labels exist for default locale", () => {
    const ui = getUiContent("en").comments;
    expect(ui.heading).toBeTruthy();
    expect(ui.emptyState).toBeTruthy();
    expect(ui.nameLabel).toBeTruthy();
    expect(ui.namePlaceholder).toBeTruthy();
    expect(ui.bodyLabel).toBeTruthy();
    expect(ui.bodyPlaceholder).toBeTruthy();
    expect(ui.submitLabel).toBeTruthy();
    expect(ui.submittingLabel).toBeTruthy();
    expect(ui.submitErrorFallback).toBeTruthy();
  });

  it("comments UI content exists for all supported locales", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const ui = getUiContent(locale).comments;
      expect(ui.heading).toBeTruthy();
      expect(ui.submitLabel).toBeTruthy();
    }
  });
});

describe("comments: discussion term format", () => {
  /** Same format as writing/project pages: human-readable for GitHub Discussions. */
  function writingDiscussionTerm(title: string, locale: string): string {
    return `Writing: ${title} (${locale})`;
  }
  function projectDiscussionTerm(title: string, locale: string): string {
    return `Project: ${title} (${locale})`;
  }

  it("writing discussion term matches expected format", () => {
    const term = writingDiscussionTerm("My Article Title", "en");
    expect(term).toBe("Writing: My Article Title (en)");
    expect(term).toMatch(/^Writing: .+ \([a-z]{2}\)$/);
  });

  it("project discussion term matches expected format", () => {
    const term = projectDiscussionTerm("My Project", "es");
    expect(term).toBe("Project: My Project (es)");
    expect(term).toMatch(/^Project: .+ \([a-z]{2}\)$/);
  });

  it("discussion terms from real content are non-empty and human-readable", () => {
    const writing = getWritingBySlug("static-first", "en");
    const project = getProjectBySlug("website-content-skill", "en");
    expect(writing).toBeTruthy();
    expect(project).toBeTruthy();
    const writingTerm = writingDiscussionTerm(writing!.title, "en");
    const projectTerm = projectDiscussionTerm(project!.title, "en");
    expect(writingTerm.length).toBeGreaterThan(15);
    expect(projectTerm.length).toBeGreaterThan(15);
    expect(writingTerm).toContain("Writing:");
    expect(projectTerm).toContain("Project:");
    expect(writingTerm).toContain("(en)");
    expect(projectTerm).toContain("(en)");
  });
});
