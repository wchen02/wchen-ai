import { describe, it, expect } from "vitest";
import { getMailProvider } from "../shared/resend";

/**
 * Unit tests for getMailProvider — the env-var-driven mail provider factory.
 * These tests exercise the factory logic directly without mocking, since the
 * factory only performs provider selection and credential validation (no network).
 */
describe("getMailProvider", () => {
  describe("default provider (resend)", () => {
    it("returns a MailProvider when RESEND_API_KEY is set and MAIL_PROVIDER is absent", () => {
      const provider = getMailProvider({ RESEND_API_KEY: "re_test_key" });
      expect(provider).not.toBeNull();
      expect(provider).toMatchObject({
        sendEmail: expect.any(Function),
        upsertContact: expect.any(Function),
        listContacts: expect.any(Function),
        updateContact: expect.any(Function),
      });
    });

    it("returns null when MAIL_PROVIDER is absent and RESEND_API_KEY is missing", () => {
      const provider = getMailProvider({});
      expect(provider).toBeNull();
    });

    it("returns null when MAIL_PROVIDER is absent and RESEND_API_KEY is empty string", () => {
      const provider = getMailProvider({ RESEND_API_KEY: "" });
      expect(provider).toBeNull();
    });
  });

  describe('explicit MAIL_PROVIDER="resend"', () => {
    it("returns a MailProvider when RESEND_API_KEY is set", () => {
      const provider = getMailProvider({
        MAIL_PROVIDER: "resend",
        RESEND_API_KEY: "re_test_key",
      });
      expect(provider).not.toBeNull();
      expect(provider).toMatchObject({
        sendEmail: expect.any(Function),
        upsertContact: expect.any(Function),
        listContacts: expect.any(Function),
        updateContact: expect.any(Function),
      });
    });

    it("returns null when RESEND_API_KEY is absent", () => {
      const provider = getMailProvider({ MAIL_PROVIDER: "resend" });
      expect(provider).toBeNull();
    });

    it("returns null when RESEND_API_KEY is empty string", () => {
      const provider = getMailProvider({ MAIL_PROVIDER: "resend", RESEND_API_KEY: "" });
      expect(provider).toBeNull();
    });
  });

  describe("unknown MAIL_PROVIDER value", () => {
    it("throws for an unknown provider name", () => {
      expect(() =>
        getMailProvider({ MAIL_PROVIDER: "sendgrid", RESEND_API_KEY: "re_test_key" })
      ).toThrow(/Unknown MAIL_PROVIDER.*sendgrid/);
    });

    it("throws for another unknown provider name", () => {
      expect(() =>
        getMailProvider({ MAIL_PROVIDER: "mailgun", RESEND_API_KEY: "re_test_key" })
      ).toThrow(/Unknown MAIL_PROVIDER.*mailgun/);
    });
  });

  describe("provider shape", () => {
    it("returned provider exposes all four MailProvider methods", () => {
      const provider = getMailProvider({ RESEND_API_KEY: "re_test_key" });
      expect(provider).not.toBeNull();
      if (!provider) return;
      expect(typeof provider.sendEmail).toBe("function");
      expect(typeof provider.upsertContact).toBe("function");
      expect(typeof provider.listContacts).toBe("function");
      expect(typeof provider.updateContact).toBe("function");
    });
  });
});
