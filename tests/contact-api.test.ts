import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const validPayload = {
  name: "Jane Founder",
  email: "jane@example.com",
  message: "I saw your latest project and would love to collaborate.",
  _honey: "",
};

describe("contact API", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.MAILGUN_API_KEY;
    delete process.env.MAILGUN_DOMAIN;
    delete process.env.MAILGUN_EU;
    const mod = await import("../src/app/api/contact/route");
    POST = mod.POST;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 and development message when Mailgun is not configured", async () => {
    const req = new Request("https://wchen.ai/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/development|received|not sent/i);
  });

  it("returns 200 and success message when Mailgun is configured and send succeeds", async () => {
    process.env.CONTACT_TO_EMAIL = "owner@example.com";
    process.env.MAILGUN_API_KEY = "key-test";
    process.env.MAILGUN_DOMAIN = "example.com";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 })
    );
    vi.resetModules();
    const mod = await import("../src/app/api/contact/route");
    POST = mod.POST;

    const req = new Request("https://wchen.ai/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/thanks|reaching out|get back/i);
  });

  it("returns 500 when Mailgun is configured but send fails", async () => {
    process.env.CONTACT_TO_EMAIL = "owner@example.com";
    process.env.MAILGUN_API_KEY = "key-test";
    process.env.MAILGUN_DOMAIN = "example.com";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve("Mailgun error") })
    );
    vi.resetModules();
    const mod = await import("../src/app/api/contact/route");
    POST = mod.POST;

    const req = new Request("https://wchen.ai/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/failed|send|try again/i);
  });

  it("returns 400 with validation details for missing name", async () => {
    const req = new Request("https://wchen.ai/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, name: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/validation/i);
    expect(json.details).toBeDefined();
    expect(json.details.some((d: { field: string }) => d.field === "name")).toBe(true);
  });

  it("returns 400 with validation details for invalid email", async () => {
    const req = new Request("https://wchen.ai/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, email: "not-an-email" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.details).toBeDefined();
    expect(json.details.some((d: { field: string }) => d.field === "email")).toBe(true);
  });

  it("returns 400 with validation details for message too short", async () => {
    const req = new Request("https://wchen.ai/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, message: "Hi" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.details).toBeDefined();
    expect(json.details.some((d: { field: string }) => d.field === "message")).toBe(true);
  });

  it("returns 400 for filled honeypot without exposing details", async () => {
    const req = new Request("https://wchen.ai/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validPayload, _honey: "bot" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/invalid|submission/i);
    expect(json.details).toBeUndefined();
  });

  it("returns 400 for empty body", async () => {
    const req = new Request("https://wchen.ai/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("returns 500 for invalid JSON body", async () => {
    const req = new Request("https://wchen.ai/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/failed|send|try again/i);
  });

  it("trims name and message before sending (email must be valid so no leading/trailing spaces)", async () => {
    process.env.CONTACT_TO_EMAIL = "owner@example.com";
    process.env.MAILGUN_API_KEY = "key-test";
    process.env.MAILGUN_DOMAIN = "example.com";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const mod = await import("../src/app/api/contact/route");
    POST = mod.POST;

    const req = new Request("https://wchen.ai/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "  Jane  ",
        email: "jane@example.com",
        message: "  Hello, this is a long enough message.  ",
        _honey: "",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    const body = (options?.body as string) ?? "";
    const decoded = decodeURIComponent(body.replace(/\+/g, " "));
    expect(decoded).toContain("Jane");
    expect(decoded).toContain("jane@example.com");
    expect(decoded).toContain("Hello, this is a long enough message");
  });
});
