import type { LLMProvider } from "./types";
import { createOpenAIProvider } from "./providers/openai";
import { createAnthropicProvider } from "./providers/anthropic";
import { createGoogleProvider } from "./providers/google";

export type { LLMProvider, LLMMessage, LLMGenerateOptions, LLMGenerateResult } from "./types";
export { createOpenAIProvider } from "./providers/openai";
export { createAnthropicProvider } from "./providers/anthropic";
export { createGoogleProvider } from "./providers/google";

/**
 * Returns the LLM provider to use. Driven by env LLM_PROVIDER (default: "openai").
 *
 * Supported providers:
 *   - "openai"            → OpenAI Chat Completions (requires OPENAI_API_KEY)
 *                           Models: gpt-4o, o1, o3-mini, gpt-4-turbo, etc.
 *   - "anthropic"         → Anthropic Messages API (requires ANTHROPIC_API_KEY)
 *                           Models: claude-opus-4-5, claude-sonnet-4-5, claude-3-5-haiku, etc.
 *   - "google"            → Google Gemini API (requires GOOGLE_API_KEY)
 *                           Models: gemini-2.0-flash, gemini-1.5-pro, gemini-2.5-pro, etc.
 *   - "openai-compatible" → Any OpenAI-compatible endpoint (requires LLM_BASE_URL + LLM_API_KEY)
 *                           Works with: Mistral, Groq, xAI Grok, Together AI, Ollama, LM Studio, etc.
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
    case "google":
      return createGoogleProvider();
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
