/**
 * Validates required meta and JSON-LD on critical routes (T035).
 * Run after build (expects out/ directory). Reads built HTML and checks for required tags.
 * Contract: specs/003-website-improvements/contracts/page-metadata.md
 */
import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "out");

interface CheckResult {
  route: string;
  ok: boolean;
  missing: string[];
}

function readHtml(relativePath: string): string | null {
  const full = path.join(OUT, relativePath);
  try {
    return fs.readFileSync(full, "utf8");
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
  const writingDir = path.join(process.cwd(), "out", "writing");
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

  results.push(checkPage("home", "index.html", metaChecks));

  results.push(checkPage("about", "about.html", [
    ...metaChecks,
    { name: "Person JSON-LD", test: /"@type"\s*:\s*["']Person["']/ },
  ]));

  results.push(checkPage("writing index", "writing.html", metaChecks));
  results.push(checkPage("projects index", "projects.html", metaChecks));

  const writingSlug = getOneWritingSlug();
  if (writingSlug) {
    results.push(
      checkPage(`writing/${writingSlug}`, path.join("writing", `${writingSlug}.html`), [
        ...metaChecks,
        { name: "Article JSON-LD", test: /"@type"\s*:\s*["']Article["']/ },
      ])
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
