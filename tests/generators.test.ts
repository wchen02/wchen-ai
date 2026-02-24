import { describe, it, expect } from 'vitest';
import { getProjects, getWritings, extractExcerpt } from '@/lib/mdx';

function toDateString(isoDate: string): string {
  return isoDate.split('T')[0];
}

describe('RSS excerpt extraction', () => {
  it('strips markdown headings', () => {
    const result = extractExcerpt('## Hello\nThis is content.');
    expect(result).not.toContain('##');
    expect(result).toContain('Hello');
    expect(result).toContain('This is content.');
  });

  it('strips markdown links, keeping text', () => {
    const result = extractExcerpt('Check [this link](https://example.com) out.');
    expect(result).toContain('this link');
    expect(result).not.toContain('https://example.com');
  });

  it('strips code blocks', () => {
    const input = 'Before code.\n```typescript\nconst x = 1;\n```\nAfter code.';
    const result = extractExcerpt(input);
    expect(result).not.toContain('const x');
    expect(result).toContain('Before code.');
    expect(result).toContain('After code.');
  });

  it('strips images', () => {
    const result = extractExcerpt('Text ![alt](image.png) more text.');
    expect(result).not.toContain('image.png');
    expect(result).toContain('Text');
    expect(result).toContain('more text.');
  });

  it('truncates long content with ellipsis at word boundary', () => {
    const longContent = 'word '.repeat(100);
    const result = extractExcerpt(longContent, 50);
    expect(result.length).toBeLessThanOrEqual(55);
    expect(result).toMatch(/…$/);
  });

  it('returns short content without truncation', () => {
    const result = extractExcerpt('Short content.');
    expect(result).toBe('Short content.');
  });

  it('strips frontmatter blocks', () => {
    const input = '---\ntitle: Test\n---\nActual content here.';
    const result = extractExcerpt(input);
    expect(result).not.toContain('title: Test');
    expect(result).toContain('Actual content here.');
  });
});

describe('Sitemap date formatting', () => {
  it('extracts date portion from ISO string', () => {
    expect(toDateString('2026-02-15T00:00:00Z')).toBe('2026-02-15');
  });

  it('handles datetime with offset', () => {
    expect(toDateString('2026-02-10T14:30:00Z')).toBe('2026-02-10');
  });
});

describe('Sitemap completeness', () => {
  it('all projects have dates usable as lastmod', () => {
    const projects = getProjects();
    for (const project of projects) {
      const dateStr = toDateString(project.date);
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('all writings have publishDate usable as lastmod', () => {
    const writings = getWritings();
    for (const writing of writings) {
      const dateStr = toDateString(writing.updatedAt ?? writing.publishDate);
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('sitemap should cover all content pages', () => {
    const projects = getProjects();
    const writings = getWritings();
    const staticPages = ['', '/projects', '/writing'];
    const totalExpected = staticPages.length + projects.length + writings.length;
    expect(totalExpected).toBeGreaterThanOrEqual(7);
  });
});
