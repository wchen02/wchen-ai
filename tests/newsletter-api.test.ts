import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NewsletterPayloadSchema } from "../shared/newsletter";
import { hmacSign } from "../shared/newsletter-crypto";
import { NEWSLETTER_TOKEN_MAX_AGE_S } from "../shared/newsletter-crypto";

// Mock Resend so API routes do not hit the real API
vi.mock("../shared/resend", () => ({
  sendResendEmail: vi.fn().mockResolvedValue(undefined),
  upsertResendContact: vi.fn().mockResolvedValue(undefined),
  updateResendContact: vi.fn().mockResolvedValue(undefined),
}));

describe("newsletter payload validation", () => {
  it("accepts valid email and empty honeypot", () => {
    const result = NewsletterPayloadSchema.safeParse({
      email: "reader@example.com",
      _honey: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("reader@example.com");
      expect(result.data._honey).toBe("");
    }
  });

  it("accepts optional locale", () => {
    const result = NewsletterPayloadSchema.safeParse({
      email: "user@site.com",
      _honey: "",
      locale: "es",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.locale).toBe("es");
  });

  it("rejects invalid email", () => {
    const result = NewsletterPayloadSchema.safeParse({
      email: "not-an-email",
      _honey: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = NewsletterPayloadSchema.safeParse({
      _honey: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects filled honeypot", () => {
    const result = NewsletterPayloadSchema.safeParse({
      email: "reader@example.com",
      _honey: "bot",
    });
    expect(result.success).toBe(false);
  });
});

describe("newsletter subscribe API", () => {
  let POST: (req: Request) => Promise<Response>;
  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../src/app/api/newsletter/route");
    POST = mod.POST;
  });

  afterEach(() => {
    delete process.env.NEWSLETTER_SECRET;
    delete process.env.RESEND_API_KEY;
  });

  it("returns 403 when Origin is not allowed", async () => {
    const req = new Request("https://example.com/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://evil.com" },
      body: JSON.stringify({ email: "user@example.com", _honey: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBeTruthy();
  });

  it("returns 400 and validation error for invalid email", async () => {
    const req = new Request("https://wchen.ai/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://wchen.ai" },
      body: JSON.stringify({ email: "invalid", _honey: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.details).toBeDefined();
    expect(json.details.some((d: { field: string }) => d.field === "email")).toBe(true);
  });

  it("returns 400 when honeypot is filled", async () => {
    const req = new Request("https://wchen.ai/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://wchen.ai" },
      body: JSON.stringify({ email: "user@example.com", _honey: "filled" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/invalid|submission/i);
  });

  it("returns 200 and success when env is unset (no email sent)", async () => {
    const req = new Request("https://wchen.ai/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://wchen.ai" },
      body: JSON.stringify({ email: "user@example.com", _honey: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toBeTruthy();
  });
});

describe("newsletter confirm API", () => {
  let POST: (req: Request) => Promise<Response>;
  const secret = "test-secret-at-least-32-characters-long";

  beforeEach(async () => {
    vi.resetModules();
    process.env.NEWSLETTER_SECRET = secret;
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_SEGMENT_ID = "seg_test";
    const mod = await import("../src/app/api/newsletter-confirm-local/route");
    POST = mod.POST;
  });

  afterEach(() => {
    delete process.env.NEWSLETTER_SECRET;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_SEGMENT_ID;
  });

  it("returns 400 when email, ts, or sig is missing", async () => {
    const req = new Request("https://wchen.ai/api/newsletter-confirm-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/confirmation/i);
  });

  it("returns 400 when token is expired", async () => {
    const ts = String(Math.floor(Date.now() / 1000) - NEWSLETTER_TOKEN_MAX_AGE_S - 60);
    const sig = await hmacSign(secret, `user@example.com|${ts}`);
    const req = new Request("https://wchen.ai/api/newsletter-confirm-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", ts, sig, locale: "en" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/expired/i);
  });

  it("returns 400 when signature is invalid", async () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const req = new Request("https://wchen.ai/api/newsletter-confirm-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "user@example.com",
        ts,
        sig: "wrong-signature",
        locale: "en",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/confirmation|invalid/i);
  });

  it("returns 200 and redirectTo when token is valid", async () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const sig = await hmacSign(secret, `subscriber@example.com|${ts}`);
    const req = new Request("https://wchen.ai/api/newsletter-confirm-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "subscriber@example.com",
        ts,
        sig,
        locale: "en",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.redirectTo).toBe("/newsletter-confirmed");
  });
});

describe("newsletter unsubscribe API", () => {
  let POST: (req: Request) => Promise<Response>;
  const secret = "test-secret-at-least-32-characters-long";

  beforeEach(async () => {
    vi.resetModules();
    process.env.NEWSLETTER_SECRET = secret;
    process.env.RESEND_API_KEY = "re_test";
    const mod = await import("../src/app/api/newsletter-unsubscribe-local/route");
    POST = mod.POST;
  });

  afterEach(() => {
    delete process.env.NEWSLETTER_SECRET;
    delete process.env.RESEND_API_KEY;
  });

  it("returns 400 when email or sig is missing", async () => {
    const req = new Request(
      "https://wchen.ai/api/newsletter-unsubscribe-local?email=user%40example.com"
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/unsubscribe|invalid/i);
  });

  it("returns 400 when signature is invalid", async () => {
    const req = new Request(
      "https://wchen.ai/api/newsletter-unsubscribe-local?email=user%40example.com&sig=wrong"
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/unsubscribe|invalid/i);
  });

  it("returns 200 and redirectTo when signature is valid", async () => {
    const sig = await hmacSign(secret, "user@example.com");
    const req = new Request(
      `https://wchen.ai/api/newsletter-unsubscribe-local?email=${encodeURIComponent("user@example.com")}&sig=${sig}&locale=en`
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.redirectTo).toMatch(/newsletter-unsubscribed/);
  });
});
