import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getAudioSource,
  isLocalAudioSource,
  getAudioPublicBaseUrl,
  getAudioManifestUrl,
  getAudioAssetUrl,
} from "@/lib/audio-config";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.AUDIO_SOURCE;
  delete process.env.R2_AUDIO_PUBLIC_BASE_URL;
  delete process.env.R2_AUDIO_MANIFEST_URL;
  delete process.env.S3_AUDIO_PUBLIC_BASE_URL;
  delete process.env.S3_AUDIO_MANIFEST_URL;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("getAudioSource", () => {
  it("returns 'local' when AUDIO_SOURCE is not set", () => {
    expect(getAudioSource()).toBe("local");
  });

  it("returns 'local' for unknown AUDIO_SOURCE values", () => {
    process.env.AUDIO_SOURCE = "gcs";
    expect(getAudioSource()).toBe("local");
  });

  it("returns 'r2' when AUDIO_SOURCE=r2", () => {
    process.env.AUDIO_SOURCE = "r2";
    expect(getAudioSource()).toBe("r2");
  });

  it("returns 's3' when AUDIO_SOURCE=s3", () => {
    process.env.AUDIO_SOURCE = "s3";
    expect(getAudioSource()).toBe("s3");
  });

  it("is case-insensitive and trims whitespace", () => {
    process.env.AUDIO_SOURCE = "  R2  ";
    expect(getAudioSource()).toBe("r2");

    process.env.AUDIO_SOURCE = "  S3  ";
    expect(getAudioSource()).toBe("s3");
  });
});

describe("isLocalAudioSource", () => {
  it("returns true when AUDIO_SOURCE is not set", () => {
    expect(isLocalAudioSource()).toBe(true);
  });

  it("returns false when AUDIO_SOURCE=r2", () => {
    process.env.AUDIO_SOURCE = "r2";
    expect(isLocalAudioSource()).toBe(false);
  });

  it("returns false when AUDIO_SOURCE=s3", () => {
    process.env.AUDIO_SOURCE = "s3";
    expect(isLocalAudioSource()).toBe(false);
  });
});

describe("getAudioPublicBaseUrl", () => {
  it("returns '/audio' for local source", () => {
    expect(getAudioPublicBaseUrl()).toBe("/audio");
  });

  it("returns R2_AUDIO_PUBLIC_BASE_URL when AUDIO_SOURCE=r2", () => {
    process.env.AUDIO_SOURCE = "r2";
    process.env.R2_AUDIO_PUBLIC_BASE_URL = "https://pub-abc.r2.dev";
    expect(getAudioPublicBaseUrl()).toBe("https://pub-abc.r2.dev");
  });

  it("strips trailing slashes from R2_AUDIO_PUBLIC_BASE_URL", () => {
    process.env.AUDIO_SOURCE = "r2";
    process.env.R2_AUDIO_PUBLIC_BASE_URL = "https://pub-abc.r2.dev///";
    expect(getAudioPublicBaseUrl()).toBe("https://pub-abc.r2.dev");
  });

  it("returns null when AUDIO_SOURCE=r2 but R2_AUDIO_PUBLIC_BASE_URL is missing", () => {
    process.env.AUDIO_SOURCE = "r2";
    expect(getAudioPublicBaseUrl()).toBeNull();
  });

  it("returns S3_AUDIO_PUBLIC_BASE_URL when AUDIO_SOURCE=s3", () => {
    process.env.AUDIO_SOURCE = "s3";
    process.env.S3_AUDIO_PUBLIC_BASE_URL = "https://cdn.example.com";
    expect(getAudioPublicBaseUrl()).toBe("https://cdn.example.com");
  });

  it("strips trailing slashes from S3_AUDIO_PUBLIC_BASE_URL", () => {
    process.env.AUDIO_SOURCE = "s3";
    process.env.S3_AUDIO_PUBLIC_BASE_URL = "https://cdn.example.com/";
    expect(getAudioPublicBaseUrl()).toBe("https://cdn.example.com");
  });

  it("returns null when AUDIO_SOURCE=s3 but S3_AUDIO_PUBLIC_BASE_URL is missing", () => {
    process.env.AUDIO_SOURCE = "s3";
    expect(getAudioPublicBaseUrl()).toBeNull();
  });
});

