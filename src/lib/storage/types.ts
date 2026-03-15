import type { Readable } from "node:stream";

/**
 * Storage provider interface. Implement this to swap providers (Cloudflare R2, Amazon S3, etc.).
 * The upload script uses this interface to check for unchanged files and upload new/changed ones.
 */
export interface StorageUploadParams {
  /** Object key (path) within the bucket. */
  key: string;
  /** File content as a readable stream. */
  body: Readable;
  /** MIME type for the object. */
  contentType: string;
  /** Cache-Control header value. */
  cacheControl: string;
  /** SHA-256 hex digest of the file, stored in object metadata for change detection. */
  sha256: string;
}

export interface StorageProvider {
  /**
   * Returns true when an object already exists in the bucket with the same SHA-256 hash,
   * indicating the local file is unchanged and upload can be skipped.
   */
  isUnchanged(key: string, sha256: string): Promise<boolean>;

  /** Upload an object to the storage bucket. */
  upload(params: StorageUploadParams): Promise<void>;

  /** Human-readable provider name for log output. */
  readonly name: string;

  /** Target bucket name. */
  readonly bucket: string;
}
