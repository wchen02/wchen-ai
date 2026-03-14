/**
 * Build-time script: outputs public/search-index.json for client-side writing search (T019).
 * Contract: specs/003-website-improvements/contracts/search-index.md
 */
import fs from "fs";
import path from "path";
import { z } from "zod";
import { getWritings } from "../src/lib/mdx";
import { SUPPORTED_LOCALES } from "../src/lib/locales";
import { logger } from "../src/lib/logger";

const SearchEntrySchema = z.object({
  slug: z.string(),
  title: z.string(),
  theme: z.string(),
  tags: z.array(z.string()),
});

const SearchIndexSchema = z.object({
  writings: z.array(SearchEntrySchema),
  themes: z.array(z.string()),
});

function main(): void {
  for (const locale of SUPPORTED_LOCALES) {
    const writings = getWritings(locale);
    const entries = writings.map((writing) => ({
      slug: writing.slug,
      title: writing.title,
      theme: writing.theme,
      tags: writing.tags ?? [],
    }));
    const themes = [...new Set(writings.map((writing) => writing.theme))].sort();

    const index = SearchIndexSchema.parse({ writings: entries, themes });
    const outPath = path.join(process.cwd(), "public", "locales", locale, "search-index.json");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(index), "utf8");
    logger.log(`Wrote ${outPath} (${entries.length} writings, ${themes.length} themes).`);
  }
}

main();
