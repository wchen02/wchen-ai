import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeOkFetch(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  });
}

function makeErrorFetch(status: number, text: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(text),
  });
}

const OPENAI_OK = {
  choices: [{ message: { content: "hello from openai" } }],
};
const ANTHROPIC_OK = {
  content: [{ type: "text", text: "hello from anthropic" }],
};
const GOOGLE_OK = {
  candidates: [{ content: { parts: [{ text: "hello from google" }] } }],
};

// ---------------------------------------------------------------------------
// getLLMProvider factory
// ---------------------------------------------------------------------------

describe("getLLMProvider", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.LLM_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.LLM_MODEL;
    delete process.env.LLM_BASE_URL;
    delete process.env.LLM_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns openai provider when LLM_PROVIDER is unset (default)', async () => {
    const { getLLMProvider } = await import("../src/lib/llm");
    const provider = getLLMProvider();
    expect(provider.name).toBe("openai");
  });

  it('returns openai provider when LLM_PROVIDER=openai', async () => {
    process.env.LLM_PROVIDER = "openai";
    const { getLLMProvider } = await import("../src/lib/llm");
    const provider = getLLMProvider();
    expect(provider.name).toBe("openai");
  });

  it('returns anthropic provider when LLM_PROVIDER=anthropic', async () => {
    process.env.LLM_PROVIDER = "anthropic";
    const { getLLMProvider } = await import("../src/lib/llm");
    const provider = getLLMProvider();
    expect(provider.name).toBe("anthropic");
  });

  it('returns google provider when LLM_PROVIDER=google', async () => {
    process.env.LLM_PROVIDER = "google";
    const { getLLMProvider } = await import("../src/lib/llm");
    const provider = getLLMProvider();
    expect(provider.name).toBe("google");
  });

  it('returns openai provider when LLM_PROVIDER=openai-compatible', async () => {
    process.env.LLM_PROVIDER = "openai-compatible";
    const { getLLMProvider } = await import("../src/lib/llm");
    const provider = getLLMProvider();
    expect(provider.name).toBe("openai");
  });

  it('falls back to openai for an unknown LLM_PROVIDER value', async () => {
    process.env.LLM_PROVIDER = "unknown-future-provider";
    const { getLLMProvider } = await import("../src/lib/llm");
    const provider = getLLMProvider();
    expect(provider.name).toBe("openai");
  });
});

// ---------------------------------------------------------------------------
// OpenAI provider
// ---------------------------------------------------------------------------

describe("createOpenAIProvider", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends a chat completions request with correct headers and body", async () => {
    const fetchMock = makeOkFetch(OPENAI_OK);
    vi.stubGlobal("fetch", fetchMock);

    const { createOpenAIProvider } = await import("../src/lib/llm/providers/openai");
    const provider = createOpenAIProvider({ apiKey: "sk-test", model: "gpt-4o" });
    const result = await provider.generate({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(result.content).toBe("hello from openai");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect((init.headers as Record<string, string>)["Authorization"]).toBe("Bearer sk-test");
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe("gpt-4o");
    expect(body.messages[0]).toEqual({ role: "user", content: "hello" });
  });

  it("uses LLM_BASE_URL and LLM_API_KEY when supplied via options (openai-compatible mode)", async () => {
    const fetchMock = makeOkFetch(OPENAI_OK);
    vi.stubGlobal("fetch", fetchMock);

    const { createOpenAIProvider } = await import("../src/lib/llm/providers/openai");
    const provider = createOpenAIProvider({
      baseUrl: "http://localhost:11434/v1",
      apiKey: "ollama",
      model: "llama3",
    });
    await provider.generate({ messages: [{ role: "user", content: "hi" }] });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:11434/v1/chat/completions");
  });

  it("does NOT consult LLM_BASE_URL when no baseUrl option is provided", async () => {
    process.env.LLM_BASE_URL = "http://should-not-be-used.example.com/v1";
    const fetchMock = makeOkFetch(OPENAI_OK);
    vi.stubGlobal("fetch", fetchMock);

    const { createOpenAIProvider } = await import("../src/lib/llm/providers/openai");
    const provider = createOpenAIProvider({ apiKey: "sk-real" });
    await provider.generate({ messages: [{ role: "user", content: "hi" }] });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");

    delete process.env.LLM_BASE_URL;
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", makeErrorFetch(401, "Unauthorized"));
    const { createOpenAIProvider } = await import("../src/lib/llm/providers/openai");
    const provider = createOpenAIProvider({ apiKey: "bad" });
    await expect(provider.generate({ messages: [{ role: "user", content: "hi" }] })).rejects.toThrow(
      "OpenAI API error 401"
    );
  });

  it("throws when response has no content", async () => {
    vi.stubGlobal("fetch", makeOkFetch({ choices: [{ message: { content: "" } }] }));
    const { createOpenAIProvider } = await import("../src/lib/llm/providers/openai");
    const provider = createOpenAIProvider({ apiKey: "sk-test" });
    await expect(provider.generate({ messages: [{ role: "user", content: "hi" }] })).rejects.toThrow(
      "empty response"
    );
  });
});

