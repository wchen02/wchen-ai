import crypto from "crypto";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ProjectSchema, WritingSchema, GitHubContributionSchema, type Project, type Writing, type GitHubContributions } from "./schemas";
import { DEFAULT_LOCALE } from "./locales";
import { mdxToAudioText } from "./audio-text";

function hashRawFileContent(raw: string): string {
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex").slice(0, 16);
}

export interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractHeadings(content: string): TOCItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TOCItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    items.push({ id, text, level });
  }
  return items;
}

const EXCERPT_LENGTH = 160;

export function extractExcerpt(mdxContent: string, maxLength = EXCERPT_LENGTH): string {
  const plain = mdxContent
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_~`>]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/**
 * Converts MDX/markdown body to plain text for TTS or other uses.
 * Strips frontmatter, code blocks, images; keeps link text; removes markdown syntax.
 */
export function mdxToPlainText(mdxContent: string): string {
  return mdxToAudioText(mdxContent);
}

const CONTENT_DIR = path.join(process.cwd(), 'content');
const GITHUB_DATA_PATH = path.join(process.cwd(), 'public', 'github-contributions.json');

function getLocaleContentRoot(locale = DEFAULT_LOCALE, baseContentDir = CONTENT_DIR): string {
  const normalizedLocale = locale.trim().toLowerCase().replace(/_/g, '-');
  return path.join(baseContentDir, 'locales', normalizedLocale);
}

function getProjectsDir(locale = DEFAULT_LOCALE, baseContentDir = CONTENT_DIR): string {
  const localeDir = path.join(getLocaleContentRoot(locale, baseContentDir), 'projects');
  const legacyDir = path.join(baseContentDir, 'projects');
  return fs.existsSync(localeDir) ? localeDir : legacyDir;
}

function getWritingDir(locale = DEFAULT_LOCALE, baseContentDir = CONTENT_DIR): string {
  const localeDir = path.join(getLocaleContentRoot(locale, baseContentDir), 'writing');
  const legacyDir = path.join(baseContentDir, 'writing');
  return fs.existsSync(localeDir) ? localeDir : legacyDir;
}

// Helper to get raw file content
function getFileContent(directory: string, filename: string) {
  const filePath = path.join(directory, filename);
  return fs.readFileSync(filePath, 'utf8');
}

// Helper to get all MDX filenames
function getMdxFilenames(directory: string) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter((file) => /\.mdx?$/.test(file));
}

function assertUniqueSlugs(filenames: string[], contentType: string): void {
  const slugs = filenames.map(f => f.replace(/\.mdx?$/, ''));
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) {
      throw new Error(`Duplicate ${contentType} slug detected: "${slug}". Each ${contentType} must have a unique filename.`);
    }
    seen.add(slug);
  }
}

export function getProjects(locale = DEFAULT_LOCALE, baseContentDir = CONTENT_DIR): Project[] {
  const projectsDir = getProjectsDir(locale, baseContentDir);
  const filenames = getMdxFilenames(projectsDir);
  assertUniqueSlugs(filenames, 'project');
  
  const projects = filenames.map((filename): Project => {
    const rawContent = getFileContent(projectsDir, filename);
    const { data, content } = matter(rawContent);
    const slug = filename.replace(/\.mdx?$/, '');
    
    const validatedData = ProjectSchema.parse(data);
    
    return { ...validatedData, slug, content };
  });
  
  // Sort projects by date descending
  return projects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getProjectBySlug(
  slug: string,
  locale = DEFAULT_LOCALE,
  baseContentDir = CONTENT_DIR
): Project | null {
  try {
    const projectsDir = getProjectsDir(locale, baseContentDir);
    const filename = `${slug}.mdx`;
    // Try to read .mdx first, then .md
    let rawContent;
    try {
      rawContent = getFileContent(projectsDir, filename);
    } catch {
      rawContent = getFileContent(projectsDir, `${slug}.md`);
    }
    
    const { data, content } = matter(rawContent);
    const validatedData = ProjectSchema.parse(data);
    const project: Project = { ...validatedData, slug, content };
    return project;
  } catch {
    return null;
  }
}

export function getWritings(locale = DEFAULT_LOCALE, baseContentDir = CONTENT_DIR): Writing[] {
  const writingDir = getWritingDir(locale, baseContentDir);
  const filenames = getMdxFilenames(writingDir);
  assertUniqueSlugs(filenames, 'writing');
  
  const writings = filenames.map((filename): Writing => {
    const rawContent = getFileContent(writingDir, filename);
    const { data, content } = matter(rawContent);
    const slug = filename.replace(/\.mdx?$/, '');
    
    const validatedData = WritingSchema.parse(data);
    
    const wordCount = content.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200) || 1;

    if (!validatedData.draft && (wordCount < 200 || wordCount > 1500)) {
      console.warn(
        `[content] Writing "${validatedData.title}" (${slug}) has ${wordCount} words (expected 200–1500).`
      );
    }
    
    return { ...validatedData, slug, content, readingTimeMinutes, excerpt: extractExcerpt(content, 160) };
  });
  
  // Filter out drafts and sort by date descending
  return writings
    .filter((w) => !w.draft)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}

export function getGitHubContributions(): GitHubContributions | null {
  try {
    const raw = fs.readFileSync(GITHUB_DATA_PATH, 'utf8');
    return GitHubContributionSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function getRelatedWritings(
  currentSlug: string,
  limit = 3,
  locale = DEFAULT_LOCALE,
  baseContentDir = CONTENT_DIR
): Writing[] {
  const all = getWritings(locale, baseContentDir);
  const current = all.find((w) => w.slug === currentSlug);
  if (!current) return all.slice(0, limit);

  const candidates = all.filter((w) => w.slug !== currentSlug);
  if (candidates.length === 0) return [];

  const scored = candidates.map((w) => {
    let score = 0;
    if (w.theme === current.theme) score += 3;
    const overlap = w.tags.filter((t) => current.tags.includes(t)).length;
    score += overlap;
    return { writing: w, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.writing.publishDate).getTime() - new Date(a.writing.publishDate).getTime();
  });

  return scored.slice(0, limit).map((s) => s.writing);
}

export function getWritingBySlug(
  slug: string,
  locale = DEFAULT_LOCALE,
  baseContentDir = CONTENT_DIR
): Writing | null {
  try {
    const writingDir = getWritingDir(locale, baseContentDir);
    const filename = `${slug}.mdx`;
    let rawContent;
    try {
      rawContent = getFileContent(writingDir, filename);
    } catch {
      rawContent = getFileContent(writingDir, `${slug}.md`);
    }
    
    const { data, content } = matter(rawContent);
    const validatedData = WritingSchema.parse(data);
    
    if (validatedData.draft) {
        return null;
    }
    
    const wordCount = content.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200) || 1;
    
    const writing: Writing = { ...validatedData, slug, content, readingTimeMinutes, excerpt: extractExcerpt(content, 160) };
    return writing;
  } catch {
    return null;
  }
}

export function getWritingContentVersion(
  slug: string,
  locale = DEFAULT_LOCALE,
  baseContentDir = CONTENT_DIR
): string {
  const writingDir = getWritingDir(locale, baseContentDir);
  let rawContent: string;
  try {
    rawContent = getFileContent(writingDir, `${slug}.mdx`);
  } catch {
    rawContent = getFileContent(writingDir, `${slug}.md`);
  }
  const { data } = matter(rawContent);
  const validated = WritingSchema.safeParse(data);
  if (validated.success && validated.data.updatedAt) {
    return validated.data.updatedAt;
  }
  return hashRawFileContent(rawContent);
}

export function getProjectContentVersion(
  slug: string,
  locale = DEFAULT_LOCALE,
  baseContentDir = CONTENT_DIR
): string {
  const projectsDir = getProjectsDir(locale, baseContentDir);
  let rawContent: string;
  try {
    rawContent = getFileContent(projectsDir, `${slug}.mdx`);
  } catch {
    rawContent = getFileContent(projectsDir, `${slug}.md`);
  }
  return hashRawFileContent(rawContent);
}
