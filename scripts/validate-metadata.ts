/**
 * Validates required meta and JSON-LD on critical routes (T035).
 * Run after build (expects out/ directory). Reads built HTML and checks for required tags.
 * Contract: specs/003-website-improvements/contracts/page-metadata.md
 */
import fs from "fs";
import path from "path";
import { DEFAULT_LOCALE } from "../src/lib/locales";

const OUT = path.join(process.cwd(), "out");

interface CheckResult {
  route: string;
  ok: boolean;
  missing: string[];
}

function resolveHtmlPath(...relativePaths: string[]): string | null {
  for (const relativePath of relativePaths) {
    const fullPath = path.join(OUT, relativePath);
    if (fs.existsSync(fullPath)) {
      return relativePath;
    }
  }
  return null;
}

function readHtml(relativePath: string): string | null {
  const fullPath = path.join(OUT, relativePath);
  try {
    return fs.readFileSync(fullPath, "utf8");
  } catch {
    return null;
  }
}

function hasSubstring(html: string, pattern: RegExp | string): boolean {
  if (typeof pattern === "string") return html.includes(pattern);
  return pattern.test(html);
}

function checkPage(route: string, htmlPath: string, checks: { name: string; test: RegExp | string }[]): CheckResult {
  const html = readHtml(htmlPath);
  if (!html) {
    return { route, ok: false, missing: [`File not found: ${htmlPath}`] };
  }
  const missing = checks.filter((c) => !hasSubstring(html, c.test)).map((c) => c.name);
  return { route, ok: missing.length === 0, missing };
}

function getOneWritingSlug(): string | null {
  const writingDir = path.join(process.cwd(), "out", DEFAULT_LOCALE, "writing");
  if (!fs.existsSync(writingDir)) return null;
  const files = fs.readdirSync(writingDir).filter((f) => f.endsWith(".html"));
  if (files.length === 0) return null;
  return files[0].replace(/\.html$/, "");
}

function main(): void {
  console.log("Validating page metadata on critical routes...");

  const results: CheckResult[] = [];

  const metaChecks = [
    { name: "title", test: /<title>/ },
    { name: "meta description", test: /<meta[^>]+name=["']description["']/ },
    { name: "og:title", test: /<meta[^>]+property=["']og:title["']/ },
    { name: "og:description", test: /<meta[^>]+property=["']og:description["']/ },
    { name: "og:image", test: /<meta[^>]+property=["']og:image["']/ },
    { name: "og:url", test: /<meta[^>]+property=["']og:url["']/ },
    { name: "og:site_name", test: /<meta[^>]+property=["']og:site_name["']/ },
    { name: "og:locale", test: /<meta[^>]+property=["']og:locale["']/ },
    { name: "canonical", test: /<link[^>]+rel=["']canonical["']/ },
  ];

  const homePath = resolveHtmlPath(`${DEFAULT_LOCALE}.html`, path.join(DEFAULT_LOCALE, "index.html"));
  results.push(
    homePath
      ? checkPage("home", homePath, metaChecks)
      : { route: "home", ok: false, missing: ["Localized home export not found"] }
  );

  const aboutPath = resolveHtmlPath(
    path.join(DEFAULT_LOCALE, "about.html"),
    path.join(DEFAULT_LOCALE, "about", "index.html")
  );
  results.push(
    aboutPath
      ? checkPage("about", aboutPath, [
          ...metaChecks,
          { name: "Person JSON-LD", test: /"@type"\s*:\s*["']Person["']/ },
        ])
      : { route: "about", ok: false, missing: ["Localized about export not found"] }
  );

  const writingIndexPath = resolveHtmlPath(
    path.join(DEFAULT_LOCALE, "writing.html"),
    path.join(DEFAULT_LOCALE, "writing", "index.html")
  );
  results.push(
    writingIndexPath
      ? checkPage("writing index", writingIndexPath, metaChecks)
      : { route: "writing index", ok: false, missing: ["Localized writing index export not found"] }
  );

  const projectsIndexPath = resolveHtmlPath(
    path.join(DEFAULT_LOCALE, "projects.html"),
    path.join(DEFAULT_LOCALE, "projects", "index.html")
  );
  results.push(
    projectsIndexPath
      ? checkPage("projects index", projectsIndexPath, metaChecks)
      : { route: "projects index", ok: false, missing: ["Localized projects index export not found"] }
  );

  const writingSlug = getOneWritingSlug();
  if (writingSlug) {
    const writingDetailPath = resolveHtmlPath(
      path.join(DEFAULT_LOCALE, "writing", `${writingSlug}.html`),
      path.join(DEFAULT_LOCALE, "writing", writingSlug, "index.html")
    );
    results.push(
      writingDetailPath
        ? checkPage(`writing/${writingSlug}`, writingDetailPath, [
            ...metaChecks,
            { name: "Article JSON-LD", test: /"@type"\s*:\s*["']Article["']/ },
          ])
        : { route: `writing/${writingSlug}`, ok: false, missing: ["Localized writing detail export not found"] }
    );
  } else {
    results.push({ route: "writing (one)", ok: false, missing: ["No writing slug found in out/writing"] });
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error("\nMetadata validation failed:\n");
    for (const r of failed) {
      console.error(`  ${r.route}: missing ${r.missing.join(", ")}`);
    }
    process.exit(1);
  }

  console.log("All critical routes have required metadata and JSON-LD.");
}

main();
