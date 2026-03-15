import { describe, expect, it, vi, beforeEach } from "vitest";
import { getNewsletterProvider } from "../src/lib/newsletter";

// Mock Resend so tests do not hit the real API
vi.mock("../shared/resend", () => ({
  sendResendEmail: vi.fn().mockResolvedValue(undefined),
  upsertResendContact: vi.fn().mockResolvedValue(undefined),
  listResendContactsBySegment: vi.fn().mockResolvedValue([]),
  updateResendContact: vi.fn().mockResolvedValue(undefined),
}));

describe("getNewsletterProvider", () => {
  beforeEach(() => {
    delete process.env.NEWSLETTER_PROVIDER;
  });

  it("returns a NewsletterProvider with name 'Resend' by default", () => {
    const provider = getNewsletterProvider("re_test_key");
    expect(provider.name).toBe("Resend");
  });

  it("returns a NewsletterProvider when NEWSLETTER_PROVIDER=resend", () => {
    process.env.NEWSLETTER_PROVIDER = "resend";
    const provider = getNewsletterProvider("re_test_key");
    expect(provider.name).toBe("Resend");
    delete process.env.NEWSLETTER_PROVIDER;
  });

  it("falls back to Resend for unknown NEWSLETTER_PROVIDER values", () => {
    process.env.NEWSLETTER_PROVIDER = "unknown-provider";
    const provider = getNewsletterProvider("re_test_key");
    expect(provider.name).toBe("Resend");
    delete process.env.NEWSLETTER_PROVIDER;
  });

  it("has sendEmail method", () => {
    const provider = getNewsletterProvider("re_test_key");
    expect(typeof provider.sendEmail).toBe("function");
  });

  it("has upsertContact method", () => {
    const provider = getNewsletterProvider("re_test_key");
    expect(typeof provider.upsertContact).toBe("function");
  });

  it("has listContacts method", () => {
    const provider = getNewsletterProvider("re_test_key");
    expect(typeof provider.listContacts).toBe("function");
  });

  it("has updateContact method", () => {
    const provider = getNewsletterProvider("re_test_key");
    expect(typeof provider.updateContact).toBe("function");
  });
});

describe("ResendNewsletterProvider", () => {
  it("delegates sendEmail to sendResendEmail with the correct params", async () => {
    const { sendResendEmail } = await import("../shared/resend");
    const provider = getNewsletterProvider("re_key");
    await provider.sendEmail({
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
      text: "Hello",
    });
    expect(sendResendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Hello</p>",
        text: "Hello",
      })
    );
  });

  it("delegates upsertContact to upsertResendContact mapping audienceId to segmentId", async () => {
    const { upsertResendContact } = await import("../shared/resend");
    const provider = getNewsletterProvider("re_key");
    await provider.upsertContact({
      email: "reader@example.com",
      audienceId: "seg_123",
      properties: { preferred_locale: "en" },
    });
    expect(upsertResendContact).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "reader@example.com",
        segmentId: "seg_123",
        properties: { preferred_locale: "en" },
      })
    );
  });

  it("delegates listContacts to listResendContactsBySegment mapping audienceId to segmentId", async () => {
    const { listResendContactsBySegment } = await import("../shared/resend");
    const provider = getNewsletterProvider("re_key");
    await provider.listContacts({ audienceId: "seg_456", pageSize: 50 });
    expect(listResendContactsBySegment).toHaveBeenCalledWith(
      expect.objectContaining({ segmentId: "seg_456", pageSize: 50 })
    );
  });

  it("delegates updateContact to updateResendContact", async () => {
    const { updateResendContact } = await import("../shared/resend");
    const provider = getNewsletterProvider("re_key");
    await provider.updateContact({ email: "reader@example.com", unsubscribed: true });
    expect(updateResendContact).toHaveBeenCalledWith(
      expect.objectContaining({ email: "reader@example.com", unsubscribed: true })
    );
  });

  it("returns NewsletterContact[] from listContacts", async () => {
    const { listResendContactsBySegment } = await import("../shared/resend");
    vi.mocked(listResendContactsBySegment).mockResolvedValueOnce([
      {
        id: "contact_1",
        email: "user@example.com",
        unsubscribed: false,
        created_at: "2024-01-01T00:00:00Z",
        preferred_locale: "en",
      },
    ]);
    const provider = getNewsletterProvider("re_key");
    const contacts = await provider.listContacts({ audienceId: "seg_789" });
    expect(contacts).toHaveLength(1);
    expect(contacts[0].email).toBe("user@example.com");
    expect(contacts[0].unsubscribed).toBe(false);
    expect(contacts[0].preferred_locale).toBe("en");
  });
});
