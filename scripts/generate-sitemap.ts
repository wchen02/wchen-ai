import fs from 'fs';
import path from 'path';
import { getProjects, getWritings } from '../src/lib/mdx';

const SITE_URL = 'https://wchen.ai';

interface SitemapEntry {
  url: string;
  lastmod?: string;
}

function toDateString(isoDate: string): string {
  return isoDate.split('T')[0];
}

function generateSitemap() {
  console.log('Generating sitemap...');

  const projects = getProjects();
  const writings = getWritings();
  const buildDate = new Date().toISOString().split('T')[0];

  const entries: SitemapEntry[] = [
    { url: '', lastmod: buildDate },
    { url: '/about', lastmod: buildDate },
    { url: '/projects', lastmod: buildDate },
    { url: '/writing', lastmod: buildDate },
    ...projects.map(p => ({ url: `/projects/${p.slug}`, lastmod: toDateString(p.date) })),
    ...writings.map(w => ({ url: `/writing/${w.slug}`, lastmod: toDateString(w.updatedAt ?? w.publishDate) })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${SITE_URL}${entry.url}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('Generated sitemap at public/sitemap.xml');
}

generateSitemap();
