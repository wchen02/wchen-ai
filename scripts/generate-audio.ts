/**
 * Build-time script: generates MP3 audio for writing and project content using the
 * configured TTS provider (default: Edge TTS). Outputs to public/audio/<locale>/<type>/<slug>.mp3
 * and public/audio/audio-manifest.json. Set SKIP_AUDIO=1 to skip. Swap provider via TTS_PROVIDER env.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  createEmptyAudioManifest,
  registerAudioManifestEntry,
  type AudioManifest,
} from "../src/lib/audio-manifest";
import type { SubtitleSegment } from "../src/lib/tts";
import { getTTSProvider } from "../src/lib/tts";
import { getWritings, getProjects } from "../src/lib/mdx";
import { SUPPORTED_LOCALES } from "../src/lib/locales";
import {
  AUDIO_TEXT_VERSION,
  buildAudioTimingSegments,
  hashAudioText,
  mdxToAudioText,
  projectToAudioText,
  type AudioTimingFile,
  type AudioTimingSegment,
} from "../src/lib/audio-text";
import { getUiContent } from "../src/lib/site-content";
import { logger } from "../src/lib/logger";

const PUBLIC_AUDIO = path.join(process.cwd(), "public", "audio");

function chunkText(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) return [text];
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  let current = "";
  for (const p of paragraphs) {
    if (current.length + p.length + 2 <= maxChunkSize) {
      current += (current ? "\n\n" : "") + p;
    } else {
      if (current) chunks.push(current);
      if (p.length <= maxChunkSize) {
        current = p;
      } else {
        // Single paragraph too long: split by sentence or by size
        const sentences = p.split(/(?<=[.!?])\s+/);
        current = "";
        for (const s of sentences) {
          if (current.length + s.length + 1 <= maxChunkSize) {
            current += (current ? " " : "") + s;
          } else {
            if (current) chunks.push(current);
            current = s.length <= maxChunkSize ? s : s.slice(0, maxChunkSize);
          }
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function concatMp3Files(filePaths: string[], outPath: string): boolean {
  if (filePaths.length === 0) return false;
  if (filePaths.length === 1) {
    fs.copyFileSync(filePaths[0], outPath);
    return true;
  }
  const listPath = path.join(path.dirname(outPath), `concat-list-${Date.now()}.txt`);
  const listContent = filePaths.map((f) => `file '${path.resolve(f).replace(/'/g, "'\\''")}'`).join("\n");
  fs.writeFileSync(listPath, listContent, "utf8");
  try {
    const result = spawnSync(
      "ffmpeg",
      ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outPath],
      { stdio: "pipe", encoding: "utf8" }
    );
    return result.status === 0;
  } finally {
    try {
      fs.unlinkSync(listPath);
    } catch {
      // ignore
    }
  }
}

function ffmpegAvailable(): boolean {
  const result = spawnSync("ffmpeg", ["-version"], { stdio: "pipe" });
  return result.status === 0;
}

function mergeTimingSegments(
  chunkSubtitles: (SubtitleSegment[] | undefined)[],
  chunkDurationsMs: number[]
): AudioTimingSegment[] {
  const merged: AudioTimingSegment[] = [];
  let offsetMs = 0;
  let offsetText = 0;
  for (let i = 0; i < chunkSubtitles.length; i++) {
    const subs = chunkSubtitles[i];
    if (subs?.length) {
      const { segments, textLength } = buildAudioTimingSegments(subs, offsetText);
      for (const segment of segments) {
        merged.push({
          ...segment,
          start: segment.start + offsetMs,
          end: segment.end + offsetMs,
        });
      }
      offsetText += textLength;
      offsetMs += chunkDurationsMs[i] ?? (subs[subs.length - 1]?.end ?? 0);
    } else {
      offsetMs += chunkDurationsMs[i] ?? 0;
    }
  }
  return merged;
}

function readTimingFile(timingPath: string): AudioTimingFile | null {
  try {
    const raw = fs.readFileSync(timingPath, "utf8");
    const parsed = JSON.parse(raw) as AudioTimingFile;
    if (
      typeof parsed?.version === "number" &&
      typeof parsed?.textHash === "string" &&
      Array.isArray(parsed?.segments)
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function shouldGenerateAudio(outPath: string, textHash: string): boolean {
  if (!fs.existsSync(outPath)) return true;
  const timing = readTimingFile(`${outPath}.json`);
  if (!timing) return true;
  return timing.version !== AUDIO_TEXT_VERSION || timing.textHash !== textHash;
}

async function generateAudioForItem(
  plainText: string,
  locale: string,
  outPath: string,
  provider: ReturnType<typeof getTTSProvider>,
  textHash: string
): Promise<boolean> {
  const chunks = chunkText(plainText, provider.recommendedChunkSize);
  const tmpDir = path.join(path.dirname(outPath), `.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  const chunkPaths: string[] = [];
  const allSubtitles: (SubtitleSegment[] | undefined)[] = [];
  const chunkDurationsMs: number[] = [];
  try {
    for (let i = 0; i < chunks.length; i++) {
      const result = await provider.generate(chunks[i], { locale });
      const chunkPath = path.join(tmpDir, `chunk-${i}.mp3`);
      fs.writeFileSync(chunkPath, result.audio);
      chunkPaths.push(chunkPath);
      allSubtitles.push(result.subtitles);
      const lastEnd = result.subtitles?.length ? result.subtitles[result.subtitles.length - 1].end : 0;
      chunkDurationsMs.push(lastEnd);
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    if (chunkPaths.length > 1 && !ffmpegAvailable()) {
      logger.warn(`[generate-audio] ffmpeg not found; writing first chunk only to ${outPath}. Install ffmpeg for full audio.`);
      fs.copyFileSync(chunkPaths[0], outPath);
      allSubtitles.splice(1);
      chunkDurationsMs.splice(1);
    } else {
      concatMp3Files(chunkPaths, outPath);
    }
    const merged = mergeTimingSegments(allSubtitles, chunkDurationsMs);
    const timingFile: AudioTimingFile = {
      version: AUDIO_TEXT_VERSION,
      textHash,
      segments: merged,
    };
    fs.writeFileSync(`${outPath}.json`, JSON.stringify(timingFile), "utf8");
    return true;
  } finally {
    for (const p of chunkPaths) {
      try {
        fs.unlinkSync(p);
      } catch {
        // ignore
      }
    }
    try {
      fs.rmdirSync(tmpDir);
    } catch {
      // ignore
    }
  }
}

async function main(): Promise<void> {
  if (process.env.SKIP_AUDIO === "1") {
    logger.log("[generate-audio] SKIP_AUDIO=1, skipping.");
    return;
  }

  const provider = getTTSProvider();
  logger.log(`[generate-audio] Using provider: ${provider.name}`);

  const manifest: AudioManifest = createEmptyAudioManifest();

  for (const locale of SUPPORTED_LOCALES) {
    const writings = getWritings(locale);
    for (const w of writings) {
      const plain = mdxToAudioText(w.content);
      if (!plain || plain.length < 50) continue;
      const outPath = path.join(PUBLIC_AUDIO, locale, "writing", `${w.slug}.mp3`);
      const textHash = hashAudioText(plain);
      if (!shouldGenerateAudio(outPath, textHash)) {
        registerAudioManifestEntry(manifest, locale, "writing", w.slug, { hasSubtitles: true });
        logger.log(`[generate-audio] ${locale}/writing/${w.slug} (skip, exists)`);
        continue;
      }
      try {
        const ok = await generateAudioForItem(plain, locale, outPath, provider, textHash);
        if (ok) {
          registerAudioManifestEntry(manifest, locale, "writing", w.slug, { hasSubtitles: true });
        }
        logger.log(`[generate-audio] ${locale}/writing/${w.slug}`);
      } catch (err) {
        logger.error(`[generate-audio] ${locale}/writing/${w.slug}:`, err);
      }
    }

    const projects = getProjects(locale);
    const ui = getUiContent(locale);
    const projectLabels = {
      motivationLabel: ui.projects.motivationLabel,
      problemLabel: ui.projects.problemLabel,
      learningsLabel: ui.projects.learningsLabel,
    };
    for (const p of projects) {
      const { fullText: plain } = projectToAudioText(p, projectLabels);
      if (!plain || plain.length < 50) continue;
      const outPath = path.join(PUBLIC_AUDIO, locale, "projects", `${p.slug}.mp3`);
      const textHash = hashAudioText(plain);
      if (!shouldGenerateAudio(outPath, textHash)) {
        registerAudioManifestEntry(manifest, locale, "projects", p.slug, { hasSubtitles: true });
        logger.log(`[generate-audio] ${locale}/projects/${p.slug} (skip, exists)`);
        continue;
      }
      try {
        const ok = await generateAudioForItem(plain, locale, outPath, provider, textHash);
        if (ok) {
          registerAudioManifestEntry(manifest, locale, "projects", p.slug, { hasSubtitles: true });
        }
        logger.log(`[generate-audio] ${locale}/projects/${p.slug}`);
      } catch (err) {
        logger.error(`[generate-audio] ${locale}/projects/${p.slug}:`, err);
      }
    }
  }

  fs.mkdirSync(PUBLIC_AUDIO, { recursive: true });
  fs.writeFileSync(
    path.join(PUBLIC_AUDIO, "audio-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
  logger.log(`[generate-audio] Wrote ${path.join(PUBLIC_AUDIO, "audio-manifest.json")}`);
}

main().catch((err) => {
  logger.error("[generate-audio] Fatal:", err);
  process.exit(1);
});
