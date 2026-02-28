/**
 * Build-time script: outputs public/search-index.json for client-side writing search (T019).
 * Contract: specs/003-website-improvements/contracts/search-index.md
 */
import fs from "fs";
import path from "path";
import { z } from "zod";
import { getWritings } from "../src/lib/mdx";

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
  const writings = getWritings();
  const entries = writings.map((w) => ({
    slug: w.slug,
    title: w.title,
    theme: w.theme,
    tags: w.tags ?? [],
  }));
  const themes = [...new Set(writings.map((w) => w.theme))].sort();

  const index = SearchIndexSchema.parse({ writings: entries, themes });
  const outPath = path.join(process.cwd(), "public", "search-index.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(index), "utf8");
  console.log(`Wrote ${outPath} (${entries.length} writings, ${themes.length} themes).`);
}

main();
