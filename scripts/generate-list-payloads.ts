/**
 * Build-time script: outputs per-locale JSON payloads for client-side "load more"
 * on writing and projects index pages. Used to avoid sending full lists in initial HTML.
 */
import fs from "fs";
import path from "path";
import { getProjects, getWritings } from "../src/lib/mdx";
import { SUPPORTED_LOCALES } from "../src/lib/locales";
import { logger } from "../src/lib/logger";

function main(): void {
  const publicLocales = path.join(process.cwd(), "public", "locales");
  fs.mkdirSync(publicLocales, { recursive: true });

  for (const locale of SUPPORTED_LOCALES) {
    const localeDir = path.join(publicLocales, locale);
    fs.mkdirSync(localeDir, { recursive: true });

    const writings = getWritings(locale);
    const writingPayloads = writings.map((w) => ({
      slug: w.slug,
      title: w.title,
      theme: w.theme,
      tags: w.tags ?? [],
      publishDate: w.publishDate,
      updatedAt: w.updatedAt ?? null,
      readingTimeMinutes: w.readingTimeMinutes,
      excerpt: w.excerpt ?? "",
      featured: w.featured,
    }));
    const writingsPath = path.join(localeDir, "writings.json");
    fs.writeFileSync(writingsPath, JSON.stringify(writingPayloads), "utf8");
    logger.log(`Wrote ${writingsPath} (${writingPayloads.length} writings).`);

    const projects = getProjects(locale);
    const projectPayloads = projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      type: p.type,
      motivation: p.motivation,
      problemAddressed: p.problemAddressed,
      featured: p.featured,
    }));
    const projectsPath = path.join(localeDir, "projects.json");
    fs.writeFileSync(projectsPath, JSON.stringify(projectPayloads), "utf8");
    logger.log(`Wrote ${projectsPath} (${projectPayloads.length} projects).`);
  }
}

main();
