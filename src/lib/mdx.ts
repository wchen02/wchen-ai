import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ProjectSchema, WritingSchema, GitHubContributionSchema, type Project, type Writing, type GitHubContributions } from './schemas';

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

const CONTENT_DIR = path.join(process.cwd(), 'content');
const GITHUB_DATA_PATH = path.join(process.cwd(), 'public', 'github-contributions.json');
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects');
const WRITING_DIR = path.join(CONTENT_DIR, 'writing');

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

export function getProjects(): Project[] {
  const filenames = getMdxFilenames(PROJECTS_DIR);
  assertUniqueSlugs(filenames, 'project');
  
  const projects = filenames.map((filename): Project => {
    const rawContent = getFileContent(PROJECTS_DIR, filename);
    const { data, content } = matter(rawContent);
    const slug = filename.replace(/\.mdx?$/, '');
    
    const validatedData = ProjectSchema.parse(data);
    
    return { ...validatedData, slug, content };
  });
  
  // Sort projects by date descending
  return projects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getProjectBySlug(slug: string): Project | null {
  try {
    const filename = `${slug}.mdx`;
    // Try to read .mdx first, then .md
    let rawContent;
    try {
      rawContent = getFileContent(PROJECTS_DIR, filename);
    } catch {
      rawContent = getFileContent(PROJECTS_DIR, `${slug}.md`);
    }
    
    const { data, content } = matter(rawContent);
    const validatedData = ProjectSchema.parse(data);
    const project: Project = { ...validatedData, slug, content };
    return project;
  } catch {
    return null;
  }
}

export function getWritings(): Writing[] {
  const filenames = getMdxFilenames(WRITING_DIR);
  assertUniqueSlugs(filenames, 'writing');
  
  const writings = filenames.map((filename): Writing => {
    const rawContent = getFileContent(WRITING_DIR, filename);
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

export function getWritingBySlug(slug: string): Writing | null {
  try {
    const filename = `${slug}.mdx`;
    let rawContent;
    try {
      rawContent = getFileContent(WRITING_DIR, filename);
    } catch {
      rawContent = getFileContent(WRITING_DIR, `${slug}.md`);
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
