import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getStorageProvider } from "../src/lib/storage";
import { logger } from "../src/lib/logger";

const PUBLIC_AUDIO = path.join(process.cwd(), "public", "audio");
const MANIFEST_FILENAME = "audio-manifest.json";

interface UploadCandidate {
  absolutePath: string;
  key: string;
  sha256: string;
  contentType: string;
  cacheControl: string;
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
    throw new Error(`[upload-audio] Missing ${rootDir}. Run audio generation first.`);
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
    throw new Error(`[upload-audio] Missing ${MANIFEST_FILENAME}. Run audio generation first.`);
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

async function main(): Promise<void> {
  const provider = getStorageProvider();
  const candidates = buildUploadCandidates(PUBLIC_AUDIO);

  logger.log(`[upload-audio] Using provider: ${provider.name}, bucket: ${provider.bucket}`);

  let uploadedCount = 0;
  let skippedCount = 0;

  for (const candidate of candidates) {
    if (await provider.isUnchanged(candidate.key, candidate.sha256)) {
      skippedCount += 1;
      logger.log(`[upload-audio] skip ${candidate.key}`);
      continue;
    }
    await provider.upload({
      key: candidate.key,
      body: fs.createReadStream(candidate.absolutePath),
      contentType: candidate.contentType,
      cacheControl: candidate.cacheControl,
      sha256: candidate.sha256,
    });
    uploadedCount += 1;
    logger.log(`[upload-audio] upload ${candidate.key}`);
  }

  logger.log(
    `[upload-audio] Completed: ${uploadedCount} uploaded, ${skippedCount} skipped, ${candidates.length} total`
  );
}

main().catch((error) => {
  logger.error("[upload-audio] Fatal:", error);
  process.exit(1);
});
