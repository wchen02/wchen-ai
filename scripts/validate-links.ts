import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects');
const WRITING_DIR = path.join(CONTENT_DIR, 'writing');

const STATIC_ROUTES = new Set(['/', '/about', '/projects', '/writing']);

const INTERNAL_LINK_RE = /\[([^\]]*)\]\((\/[^)]+)\)/g;

function getMdxSlugs(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ''));
}

interface BrokenLink {
  file: string;
  link: string;
  text: string;
}

function validateLinks(): void {
  console.log('Validating internal links in content...');

  const projectSlugs = new Set(getMdxSlugs(PROJECTS_DIR));
  const writingSlugs = new Set(getMdxSlugs(WRITING_DIR));

  const validPaths = new Set<string>([
    ...STATIC_ROUTES,
    ...Array.from(projectSlugs).map((s) => `/projects/${s}`),
    ...Array.from(writingSlugs).map((s) => `/writing/${s}`),
  ]);

  const broken: BrokenLink[] = [];

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { content } = matter(raw);

      let match: RegExpExecArray | null;
      while ((match = INTERNAL_LINK_RE.exec(content)) !== null) {
        const [, text, link] = match;
        const cleanLink = link.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
        if (!validPaths.has(cleanLink)) {
          broken.push({ file: path.relative(process.cwd(), filePath), link, text });
        }
      }
    }
  }

  scanDirectory(PROJECTS_DIR);
  scanDirectory(WRITING_DIR);

  if (broken.length > 0) {
    console.error('\nBroken internal links detected:\n');
    for (const b of broken) {
      console.error(`  ${b.file}: [${b.text}](${b.link})`);
    }
    console.error(`\n${broken.length} broken link(s) found. Build aborted.`);
    process.exit(1);
  }

  console.log('All internal links valid.');
}

validateLinks();
