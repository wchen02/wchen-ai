import type { StorageProvider } from "./types";
import { createR2StorageProvider } from "./providers/r2";
import { createS3StorageProvider } from "./providers/s3";

export type { StorageProvider, StorageUploadParams } from "./types";

/**
 * Returns the storage provider for audio uploads.
 * Driven by the STORAGE_PROVIDER environment variable (default: "r2").
 * Add new providers by implementing StorageProvider and adding a case here.
 *
 * Supported values:
 *   "r2" (default) – Cloudflare R2 (uses R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_AUDIO_BUCKET)
 *   "s3"           – Amazon S3 (uses S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_AUDIO_BUCKET)
 */
export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER?.trim().toLowerCase() ?? "r2";
  switch (provider) {
    case "s3":
      return createS3StorageProvider();
    case "r2":
    default:
      return createR2StorageProvider();
  }
}
