import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getStorageProvider } from "@/lib/storage";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  // Start each test from a clean snapshot to prevent cross-test leakage.
  process.env = { ...ORIGINAL_ENV };
  delete process.env.STORAGE_PROVIDER;
  delete process.env.R2_ACCOUNT_ID;
  delete process.env.R2_ACCESS_KEY_ID;
  delete process.env.R2_SECRET_ACCESS_KEY;
  delete process.env.R2_AUDIO_BUCKET;
  delete process.env.S3_REGION;
  delete process.env.S3_ACCESS_KEY_ID;
  delete process.env.S3_SECRET_ACCESS_KEY;
  delete process.env.S3_AUDIO_BUCKET;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("getStorageProvider", () => {
  it("returns Cloudflare R2 provider by default (no STORAGE_PROVIDER set)", () => {
    process.env.R2_ACCOUNT_ID = "test-account-id";
    process.env.R2_ACCESS_KEY_ID = "test-access-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
    process.env.R2_AUDIO_BUCKET = "test-bucket";

    const provider = getStorageProvider();
    expect(provider.name).toBe("Cloudflare R2");
    expect(provider.bucket).toBe("test-bucket");
  });

  it("returns Cloudflare R2 provider when STORAGE_PROVIDER=r2", () => {
    process.env.STORAGE_PROVIDER = "r2";
    process.env.R2_ACCOUNT_ID = "test-account-id";
    process.env.R2_ACCESS_KEY_ID = "test-access-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
    process.env.R2_AUDIO_BUCKET = "test-r2-bucket";

    const provider = getStorageProvider();
    expect(provider.name).toBe("Cloudflare R2");
    expect(provider.bucket).toBe("test-r2-bucket");
  });

  it("returns Amazon S3 provider when STORAGE_PROVIDER=s3", () => {
    process.env.STORAGE_PROVIDER = "s3";
    process.env.S3_REGION = "us-east-1";
    process.env.S3_ACCESS_KEY_ID = "test-access-key";
    process.env.S3_SECRET_ACCESS_KEY = "test-secret-key";
    process.env.S3_AUDIO_BUCKET = "test-s3-bucket";

    const provider = getStorageProvider();
    expect(provider.name).toBe("Amazon S3");
    expect(provider.bucket).toBe("test-s3-bucket");
  });

  it("falls back to R2 for an unknown STORAGE_PROVIDER value", () => {
    process.env.STORAGE_PROVIDER = "gcs";
    process.env.R2_ACCOUNT_ID = "test-account-id";
    process.env.R2_ACCESS_KEY_ID = "test-access-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
    process.env.R2_AUDIO_BUCKET = "test-bucket";

    const provider = getStorageProvider();
    expect(provider.name).toBe("Cloudflare R2");
  });

  it("is case-insensitive for STORAGE_PROVIDER value", () => {
    process.env.STORAGE_PROVIDER = "  R2  ";
    process.env.R2_ACCOUNT_ID = "test-account-id";
    process.env.R2_ACCESS_KEY_ID = "test-access-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
    process.env.R2_AUDIO_BUCKET = "test-bucket";

    const provider = getStorageProvider();
    expect(provider.name).toBe("Cloudflare R2");
  });

  it("throws when STORAGE_PROVIDER=r2 and required R2 env vars are missing", () => {
    process.env.STORAGE_PROVIDER = "r2";

    expect(() => getStorageProvider()).toThrow(/R2_ACCOUNT_ID/);
  });

  it("throws when STORAGE_PROVIDER=s3 and required S3 env vars are missing", () => {
    process.env.STORAGE_PROVIDER = "s3";

    expect(() => getStorageProvider()).toThrow(/S3_REGION/);
  });

  it("throws when STORAGE_PROVIDER=r2 but R2_AUDIO_BUCKET is missing", () => {
    process.env.STORAGE_PROVIDER = "r2";
    process.env.R2_ACCOUNT_ID = "test-account-id";
    process.env.R2_ACCESS_KEY_ID = "test-access-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";

    expect(() => getStorageProvider()).toThrow(/R2_AUDIO_BUCKET/);
  });

  it("throws when STORAGE_PROVIDER=s3 but S3_AUDIO_BUCKET is missing", () => {
    process.env.STORAGE_PROVIDER = "s3";
    process.env.S3_REGION = "us-east-1";
    process.env.S3_ACCESS_KEY_ID = "test-access-key";
    process.env.S3_SECRET_ACCESS_KEY = "test-secret-key";

    expect(() => getStorageProvider()).toThrow(/S3_AUDIO_BUCKET/);
  });
});
