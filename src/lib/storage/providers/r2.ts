import { HeadObjectCommand, PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import type { StorageProvider, StorageUploadParams } from "../types";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[storage:r2] Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Creates a Cloudflare R2 storage provider.
 *
 * Required environment variables:
 *   R2_ACCOUNT_ID       – Cloudflare account ID
 *   R2_ACCESS_KEY_ID    – R2 API token access key
 *   R2_SECRET_ACCESS_KEY – R2 API token secret key
 *   R2_AUDIO_BUCKET     – R2 bucket name
 */
export function createR2StorageProvider(): StorageProvider {
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");
  const bucket = getRequiredEnv("R2_AUDIO_BUCKET");

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return {
    name: "Cloudflare R2",
    bucket,

    async isUnchanged(key: string, sha256: string): Promise<boolean> {
      try {
        const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        return head.Metadata?.sha256 === sha256;
      } catch (error) {
        if (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404) return false;
        if (error instanceof Error && /NotFound/i.test(error.name)) return false;
        throw error;
      }
    },

    async upload(params: StorageUploadParams): Promise<void> {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: params.key,
          Body: params.body,
          ContentType: params.contentType,
          CacheControl: params.cacheControl,
          Metadata: { sha256: params.sha256 },
        })
      );
    },
  };
}
