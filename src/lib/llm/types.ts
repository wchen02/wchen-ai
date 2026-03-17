export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMGenerateOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LLMGenerateResult {
  content: string;
}

export interface LLMProvider {
  name: string;
  generate(options: LLMGenerateOptions): Promise<LLMGenerateResult>;
}
