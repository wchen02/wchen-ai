import type { LLMProvider, LLMGenerateOptions, LLMGenerateResult, LLMMessage } from "../types";

interface GoogleProviderOptions {
  apiKey?: string;
  model?: string;
}

interface GoogleContentPart {
  text: string;
}

interface GoogleContent {
  role?: "user" | "model";
  parts: GoogleContentPart[];
}

/**
 * Creates a Google Gemini LLM provider.
 * Uses the Gemini generateContent REST API.
 * See: https://ai.google.dev/api/generate-content
 */
export function createGoogleProvider(options?: GoogleProviderOptions): LLMProvider {
  const apiKey = options?.apiKey ?? process.env.GOOGLE_API_KEY ?? "";
  const model = options?.model ?? process.env.LLM_MODEL ?? "gemini-2.0-flash";
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  return {
    name: "google",
    async generate({ messages, temperature = 0.7, maxTokens = 4096 }: LLMGenerateOptions): Promise<LLMGenerateResult> {
      const systemParts = messages.filter((m: LLMMessage) => m.role === "system").map((m: LLMMessage) => m.content);
      const contents: GoogleContent[] = messages
        .filter((m: LLMMessage) => m.role !== "system")
        .map((m: LLMMessage) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      };
      if (systemParts.length > 0) {
        body.systemInstruction = { parts: systemParts.map((t) => ({ text: t })) };
      }

      const response = await fetch(`${baseUrl}/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Google Gemini API error ${response.status}: ${text}`);
      }

      const data = (await response.json()) as {
        candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
      };
      const text = data.candidates[0]?.content?.parts[0]?.text;
      if (!text) throw new Error("Google Gemini API returned an empty response");
      return { content: text };
    },
  };
}
