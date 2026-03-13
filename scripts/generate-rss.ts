import fs from 'fs';
import path from 'path';
import { getWritings, extractExcerpt } from '../src/lib/mdx';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../src/lib/locales';
import { localizePath } from '../src/lib/i18n';
import { getSiteProfile, getSiteUrl } from '../src/lib/site-config';

const RSS_REL_PATH = (locale: SupportedLocale) => `/rss/${locale}.xml`;

async function generateRss() {
  console.log('Generating per-locale RSS feeds...');

  const publicDir = path.join(process.cwd(), 'public');
  const rssDir = path.join(publicDir, 'rss');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.mkdirSync(rssDir, { recursive: true });

  for (const locale of SUPPORTED_LOCALES) {
    const writings = getWritings(locale);
    const siteProfile = getSiteProfile(locale);
    const siteUrl = getSiteUrl(locale);
    const feedUrl = `${siteUrl}${RSS_REL_PATH(locale)}`;

    const rssItems = writings.map(writing => {
      const excerpt = extractExcerpt(writing.content, 200);
      return `
    <item>
      <title><![CDATA[${writing.title}]]></title>
      <link>${siteUrl}${localizePath(locale, `/writing/${writing.slug}`)}</link>
      <guid isPermaLink="true">${siteUrl}${localizePath(locale, `/writing/${writing.slug}`)}</guid>
      <pubDate>${new Date(writing.publishDate).toUTCString()}</pubDate>
      <description><![CDATA[${excerpt}]]></description>
      <category>${writing.theme}</category>
    </item>`;
    }).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteProfile.rss.title}</title>
    <link>${siteUrl}${localizePath(locale, '/writing')}</link>
    <description>${siteProfile.rss.description}</description>
    <language>${siteProfile.rss.language}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

    const outPath = path.join(rssDir, `${locale}.xml`);
    fs.writeFileSync(outPath, rssFeed);
    console.log(`✅ Generated RSS feed at public/rss/${locale}.xml`);
  }
}

generateRss();
