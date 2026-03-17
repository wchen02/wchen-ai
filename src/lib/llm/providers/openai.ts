import type { LLMProvider, LLMGenerateOptions, LLMGenerateResult } from "../types";

interface OpenAIProviderOptions {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

/**
 * Creates an OpenAI (or OpenAI-compatible) LLM provider.
 * Uses the Chat Completions API endpoint.
 * Compatible with OpenAI, Azure OpenAI, Ollama, LM Studio, and other OpenAI-compatible hosts.
 */
export function createOpenAIProvider(options?: OpenAIProviderOptions): LLMProvider {
  const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY ?? "";
  const baseUrl = (options?.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = options?.model ?? process.env.LLM_MODEL ?? "gpt-4o";

  return {
    name: "openai",
    async generate({ messages, temperature = 0.7, maxTokens = 4096 }: LLMGenerateOptions): Promise<LLMGenerateResult> {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${text}`);
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };
      const content = data.choices[0]?.message?.content;
      if (!content) throw new Error("OpenAI API returned an empty response");
      return { content };
    },
  };
}