// ---------------------------------------------------------------------------
// Anthropic provider
// ---------------------------------------------------------------------------

describe("createAnthropicProvider", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends a messages request with correct headers and separates system from user messages", async () => {
    const fetchMock = makeOkFetch(ANTHROPIC_OK);
    vi.stubGlobal("fetch", fetchMock);

    const { createAnthropicProvider } = await import("../src/lib/llm/providers/anthropic");
    const provider = createAnthropicProvider({ apiKey: "sk-ant-test", model: "claude-opus-4-5" });
    const result = await provider.generate({
      messages: [
        { role: "system", content: "You are a writer." },
        { role: "user", content: "Write a haiku." },
      ],
    });

    expect(result.content).toBe("hello from anthropic");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("sk-ant-test");
    const body = JSON.parse(init.body as string);
    expect(body.system).toBe("You are a writer.");
    expect(body.messages).toEqual([{ role: "user", content: "Write a haiku." }]);
    expect(body.model).toBe("claude-opus-4-5");
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", makeErrorFetch(403, "Forbidden"));
    const { createAnthropicProvider } = await import("../src/lib/llm/providers/anthropic");
    const provider = createAnthropicProvider({ apiKey: "bad" });
    await expect(provider.generate({ messages: [{ role: "user", content: "hi" }] })).rejects.toThrow(
      "Anthropic API error 403"
    );
  });
});

// ---------------------------------------------------------------------------
// Google provider
// ---------------------------------------------------------------------------

describe("createGoogleProvider", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends a generateContent request with the API key in the URL and separates system instruction", async () => {
    const fetchMock = makeOkFetch(GOOGLE_OK);
    vi.stubGlobal("fetch", fetchMock);

    const { createGoogleProvider } = await import("../src/lib/llm/providers/google");
    const provider = createGoogleProvider({ apiKey: "AIzaSy-test", model: "gemini-2.0-flash" });
    const result = await provider.generate({
      messages: [
        { role: "system", content: "You are a writer." },
        { role: "user", content: "Write a haiku." },
      ],
    });

    expect(result.content).toBe("hello from google");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("gemini-2.0-flash:generateContent");
    expect(url).toContain("key=AIzaSy-test");
    const body = JSON.parse(init.body as string);
    expect(body.systemInstruction).toEqual({ parts: [{ text: "You are a writer." }] });
    expect(body.contents[0]).toEqual({ role: "user", parts: [{ text: "Write a haiku." }] });
  });

  it("maps assistant role to 'model' for Gemini", async () => {
    const fetchMock = makeOkFetch(GOOGLE_OK);
    vi.stubGlobal("fetch", fetchMock);

    const { createGoogleProvider } = await import("../src/lib/llm/providers/google");
    const provider = createGoogleProvider({ apiKey: "key", model: "gemini-2.0-flash" });
    await provider.generate({
      messages: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello" },
      ],
    });

    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.contents[1].role).toBe("model");
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", makeErrorFetch(400, "Bad Request"));
    const { createGoogleProvider } = await import("../src/lib/llm/providers/google");
    const provider = createGoogleProvider({ apiKey: "bad" });
    await expect(provider.generate({ messages: [{ role: "user", content: "hi" }] })).rejects.toThrow(
      "Google Gemini API error 400"
    );
  });
});
