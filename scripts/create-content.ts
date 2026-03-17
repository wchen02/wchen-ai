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

import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLLMProvider } from "../src/lib/llm";
import {
  parseArgs,
  buildUserMessage,
  buildSystemPrompt,
  parseFileBlocks,
  writeContentFile,
} from "../src/lib/content-creation";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_DIR = path.join(REPO_ROOT, ".agents/skills/website-content");

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

  const systemPrompt = buildSystemPrompt(SKILL_DIR);
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
    writeContentFile(file.path, file.content, REPO_ROOT);
    console.log(`[create-content] wrote ${file.path}`);
  }

  console.log(`[create-content] Done. ${files.length} file(s) written.`);
}

main().catch((err: unknown) => {
  console.error("[create-content] Fatal:", err);
  process.exit(1);
});