describe("getAudioManifestUrl", () => {
  it("returns null for local source", () => {
    expect(getAudioManifestUrl()).toBeNull();
  });

  it("derives manifest URL from R2_AUDIO_PUBLIC_BASE_URL when AUDIO_SOURCE=r2", () => {
    process.env.AUDIO_SOURCE = "r2";
    process.env.R2_AUDIO_PUBLIC_BASE_URL = "https://pub-abc.r2.dev";
    expect(getAudioManifestUrl()).toBe("https://pub-abc.r2.dev/audio-manifest.json");
  });

  it("uses R2_AUDIO_MANIFEST_URL over derived URL when AUDIO_SOURCE=r2", () => {
    process.env.AUDIO_SOURCE = "r2";
    process.env.R2_AUDIO_PUBLIC_BASE_URL = "https://pub-abc.r2.dev";
    process.env.R2_AUDIO_MANIFEST_URL = "https://custom.example.com/manifest.json";
    expect(getAudioManifestUrl()).toBe("https://custom.example.com/manifest.json");
  });

  it("returns null when AUDIO_SOURCE=r2 but no base URL or manifest URL set", () => {
    process.env.AUDIO_SOURCE = "r2";
    expect(getAudioManifestUrl()).toBeNull();
  });

  it("derives manifest URL from S3_AUDIO_PUBLIC_BASE_URL when AUDIO_SOURCE=s3", () => {
    process.env.AUDIO_SOURCE = "s3";
    process.env.S3_AUDIO_PUBLIC_BASE_URL = "https://cdn.example.com";
    expect(getAudioManifestUrl()).toBe("https://cdn.example.com/audio-manifest.json");
  });

  it("uses S3_AUDIO_MANIFEST_URL over derived URL when AUDIO_SOURCE=s3", () => {
    process.env.AUDIO_SOURCE = "s3";
    process.env.S3_AUDIO_PUBLIC_BASE_URL = "https://cdn.example.com";
    process.env.S3_AUDIO_MANIFEST_URL = "https://custom.example.com/manifest.json";
    expect(getAudioManifestUrl()).toBe("https://custom.example.com/manifest.json");
  });

  it("returns null when AUDIO_SOURCE=s3 but no base URL or manifest URL set", () => {
    process.env.AUDIO_SOURCE = "s3";
    expect(getAudioManifestUrl()).toBeNull();
  });
});

describe("getAudioAssetUrl", () => {
  it("returns empty string when base URL is not configured (r2 with no env)", () => {
    process.env.AUDIO_SOURCE = "r2";
    expect(getAudioAssetUrl("en/writing/post.mp3")).toBe("");
  });

  it("builds asset URL from base URL for R2", () => {
    process.env.AUDIO_SOURCE = "r2";
    process.env.R2_AUDIO_PUBLIC_BASE_URL = "https://pub-abc.r2.dev";
    expect(getAudioAssetUrl("en/writing/post.mp3")).toBe("https://pub-abc.r2.dev/en/writing/post.mp3");
  });

  it("builds asset URL from base URL for S3", () => {
    process.env.AUDIO_SOURCE = "s3";
    process.env.S3_AUDIO_PUBLIC_BASE_URL = "https://cdn.example.com";
    expect(getAudioAssetUrl("en/writing/post.mp3")).toBe("https://cdn.example.com/en/writing/post.mp3");
  });

  it("strips leading slashes from relative path", () => {
    process.env.AUDIO_SOURCE = "r2";
    process.env.R2_AUDIO_PUBLIC_BASE_URL = "https://pub-abc.r2.dev";
    expect(getAudioAssetUrl("/en/writing/post.mp3")).toBe("https://pub-abc.r2.dev/en/writing/post.mp3");
  });

  it("builds asset URL for local source", () => {
    expect(getAudioAssetUrl("en/writing/post.mp3")).toBe("/audio/en/writing/post.mp3");
  });
});
