import { describe, it, expect } from 'vitest';
import { getProjects, getWritings, getProjectBySlug, getWritingBySlug, getGitHubContributions } from '@/lib/mdx';

describe('getProjects', () => {
  it('loads all project MDX files', () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThan(0);
  });

  it('returns projects sorted by date descending', () => {
    const projects = getProjects();
    for (let i = 1; i < projects.length; i++) {
      expect(new Date(projects[i - 1].date).getTime())
        .toBeGreaterThanOrEqual(new Date(projects[i].date).getTime());
    }
  });

  it('each project has required fields', () => {
    const projects = getProjects();
    for (const project of projects) {
      expect(project.slug).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.date).toBeTruthy();
      expect(project.status).toBeTruthy();
      expect(project.type.length).toBeGreaterThan(0);
      expect(project.motivation.length).toBeGreaterThanOrEqual(10);
      expect(project.problemAddressed.length).toBeGreaterThanOrEqual(10);
      expect(project.content).toBeDefined();
    }
  });

  it('has no duplicate slugs', () => {
    const projects = getProjects();
    const slugs = projects.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('getProjectBySlug', () => {
  it('returns a project for a valid slug', () => {
    const projects = getProjects();
    if (projects.length > 0) {
      const project = getProjectBySlug(projects[0].slug);
      expect(project).not.toBeNull();
      expect(project?.slug).toBe(projects[0].slug);
    }
  });

  it('returns null for an invalid slug', () => {
    const project = getProjectBySlug('nonexistent-project-slug');
    expect(project).toBeNull();
  });
});

describe('getWritings', () => {
  it('loads all non-draft writing MDX files', () => {
    const writings = getWritings();
    expect(writings.length).toBeGreaterThan(0);
  });

  it('returns writings sorted by date descending', () => {
    const writings = getWritings();
    for (let i = 1; i < writings.length; i++) {
      expect(new Date(writings[i - 1].publishDate).getTime())
        .toBeGreaterThanOrEqual(new Date(writings[i].publishDate).getTime());
    }
  });

  it('excludes drafts', () => {
    const writings = getWritings();
    for (const writing of writings) {
      expect(writing.draft).toBe(false);
    }
  });

  it('each writing has required fields', () => {
    const writings = getWritings();
    for (const writing of writings) {
      expect(writing.slug).toBeTruthy();
      expect(writing.title).toBeTruthy();
      expect(writing.publishDate).toBeTruthy();
      expect(writing.theme).toBeTruthy();
      expect(writing.content).toBeDefined();
      expect(writing.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    }
  });

  it('has no duplicate slugs', () => {
    const writings = getWritings();
    const slugs = writings.map(w => w.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('getWritingBySlug', () => {
  it('returns a writing for a valid slug', () => {
    const writings = getWritings();
    if (writings.length > 0) {
      const writing = getWritingBySlug(writings[0].slug);
      expect(writing).not.toBeNull();
      expect(writing?.slug).toBe(writings[0].slug);
    }
  });

  it('returns null for an invalid slug', () => {
    const writing = getWritingBySlug('nonexistent-writing-slug');
    expect(writing).toBeNull();
  });
});

describe('getGitHubContributions', () => {
  it('loads GitHub contribution data from public/', () => {
    const data = getGitHubContributions();
    // May be null if file doesn't exist, but should not throw
    if (data) {
      expect(data.totalContributions).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(data.weeks)).toBe(true);
    }
  });
});
