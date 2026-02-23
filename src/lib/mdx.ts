import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ProjectSchema, WritingSchema, type Project, type Writing } from './schemas';

const CONTENT_DIR = path.join(process.cwd(), 'content');
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

export function getProjects(): Project[] {
  const filenames = getMdxFilenames(PROJECTS_DIR);
  
  const projects = filenames.map((filename) => {
    const rawContent = getFileContent(PROJECTS_DIR, filename);
    const { data, content } = matter(rawContent);
    const slug = filename.replace(/\.mdx?$/, '');
    
    // Validate frontmatter using Zod. Will throw if invalid, stopping the build.
    const validatedData = ProjectSchema.parse(data);
    
    return {
      ...validatedData,
      slug,
      content,
    } as Project;
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
    
    return {
      ...validatedData,
      slug,
      content,
    } as Project;
  } catch (error) {
    return null;
  }
}

export function getWritings(): Writing[] {
  const filenames = getMdxFilenames(WRITING_DIR);
  
  const writings = filenames.map((filename) => {
    const rawContent = getFileContent(WRITING_DIR, filename);
    const { data, content } = matter(rawContent);
    const slug = filename.replace(/\.mdx?$/, '');
    
    // Validate frontmatter using Zod
    const validatedData = WritingSchema.parse(data);
    
    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = content.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200) || 1;
    
    return {
      ...validatedData,
      slug,
      content,
      readingTimeMinutes,
    } as Writing;
  });
  
  // Filter out drafts and sort by date descending
  return writings
    .filter((w) => !w.draft)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
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
    
    return {
      ...validatedData,
      slug,
      content,
      readingTimeMinutes,
    } as Writing;
  } catch (error) {
    return null;
  }
}
