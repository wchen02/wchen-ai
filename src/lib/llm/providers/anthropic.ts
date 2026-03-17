import type { LLMProvider, LLMGenerateOptions, LLMGenerateResult, LLMMessage } from "../types";

interface AnthropicProviderOptions {
  apiKey?: string;
  model?: string;
}

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Creates an Anthropic LLM provider.
 * Uses the Messages API endpoint.
 */
export function createAnthropicProvider(options?: AnthropicProviderOptions): LLMProvider {
  const apiKey = options?.apiKey ?? process.env.ANTHROPIC_API_KEY ?? "";
  const model = options?.model ?? process.env.LLM_MODEL ?? "claude-opus-4-5";

  return {
    name: "anthropic",
    async generate({ messages, temperature = 0.7, maxTokens = 4096 }: LLMGenerateOptions): Promise<LLMGenerateResult> {
      const systemParts = messages.filter((m: LLMMessage) => m.role === "system").map((m: LLMMessage) => m.content);
      const conversationMessages: AnthropicMessage[] = messages
        .filter((m: LLMMessage) => m.role !== "system")
        .map((m: LLMMessage) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const body: Record<string, unknown> = {
        model,
        messages: conversationMessages,
        max_tokens: maxTokens,
        temperature,
      };
      if (systemParts.length > 0) {
        body.system = systemParts.join("\n\n");
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Anthropic API error ${response.status}: ${text}`);
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };
      const block = data.content.find((c) => c.type === "text");
      if (!block?.text) throw new Error("Anthropic API returned an empty response");
      return { content: block.text };
    },
  };
}
