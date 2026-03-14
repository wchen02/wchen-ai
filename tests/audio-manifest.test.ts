import { describe, it, expect } from "vitest";
import { createEmptyAudioManifest, registerAudioManifestEntry } from "@/lib/audio-manifest";

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
