import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createEmptyAudioManifest, registerAudioManifestEntry } from "@/lib/audio-manifest";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.AUDIO_SOURCE;
  delete process.env.R2_AUDIO_PUBLIC_BASE_URL;
  vi.restoreAllMocks();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe("createEmptyAudioManifest", () => {
  it("returns an empty object", () => {
    const manifest = createEmptyAudioManifest();
    expect(manifest).toEqual({});
    expect(Object.keys(manifest)).toHaveLength(0);
  });
});

describe("registerAudioManifestEntry", () => {
  it("adds entry for new locale and content type", () => {
    const manifest = createEmptyAudioManifest();
    registerAudioManifestEntry(manifest, "en", "writing", "my-slug", { hasSubtitles: true });

    expect(manifest.en).toBeDefined();
    expect(manifest.en.writing).toBeDefined();
    expect(manifest.en.projects).toEqual({});
    expect(manifest.en.writing["my-slug"]).toEqual({ hasSubtitles: true });
  });

  it("adds entry for projects content type", () => {
    const manifest = createEmptyAudioManifest();
    registerAudioManifestEntry(manifest, "es", "projects", "my-project", { hasSubtitles: false });

    expect(manifest.es.projects["my-project"]).toEqual({ hasSubtitles: false });
    expect(manifest.es.writing).toEqual({});
  });

  it("adds entry for investing content type", () => {
    const manifest = createEmptyAudioManifest();
    registerAudioManifestEntry(manifest, "en", "investing", "my-investing-post", { hasSubtitles: true });

    expect(manifest.en.investing["my-investing-post"]).toEqual({ hasSubtitles: true });
    expect(manifest.en.writing).toEqual({});
    expect(manifest.en.projects).toEqual({});
  });

  it("reuses existing locale bucket when adding second entry", () => {
    const manifest = createEmptyAudioManifest();
    registerAudioManifestEntry(manifest, "en", "writing", "slug-a", { hasSubtitles: true });
    registerAudioManifestEntry(manifest, "en", "writing", "slug-b", { hasSubtitles: false });

    expect(manifest.en.writing["slug-a"]).toEqual({ hasSubtitles: true });
    expect(manifest.en.writing["slug-b"]).toEqual({ hasSubtitles: false });
  });

  it("reuses existing content bucket when adding second locale", () => {
    const manifest = createEmptyAudioManifest();
    registerAudioManifestEntry(manifest, "en", "writing", "same-slug", { hasSubtitles: true });
    registerAudioManifestEntry(manifest, "zh", "writing", "same-slug", { hasSubtitles: false });

    expect(manifest.en.writing["same-slug"]).toEqual({ hasSubtitles: true });
    expect(manifest.zh.writing["same-slug"]).toEqual({ hasSubtitles: false });
  });
});

describe("getAudioInfo", () => {
  it("uses the CDN URL for remote audio and same-origin URL for remote subtitles", async () => {
    process.env.AUDIO_SOURCE = "r2";
    process.env.R2_AUDIO_PUBLIC_BASE_URL = "https://cdn.example.com";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          en: {
            writing: {},
            projects: {},
            investing: {
              "portfolio-note": { hasSubtitles: true },
            },
          },
        }),
      }))
    );
    vi.resetModules();

    const { getAudioInfo } = await import("@/lib/audio-manifest");
    const audioInfo = await getAudioInfo("en", "investing", "portfolio-note");

    expect(audioInfo).toEqual({
      hasAudio: true,
      url: "https://cdn.example.com/en/investing/portfolio-note.mp3",
      subtitlesUrl: "/audio/en/investing/portfolio-note.mp3.json",
    });
  });
});
