import crypto from "node:crypto";
import fs from "node:fs";

import {
  collectSiteOriginsForContentImages,
  contentImageStorageKey,
  localPublicFilePathForSiteAsset,
  siteAssetPathFromOgImageUrl,
} from "../src/lib/content-image-storage";
import { getStorageProvider } from "../src/lib/storage";
import { loadDotenvFromRepoRoot } from "./load-dotenv";
import { logger } from "../src/lib/logger";
import { SUPPORTED_LOCALES } from "../src/lib/locales";
import { getProjects, getWritings } from "../src/lib/mdx";

function hashFile(filePath: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function getImageContentType(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

function digestImagePublicBase(): string | undefined {
  const n = process.env.NEWSLETTER_IMAGE_PUBLIC_BASE_URL?.trim();
  if (n) return n.replace(/\/$/, "");
  const r = process.env.R2_AUDIO_PUBLIC_BASE_URL?.trim();
  if (r) return r.replace(/\/$/, "");
  return undefined;
}

function collectUploadJobs(): Map<string, string> {
  const origins = collectSiteOriginsForContentImages();
  const keyToPath = new Map<string, string>();

  for (const locale of SUPPORTED_LOCALES) {
    for (const writing of getWritings(locale)) {
      if (!writing.ogImage) continue;
      const sitePath = siteAssetPathFromOgImageUrl(writing.ogImage, origins);
      if (!sitePath) continue;
      const abs = localPublicFilePathForSiteAsset(sitePath);
      if (!fs.existsSync(abs)) {
        logger.error(`[upload-content-images] Missing file for ogImage (${writing.slug}): ${abs}`);
        continue;
      }
      keyToPath.set(contentImageStorageKey(sitePath), abs);
    }
    for (const project of getProjects(locale)) {
      if (!project.ogImage) continue;
      const sitePath = siteAssetPathFromOgImageUrl(project.ogImage, origins);
      if (!sitePath) continue;
      const abs = localPublicFilePathForSiteAsset(sitePath);
      if (!fs.existsSync(abs)) {
        logger.error(`[upload-content-images] Missing file for ogImage (${project.slug}): ${abs}`);
        continue;
      }
      keyToPath.set(contentImageStorageKey(sitePath), abs);
    }
  }

  return keyToPath;
}

function forceUpload(): boolean {
  if (process.argv.includes("--force")) return true;
  const v = process.env.CONTENT_IMAGES_FORCE_UPLOAD?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

async function main(): Promise<void> {
  loadDotenvFromRepoRoot();

  const publicBase = digestImagePublicBase();
  const jobs = collectUploadJobs();
  const force = forceUpload();

  if (jobs.size === 0) {
    const origins = collectSiteOriginsForContentImages();
    logger.log("[upload-content-images] No on-site og images to upload.");
    if (origins.length > 0) {
      logger.log(
        `[upload-content-images] Hint: ogImage URLs must use your site origin (allowed: ${origins.join(", ")}).`
      );
    }
    return;
  }

  if (!publicBase) {
    logger.log(
      "[upload-content-images] Skipping: set NEWSLETTER_IMAGE_PUBLIC_BASE_URL or R2_AUDIO_PUBLIC_BASE_URL in .env (or pass via the environment)."
    );
    return;
  }

  const provider = getStorageProvider();
  logger.log(
    `[upload-content-images] Using ${provider.name}, bucket ${provider.bucket}, public base ${publicBase}`
  );
  if (force) {
    logger.log("[upload-content-images] --force / CONTENT_IMAGES_FORCE_UPLOAD: re-uploading all keys.");
  }

  let uploaded = 0;
  let unchanged = 0;
  const sortedKeys = [...jobs.keys()].sort();

  for (const key of sortedKeys) {
    const absolutePath = jobs.get(key)!;
    const sha256 = hashFile(absolutePath);
    if (!force && (await provider.isUnchanged(key, sha256))) {
      unchanged += 1;
      logger.log(`[upload-content-images] unchanged ${key}`);
      continue;
    }
    await provider.upload({
      key,
      body: fs.createReadStream(absolutePath),
      contentType: getImageContentType(key),
      cacheControl: "public, max-age=31536000, immutable",
      sha256,
    });
    uploaded += 1;
    logger.log(`[upload-content-images] upload ${key}`);
  }

  logger.log(
    `[upload-content-images] Done: ${uploaded} uploaded, ${unchanged} unchanged, ${jobs.size} keys`
  );
}

main().catch((error) => {
  logger.error("[upload-content-images] Fatal:", error);
  process.exit(1);
});
