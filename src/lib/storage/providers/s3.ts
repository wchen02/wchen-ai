import { HeadObjectCommand, PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import type { StorageProvider, StorageUploadParams } from "../types";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[storage:s3] Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Creates an Amazon S3 storage provider.
 *
 * Required environment variables:
 *   S3_REGION            – AWS region (e.g. us-east-1)
 *   S3_ACCESS_KEY_ID     – AWS access key ID
 *   S3_SECRET_ACCESS_KEY – AWS secret access key
 *   S3_AUDIO_BUCKET      – S3 bucket name
 */
export function createS3StorageProvider(): StorageProvider {
  const region = getRequiredEnv("S3_REGION");
  const accessKeyId = getRequiredEnv("S3_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("S3_SECRET_ACCESS_KEY");
  const bucket = getRequiredEnv("S3_AUDIO_BUCKET");

  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return {
    name: "Amazon S3",
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
