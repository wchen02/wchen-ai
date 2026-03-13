import fs from 'fs';
import path from 'path';
import { getWritings, extractExcerpt } from '../src/lib/mdx';
import { DEFAULT_LOCALE } from '../src/lib/locales';
import { localizePath } from '../src/lib/i18n';
import { getSiteProfile, getSiteUrl } from '../src/lib/site-config';

async function generateRss() {
  console.log('Generating RSS feed...');

  const writings = getWritings(DEFAULT_LOCALE);
  const siteProfile = getSiteProfile(DEFAULT_LOCALE);
  const siteUrl = getSiteUrl(DEFAULT_LOCALE);

  const rssItems = writings.map(writing => {
    const excerpt = extractExcerpt(writing.content, 200);
    return `
    <item>
      <title><![CDATA[${writing.title}]]></title>
      <link>${siteUrl}${localizePath(DEFAULT_LOCALE, `/writing/${writing.slug}`)}</link>
      <guid isPermaLink="true">${siteUrl}${localizePath(DEFAULT_LOCALE, `/writing/${writing.slug}`)}</guid>
      <pubDate>${new Date(writing.publishDate).toUTCString()}</pubDate>
      <description><![CDATA[${excerpt}]]></description>
      <category>${writing.theme}</category>
    </item>`;
  }).join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteProfile.rss.title}</title>
    <link>${siteUrl}${localizePath(DEFAULT_LOCALE, '/writing')}</link>
    <description>${siteProfile.rss.description}</description>
    <language>${siteProfile.rss.language}</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssFeed);
  console.log('✅ Generated RSS feed at public/rss.xml');
}

generateRss();