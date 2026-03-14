import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { logger } from "../src/lib/logger";

const PUBLIC_AUDIO = path.join(process.cwd(), "public", "audio");
const MANIFEST_FILENAME = "audio-manifest.json";

interface UploadConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

interface UploadCandidate {
  absolutePath: string;
  key: string;
  sha256: string;
  contentType: string;
  cacheControl: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[upload-audio-to-r2] Missing required environment variable: ${name}`);
  }
  return value;
}

function getUploadConfig(): UploadConfig {
  return {
    accountId: getRequiredEnv("R2_ACCOUNT_ID"),
    accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
    bucket: getRequiredEnv("R2_AUDIO_BUCKET"),
  };
}

function createClient(config: UploadConfig): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function hashFile(filePath: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function getContentType(key: string): string {
  if (key.endsWith(".mp3")) return "audio/mpeg";
  if (key.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}

function getCacheControl(key: string): string {
  if (key === MANIFEST_FILENAME) return "public, max-age=300";
  if (key.endsWith(".json")) return "public, max-age=3600";
  return "public, max-age=86400";
}

function listAudioFiles(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) {
    throw new Error(`[upload-audio-to-r2] Missing ${rootDir}. Run audio generation first.`);
  }
  const output: string[] = [];
  function walk(currentDir: string) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.name.startsWith(".tmp-")) continue;
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.name.endsWith(".mp3") || entry.name.endsWith(".json")) {
        output.push(fullPath);
      }
    }
  }
  walk(rootDir);
  return output;
}

function buildUploadCandidates(rootDir: string): UploadCandidate[] {
  const files = listAudioFiles(rootDir);
  if (!files.some((filePath) => path.basename(filePath) === MANIFEST_FILENAME)) {
    throw new Error(`[upload-audio-to-r2] Missing ${MANIFEST_FILENAME}. Run audio generation first.`);
  }
  return files
    .map((absolutePath) => {
      const key = path.relative(rootDir, absolutePath).replaceAll(path.sep, "/");
      return {
        absolutePath,
        key,
        sha256: hashFile(absolutePath),
        contentType: getContentType(key),
        cacheControl: getCacheControl(key),
      };
    })
    .sort((a, b) => {
      if (a.key === MANIFEST_FILENAME) return 1;
      if (b.key === MANIFEST_FILENAME) return -1;
      return a.key.localeCompare(b.key);
    });
}

async function isUnchanged(client: S3Client, bucket: string, candidate: UploadCandidate): Promise<boolean> {
  try {
    const head = await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: candidate.key,
      })
    );
    return head.Metadata?.sha256 === candidate.sha256;
  } catch (error) {
    if (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404) {
      return false;
    }
    if (error instanceof Error && /NotFound/i.test(error.name)) {
      return false;
    }
    throw error;
  }
}

async function uploadCandidate(client: S3Client, bucket: string, candidate: UploadCandidate): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: candidate.key,
      Body: fs.createReadStream(candidate.absolutePath),
      ContentType: candidate.contentType,
      CacheControl: candidate.cacheControl,
      Metadata: { sha256: candidate.sha256 },
    })
  );
}

async function main(): Promise<void> {
  const config = getUploadConfig();
  const client = createClient(config);
  const candidates = buildUploadCandidates(PUBLIC_AUDIO);

  let uploadedCount = 0;
  let skippedCount = 0;

  for (const candidate of candidates) {
    if (await isUnchanged(client, config.bucket, candidate)) {
      skippedCount += 1;
      logger.log(`[upload-audio-to-r2] skip ${candidate.key}`);
      continue;
    }
    await uploadCandidate(client, config.bucket, candidate);
    uploadedCount += 1;
    logger.log(`[upload-audio-to-r2] upload ${candidate.key}`);
  }

  logger.log(
    `[upload-audio-to-r2] Completed: ${uploadedCount} uploaded, ${skippedCount} skipped, ${candidates.length} total`
  );
}

main().catch((error) => {
  logger.error("[upload-audio-to-r2] Fatal:", error);
  process.exit(1);
});
