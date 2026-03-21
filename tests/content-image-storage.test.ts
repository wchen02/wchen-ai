import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  siteAssetPathFromOgImageUrl,
  contentImageStorageKey,
  resolveDigestImageUrl,
} from "@/lib/content-image-storage";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.NEWSLETTER_IMAGE_PUBLIC_BASE_URL;
  delete process.env.R2_AUDIO_PUBLIC_BASE_URL;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("content-image-storage", () => {
  it("siteAssetPathFromOgImageUrl maps site URLs to public paths", () => {
    const origins = ["https://wchen.ai"];
    expect(siteAssetPathFromOgImageUrl("https://wchen.ai/writing/foo/bar.png", origins)).toBe(
      "/writing/foo/bar.png"
    );
    expect(siteAssetPathFromOgImageUrl("https://wchen.ai/en/writing/foo/bar.png", origins)).toBe(
      "/writing/foo/bar.png"
    );
    expect(siteAssetPathFromOgImageUrl("https://wchen.ai/zh/projects/foo/hero.jpg", origins)).toBe(
      "/projects/foo/hero.jpg"
    );
  });

  it("siteAssetPathFromOgImageUrl accepts www when apex is in the allow list", () => {
    expect(siteAssetPathFromOgImageUrl("https://www.wchen.ai/writing/foo/bar.png", ["https://wchen.ai"])).toBe(
      "/writing/foo/bar.png"
    );
    expect(siteAssetPathFromOgImageUrl("https://wchen.ai/writing/foo/bar.png", ["https://www.wchen.ai"])).toBe(
      "/writing/foo/bar.png"
    );
  });

  it("siteAssetPathFromOgImageUrl rejects non-whitelisted hosts", () => {
    expect(
      siteAssetPathFromOgImageUrl("https://evil.example/writing/foo/bar.png", ["https://wchen.ai"])
    ).toBeNull();
  });

  it("siteAssetPathFromOgImageUrl rejects paths outside writing/projects", () => {
    expect(siteAssetPathFromOgImageUrl("https://wchen.ai/en/other/x.png", ["https://wchen.ai"])).toBeNull();
  });

  it("contentImageStorageKey uses og/ prefix", () => {
    expect(contentImageStorageKey("/writing/a/b.png")).toBe("og/writing/a/b.png");
  });

  it("resolveDigestImageUrl points at CDN when R2_AUDIO_PUBLIC_BASE_URL is set", () => {
    process.env.R2_AUDIO_PUBLIC_BASE_URL = "https://cdn.example.com/";
    const url = resolveDigestImageUrl("https://wchen.ai/writing/foo/bar.png", "en");
    expect(url).toBe("https://cdn.example.com/og/writing/foo/bar.png");
  });

  it("resolveDigestImageUrl prefers NEWSLETTER_IMAGE_PUBLIC_BASE_URL over R2_AUDIO_PUBLIC_BASE_URL", () => {
    process.env.R2_AUDIO_PUBLIC_BASE_URL = "https://audio.example.com";
    process.env.NEWSLETTER_IMAGE_PUBLIC_BASE_URL = "https://images.example.com";
    const url = resolveDigestImageUrl("https://wchen.ai/writing/foo/bar.png", "en");
    expect(url).toBe("https://images.example.com/og/writing/foo/bar.png");
  });

  it("resolveDigestImageUrl leaves external og:image URLs unchanged when CDN base is set", () => {
    process.env.R2_AUDIO_PUBLIC_BASE_URL = "https://cdn.example.com";
    const url = resolveDigestImageUrl("https://images.unsplash.com/photo-1", "en");
    expect(url).toBe("https://images.unsplash.com/photo-1");
  });

  it("resolveDigestImageUrl uses absoluteUrl when no CDN base is configured", () => {
    const url = resolveDigestImageUrl("https://wchen.ai/writing/foo/bar.png", "en");
    expect(url).toBe("https://wchen.ai/writing/foo/bar.png");
  });
});
