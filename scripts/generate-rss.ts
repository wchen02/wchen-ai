import fs from 'fs';
import path from 'path';
import { getWritings, extractExcerpt } from '../src/lib/mdx';
import { SITE_PROFILE, SITE_URL } from '../src/lib/site-config';

async function generateRss() {
  console.log('Generating RSS feed...');

  const writings = getWritings();

  const rssItems = writings.map(writing => {
    const excerpt = extractExcerpt(writing.content, 200);
    return `
    <item>
      <title><![CDATA[${writing.title}]]></title>
      <link>${SITE_URL}/writing/${writing.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/writing/${writing.slug}</guid>
      <pubDate>${new Date(writing.publishDate).toUTCString()}</pubDate>
      <description><![CDATA[${excerpt}]]></description>
      <category>${writing.theme}</category>
    </item>`;
  }).join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_PROFILE.rss.title}</title>
    <link>${SITE_URL}/writing</link>
    <description>${SITE_PROFILE.rss.description}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
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