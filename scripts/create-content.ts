/**
 * Content creation script for the website-content skill.
 *
 * Loads the skill's guidelines and reference files, then calls a configured
 * LLM provider to generate site content (writing entries, project entries, or
 * site copy) and writes the resulting files to the repository.
 *
 * Usage:
 *   pnpm content:create --type writing --topic "Why I stopped using ORMs"
 *   pnpm content:create --type project --topic "My new CLI tool called driftctl"
 *   pnpm content:create --prompt "Update the about page philosophy section to reflect..."
 *   pnpm content:create --type writing --topic "AI agents" --slug ai-agents --locale en
 *
 * LLM provider (configure via env vars):
 *   LLM_PROVIDER=openai            (default) requires OPENAI_API_KEY
 *   LLM_PROVIDER=anthropic                   requires ANTHROPIC_API_KEY
 *   LLM_PROVIDER=google                      requires GOOGLE_API_KEY
 *   LLM_PROVIDER=openai-compatible           requires LLM_BASE_URL + LLM_API_KEY
 *   LLM_MODEL=gpt-4o               optional model override
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLLMProvider } from "../src/lib/llm";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_DIR = path.join(REPO_ROOT, ".agents/skills/website-content");

/** Directories under REPO_ROOT that the LLM is permitted to write into. */
const ALLOWED_OUTPUT_DIRS = ["content/", "public/writing/", "public/projects/"];

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): Record<string, string> {
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

function readSkillFile(relPath: string): string {
  const full = path.join(SKILL_DIR, relPath);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function writeContentFile(relPath: string, content: string): void {
  // Reject absolute paths and traversal sequences before joining.
  const normalized = relPath.replace(/\\/g, "/");
  if (path.isAbsolute(normalized) || normalized.includes("..")) {
    throw new Error(`[create-content] Unsafe file path rejected: ${relPath}`);
  }

  // Confirm the output path is in an allowed directory.
  const inAllowedDir = ALLOWED_OUTPUT_DIRS.some((dir) => normalized.startsWith(dir));
  if (!inAllowedDir) {
    throw new Error(
      `[create-content] Path not in an allowed output directory (${ALLOWED_OUTPUT_DIRS.join(", ")}): ${relPath}`
    );
  }

  const full = path.resolve(REPO_ROOT, relPath);

  // Double-check the resolved path is still inside REPO_ROOT.
  const repoRootWithSep = REPO_ROOT.endsWith(path.sep) ? REPO_ROOT : REPO_ROOT + path.sep;
  if (!full.startsWith(repoRootWithSep)) {
    throw new Error(`[create-content] Resolved path escapes repo root: ${full}`);
  }

  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log(`[create-content] wrote ${relPath}`);
}

// ---------------------------------------------------------------------------
// Response parsing
// ---------------------------------------------------------------------------

/**
 * Extracts file blocks from the LLM response.
 * Expects the LLM to output one or more blocks in the format:
 *
 *   <file path="content/writing/slug.mdx">
 *   ...file content...
 *   </file>
 */
function parseFileBlocks(response: string): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
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

function buildSystemPrompt(): string {
  const skill = readSkillFile("SKILL.md");
  const voice = readSkillFile("references/voice-guide.md");
  const schemas = readSkillFile("references/content-schemas.md");

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

function buildUserMessage(args: Record<string, string>): string {
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  let userMessage: string;
  try {
    userMessage = buildUserMessage(args);
  } catch (err) {
    console.error(`[create-content] ${(err as Error).message}`);
    process.exit(1);
  }

  const provider = getLLMProvider();
  console.log(`[create-content] Using LLM provider: ${provider.name}`);
  console.log(`[create-content] Task: ${userMessage}`);

  const systemPrompt = buildSystemPrompt();
  const result = await provider.generate({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    maxTokens: 4096,
  });

  const files = parseFileBlocks(result.content);

  if (files.length === 0) {
    console.error("[create-content] No file blocks found in the LLM response.");
    console.error("--- Raw response ---");
    console.error(result.content);
    process.exit(1);
  }

  for (const file of files) {
    writeContentFile(file.path, file.content);
  }

  console.log(`[create-content] Done. ${files.length} file(s) written.`);
}

main().catch((err: unknown) => {
  console.error("[create-content] Fatal:", err);
  process.exit(1);
});
