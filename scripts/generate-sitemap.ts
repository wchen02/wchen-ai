import fs from 'fs';
import path from 'path';
import { getProjects, getWritings } from '../src/lib/mdx';

const SITE_URL = 'https://wchen.ai';

function generateSitemap() {
  console.log('Generating sitemap...');

  const projects = getProjects();
  const writings = getWritings();

  const staticPages = ['', '/projects', '/writing'];

  const projectUrls = projects.map(p => `/projects/${p.slug}`);
  const writingUrls = writings.map(w => `/writing/${w.slug}`);

  const allUrls = [...staticPages, ...projectUrls, ...writingUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url}</loc>
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
