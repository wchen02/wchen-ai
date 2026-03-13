import fs from 'fs';
import path from 'path';
import { getProjects, getWritings } from '../src/lib/mdx';
import { SITE_URL } from '../src/lib/site-config';
import { SUPPORTED_LOCALES } from '../src/lib/locales';
import { localizePath } from '../src/lib/i18n';

interface SitemapEntry {
  url: string;
  lastmod?: string;
}

function toDateString(isoDate: string): string {
  return isoDate.split('T')[0];
}

function generateSitemap() {
  console.log('Generating sitemap...');
  const buildDate = new Date().toISOString().split('T')[0];
  const entries: SitemapEntry[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    const projects = getProjects(locale);
    const writings = getWritings(locale);

    entries.push(
      { url: localizePath(locale, '/'), lastmod: buildDate },
      { url: localizePath(locale, '/about'), lastmod: buildDate },
      { url: localizePath(locale, '/projects'), lastmod: buildDate },
      { url: localizePath(locale, '/writing'), lastmod: buildDate },
      ...projects.map(p => ({ url: localizePath(locale, `/projects/${p.slug}`), lastmod: toDateString(p.date) })),
      ...writings.map(w => ({ url: localizePath(locale, `/writing/${w.slug}`), lastmod: toDateString(w.updatedAt ?? w.publishDate) }))
    );
  }

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
