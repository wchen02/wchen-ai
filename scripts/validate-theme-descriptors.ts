/**
 * Warns when a writing theme has no descriptor in theme-config (T009).
 * Run during build or lint to keep theme descriptors in sync with content.
 */
import { getWritings } from "../src/lib/mdx";
import { THEME_DESCRIPTORS } from "../src/lib/theme-config";

function main(): void {
  const writings = getWritings();
  const themesUsed = new Set(writings.map((w) => w.theme));
  const missing = Array.from(themesUsed).filter((theme) => !(theme in THEME_DESCRIPTORS));

  if (missing.length > 0) {
    console.warn(
      "[validate-theme-descriptors] The following writing theme(s) have no descriptor in content/locales/en/site/ui.json:",
      missing.join(", ")
    );
    console.warn("Add entries to themeDescriptors for consistent writing index UX.");
    process.exit(1);
  }

  console.log("Theme descriptors OK: all writing themes have descriptors.");
}

main();
