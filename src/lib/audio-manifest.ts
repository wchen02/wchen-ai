import fs from "node:fs";
import path from "node:path";
import { getAudioAssetUrl, getAudioManifestUrl, isLocalAudioSource } from "./audio-config";

export type AudioContentType = "writing" | "projects";

export interface AudioManifestEntry {
  hasSubtitles: boolean;
}

export interface AudioManifest {
  [locale: string]: {
    writing: Record<string, AudioManifestEntry>;
    projects: Record<string, AudioManifestEntry>;
  };
}

let cachedLocalManifest: AudioManifest | null = null;
let cachedRemoteManifestPromise: Promise<AudioManifest | null> | null = null;

function createAudioContentBucket(): AudioManifest[string] {
  return { writing: {}, projects: {} };
}

export function createEmptyAudioManifest(): AudioManifest {
  return {};
}

export function registerAudioManifestEntry(
  manifest: AudioManifest,
  locale: string,
  contentType: AudioContentType,
  slug: string,
  entry: AudioManifestEntry
): void {
  manifest[locale] ??= createAudioContentBucket();
  manifest[locale][contentType][slug] = entry;
}

function isAudioManifest(parsed: unknown): parsed is AudioManifest {
  if (!parsed || typeof parsed !== "object") return false;
  return Object.values(parsed as Record<string, unknown>).every((localeValue) => {
    if (!localeValue || typeof localeValue !== "object") return false;
    const bucket = localeValue as { writing?: unknown; projects?: unknown };
    return ["writing", "projects"].every((contentType) => {
      const entries = bucket[contentType as keyof typeof bucket];
      if (!entries || typeof entries !== "object" || Array.isArray(entries)) return false;
      return Object.values(entries as Record<string, unknown>).every(
        (entry) => !!entry && typeof entry === "object" && typeof (entry as AudioManifestEntry).hasSubtitles === "boolean"
      );
    });
  });
}

/** Normalize manifest from R2 or disk: accept object format or array-of-slugs format. */
function normalizeToAudioManifest(parsed: unknown): AudioManifest | null {
  if (!parsed || typeof parsed !== "object") return null;
  const result: AudioManifest = {};
  const locales = parsed as Record<string, { writing?: unknown; projects?: unknown }>;
  for (const locale of Object.keys(locales)) {
    const bucket = locales[locale];
    if (!bucket || typeof bucket !== "object") continue;
    result[locale] = { writing: {}, projects: {} };
    for (const contentType of ["writing", "projects"] as const) {
      const raw = bucket[contentType];
      if (!raw) continue;
      if (Array.isArray(raw)) {
        for (const slug of raw) {
          if (typeof slug === "string") {
            result[locale][contentType][slug] = { hasSubtitles: true };
          }
        }
      } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        const entries = raw as Record<string, unknown>;
        for (const [slug, entry] of Object.entries(entries)) {
          if (
            entry &&
            typeof entry === "object" &&
            typeof (entry as AudioManifestEntry).hasSubtitles === "boolean"
          ) {
            result[locale][contentType][slug] = entry as AudioManifestEntry;
          }
        }
      }
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

function loadLocalManifest(): AudioManifest | null {
  if (cachedLocalManifest !== null) return cachedLocalManifest;
  try {
    const manifestPath = path.join(process.cwd(), "public", "audio", "audio-manifest.json");
    const raw = fs.readFileSync(manifestPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    cachedLocalManifest = normalizeToAudioManifest(parsed) ?? (isAudioManifest(parsed) ? parsed : null);
    return cachedLocalManifest;
  } catch {
    return null;
  }
}

async function loadRemoteManifest(): Promise<AudioManifest | null> {
  if (cachedRemoteManifestPromise) {
    return cachedRemoteManifestPromise;
  }
  cachedRemoteManifestPromise = (async () => {
    const manifestUrl = getAudioManifestUrl();
    if (!manifestUrl) return null;
    try {
      const response = await fetch(manifestUrl, { cache: "force-cache" });
      if (!response.ok) return null;
      const parsed = (await response.json()) as unknown;
      return normalizeToAudioManifest(parsed) ?? (isAudioManifest(parsed) ? parsed : null);
    } catch {
      return null;
    }
  })();
  return cachedRemoteManifestPromise;
}

export interface AudioInfo {
  hasAudio: boolean;
  url: string;
  /** URL to subtitle JSON for read-along sync; set only when file exists. */
  subtitlesUrl?: string;
}

/**
 * Returns whether pre-generated audio exists for this locale/type/slug and its URL.
 * When subtitle JSON exists alongside the MP3, also returns subtitlesUrl for read-along.
 * Call from server only (reads from filesystem). Uses manifest when present; otherwise
 * checks for the MP3 file on disk so the player appears even if the manifest wasn't
 * written (e.g. generate-audio was interrupted).
 */
export async function getAudioInfo(
  locale: string,
  contentType: AudioContentType,
  slug: string
): Promise<AudioInfo> {
  const audioRelativePath = `${locale}/${contentType}/${slug}.mp3`;
  const subtitlesRelativePath = `${audioRelativePath}.json`;
  const manifest = isLocalAudioSource() ? loadLocalManifest() : await loadRemoteManifest();
  const entry = manifest?.[locale]?.[contentType]?.[slug];

  if (entry) {
    return {
      hasAudio: true,
      url: getAudioAssetUrl(audioRelativePath),
      ...(entry.hasSubtitles ? { subtitlesUrl: getAudioAssetUrl(subtitlesRelativePath) } : {}),
    };
  }

  if (!isLocalAudioSource()) {
    return { hasAudio: false, url: "" };
  }

  let hasAudio = false;
  try {
    const audioPath = path.join(process.cwd(), "public", "audio", locale, contentType, `${slug}.mp3`);
    if (fs.existsSync(audioPath)) {
      hasAudio = true;
    }
  } catch {
    // ignore
  }
  if (!hasAudio) {
    return { hasAudio: false, url: "" };
  }

  const subtitlesPath = path.join(process.cwd(), "public", "audio", locale, contentType, `${slug}.mp3.json`);
  const hasSubtitles = (() => {
    try {
      return fs.existsSync(subtitlesPath);
    } catch {
      return false;
    }
  })();

  return {
    hasAudio: true,
    url: getAudioAssetUrl(audioRelativePath),
    ...(hasSubtitles ? { subtitlesUrl: getAudioAssetUrl(subtitlesRelativePath) } : {}),
  };
}
