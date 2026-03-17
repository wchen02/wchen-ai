import fs from "node:fs";
import path from "node:path";

export interface FileBlock {
  path: string;
  content: string;
}

/** Directories under repoRoot that the LLM is permitted to write into. */
export const ALLOWED_OUTPUT_DIRS = ["content/", "public/writing/", "public/projects/"];

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

/**
 * Parses `--key value` / `--flag` pairs from an argv array.
 * Pass the raw `process.argv` array; the first two entries are skipped.
 */
export function parseArgs(argv: string[]): Record<string, string> {
  const args = argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        result[key] = next;
        i++;
      } else {
        result[key] = "true";
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

/**
 * Reads a file relative to `skillDir`, returning `""` when the file does not exist.
 */
export function readSkillFile(skillDir: string, relPath: string): string {
  const full = path.join(skillDir, relPath);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

/**
 * Validates `relPath` against path-traversal and allowed-directory rules, then
 * writes `content` to `<repoRoot>/<relPath>`, creating parent directories as needed.
 *
 * Throws if the path is unsafe or resolves outside `repoRoot`.
 */
export function writeContentFile(relPath: string, content: string, repoRoot: string): void {
  const normalized = relPath.replace(/\\/g, "/");

  if (path.isAbsolute(normalized) || normalized.includes("..")) {
    throw new Error(`[create-content] Unsafe file path rejected: ${relPath}`);
  }

  const inAllowedDir = ALLOWED_OUTPUT_DIRS.some((dir) => normalized.startsWith(dir));
  if (!inAllowedDir) {
    throw new Error(
      `[create-content] Path not in an allowed output directory (${ALLOWED_OUTPUT_DIRS.join(", ")}): ${relPath}`
    );
  }

  const full = path.resolve(repoRoot, relPath);
  const repoRootWithSep = repoRoot.endsWith(path.sep) ? repoRoot : repoRoot + path.sep;
  if (!full.startsWith(repoRootWithSep)) {
    throw new Error(`[create-content] Resolved path escapes repo root: ${full}`);
  }

  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

// ---------------------------------------------------------------------------
// Response parsing
// ---------------------------------------------------------------------------

/**
 * Extracts `<file path="...">...</file>` blocks from the raw LLM response.
 * Returns an empty array when no blocks are found.
 */
export function parseFileBlocks(response: string): FileBlock[] {
  const files: FileBlock[] = [];
  const pattern = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(response)) !== null) {
    files.push({ path: match[1], content: match[2].trim() });
  }
  return files;
}

// ---------------------------------------------------------------------------
// Prompt assembly
// ---------------------------------------------------------------------------

/**
 * Builds the LLM system prompt by loading SKILL.md and the two reference files
 * from `skillDir`.  Missing files are silently replaced with an empty string.
 */
export function buildSystemPrompt(skillDir: string): string {
  const skill = readSkillFile(skillDir, "SKILL.md");
  const voice = readSkillFile(skillDir, "references/voice-guide.md");
  const schemas = readSkillFile(skillDir, "references/content-schemas.md");

  return [
    "You are a content author for a personal website. Follow the guidelines below precisely.",
    "",
    "## Skill guidelines",
    skill,
    "## Voice & Tone",
    voice,
    "## Content Schemas",
    schemas,
    "## Output format",
    "Output ONLY the files to create or update. Use the following block format for every file,",
    "with no additional text before, after, or between blocks:",
    "",
    '<file path="RELATIVE/PATH/FROM/REPO/ROOT.mdx">',
    "FILE CONTENT HERE",
    "</file>",
    "",
    "Use exact relative paths from the repository root (e.g. content/writing/slug.mdx).",
    "Do not wrap file content in markdown code fences.",
    "Do not add any explanation or commentary outside the file blocks.",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

/**
 * Builds the user-facing message from parsed CLI args.
 * Accepts either `--prompt` (free-form) or `--type` + `--topic` (structured).
 * Throws if the required combination is not supplied.
 */
export function buildUserMessage(args: Record<string, string>): string {
  if (args["prompt"]) {
    return args["prompt"];
  }

  const type = args["type"];
  const topic = args["topic"];
  if (!type || !topic) {
    throw new Error(
      "Provide either --prompt or both --type and --topic.\n" +
        "  --type    writing | project | homepage | about\n" +
        "  --topic   description of what to write\n" +
        "  --slug    optional slug override (for writing/project entries)\n" +
        "  --locale  optional locale (en | es | zh); omit for shared canonical entry"
    );
  }

  const parts = [`Create a ${type} entry about: ${topic}`];
  if (args["slug"]) parts.push(`Use slug: ${args["slug"]}`);
  if (args["locale"]) parts.push(`Write for locale: ${args["locale"]}`);
  return parts.join("\n");
}
