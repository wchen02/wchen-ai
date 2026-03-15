import type { LLMProvider } from "./types";
import { createOpenAIProvider } from "./providers/openai";
import { createAnthropicProvider } from "./providers/anthropic";

export type { LLMProvider, LLMMessage, LLMGenerateOptions, LLMGenerateResult } from "./types";
export { createOpenAIProvider } from "./providers/openai";
export { createAnthropicProvider } from "./providers/anthropic";

/**
 * Returns the LLM provider to use. Driven by env LLM_PROVIDER (default: "openai").
 *
 * Supported providers:
 *   - "openai"            → OpenAI Chat Completions (requires OPENAI_API_KEY)
 *   - "anthropic"         → Anthropic Messages API (requires ANTHROPIC_API_KEY)
 *   - "openai-compatible" → Any OpenAI-compatible endpoint (requires LLM_BASE_URL + LLM_API_KEY)
 *
 * Optional env vars:
 *   LLM_MODEL    → override the default model for the selected provider
 *   LLM_BASE_URL → base URL for "openai-compatible" provider (e.g., http://localhost:11434/v1 for Ollama)
 *   LLM_API_KEY  → API key for "openai-compatible" provider
 */
export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER ?? "openai";

  switch (provider) {
    case "anthropic":
      return createAnthropicProvider();
    case "openai-compatible":
      return createOpenAIProvider({
        baseUrl: process.env.LLM_BASE_URL,
        apiKey: process.env.LLM_API_KEY,
      });
    case "openai":
    default:
      return createOpenAIProvider();
  }
}
