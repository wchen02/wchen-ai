import { describe, it, expect } from 'vitest';
import { ProjectSchema, WritingSchema, ContactPayloadSchema, GitHubContributionSchema } from '@/lib/schemas';

describe('ProjectSchema', () => {
  const validProject = {
    title: 'Test Project',
    date: '2025-10-10T00:00:00Z',
    status: 'active',
    type: ['app'],
    motivation: 'This is the motivation for this project.',
    problemAddressed: 'This is the problem being addressed.',
  };

  it('accepts valid project frontmatter', () => {
    const result = ProjectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it('accepts all optional fields', () => {
    const result = ProjectSchema.safeParse({
      ...validProject,
      learnings: 'Learned a lot about testing.',
      url: 'https://example.com',
      github: 'https://github.com/example/repo',
      featured: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const rest = { ...validProject };
    delete (rest as Record<string, unknown>).title;
    const result = ProjectSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = ProjectSchema.safeParse({ ...validProject, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = ProjectSchema.safeParse({ ...validProject, date: 'not-a-date' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = ProjectSchema.safeParse({ ...validProject, status: 'unknown' });
    expect(result.success).toBe(false);
  });

  it('rejects empty type array', () => {
    const result = ProjectSchema.safeParse({ ...validProject, type: [] });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type values', () => {
    const result = ProjectSchema.safeParse({ ...validProject, type: ['webapp'] });
    expect(result.success).toBe(false);
  });

  it('accepts new project types (skill, library, tool)', () => {
    expect(ProjectSchema.safeParse({ ...validProject, type: ['skill'] }).success).toBe(true);
    expect(ProjectSchema.safeParse({ ...validProject, type: ['agent', 'skill'] }).success).toBe(true);
    expect(ProjectSchema.safeParse({ ...validProject, type: ['library'] }).success).toBe(true);
    expect(ProjectSchema.safeParse({ ...validProject, type: ['tool'] }).success).toBe(true);
  });

  it('rejects motivation shorter than 10 chars', () => {
    const result = ProjectSchema.safeParse({ ...validProject, motivation: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid URL format', () => {
    const result = ProjectSchema.safeParse({ ...validProject, url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('defaults featured to false', () => {
    const result = ProjectSchema.parse(validProject);
    expect(result.featured).toBe(false);
  });
});

describe('WritingSchema', () => {
  const validWriting = {
    title: 'Test Writing',
    publishDate: '2026-02-10T14:30:00Z',
    theme: 'Architecture',
  };

  it('accepts valid writing frontmatter', () => {
    const result = WritingSchema.safeParse(validWriting);
    expect(result.success).toBe(true);
  });

  it('accepts all optional fields', () => {
    const result = WritingSchema.safeParse({
      ...validWriting,
      updatedAt: '2026-02-11T10:00:00Z',
      tags: ['nextjs', 'static'],
      featured: true,
      draft: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const rest = { ...validWriting };
    delete (rest as Record<string, unknown>).title;
    const result = WritingSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid publishDate', () => {
    const result = WritingSchema.safeParse({ ...validWriting, publishDate: '2026-02-10' });
    expect(result.success).toBe(false);
  });

  it('rejects empty theme', () => {
    const result = WritingSchema.safeParse({ ...validWriting, theme: '' });
    expect(result.success).toBe(false);
  });

  it('defaults tags to empty array', () => {
    const result = WritingSchema.parse(validWriting);
    expect(result.tags).toEqual([]);
  });

  it('defaults draft to false', () => {
    const result = WritingSchema.parse(validWriting);
    expect(result.draft).toBe(false);
  });

  it('defaults featured to false', () => {
    const result = WritingSchema.parse(validWriting);
    expect(result.featured).toBe(false);
  });
});

describe('ContactPayloadSchema', () => {
  const validPayload = {
    name: 'Jane',
    email: 'jane@example.com',
    message: 'I would love to collaborate on something!',
    _honey: '',
  };

  it('accepts valid contact payload', () => {
    const result = ContactPayloadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = ContactPayloadSchema.safeParse({ ...validPayload, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = ContactPayloadSchema.safeParse({ ...validPayload, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects message shorter than 10 chars', () => {
    const result = ContactPayloadSchema.safeParse({ ...validPayload, message: 'Hi' });
    expect(result.success).toBe(false);
  });

  it('rejects non-empty honeypot (bot detection)', () => {
    const result = ContactPayloadSchema.safeParse({ ...validPayload, _honey: 'bot-value' });
    expect(result.success).toBe(false);
  });
});

describe('GitHubContributionSchema', () => {
  it('accepts valid contribution data', () => {
    const data = {
      totalContributions: 42,
      weeks: [
        {
          contributionDays: [
            { contributionCount: 5, date: '2026-01-01' },
            { contributionCount: 0, date: '2026-01-02' },
          ],
        },
      ],
    };
    const result = GitHubContributionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects missing totalContributions', () => {
    const result = GitHubContributionSchema.safeParse({ weeks: [] });
    expect(result.success).toBe(false);
  });

  it('rejects missing weeks', () => {
    const result = GitHubContributionSchema.safeParse({ totalContributions: 10 });
    expect(result.success).toBe(false);
  });
});
