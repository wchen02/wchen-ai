import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SubtitleSegment, TTSGenerateOptions, TTSGenerateResult, TTSProvider } from "../types";

/** Maps app locale to Edge TTS voice (language-region-Name). */
const LOCALE_TO_VOICE: Record<string, string> = {
  en: "en-US-AriaNeural",
  "en-US": "en-US-AriaNeural",
  "en-GB": "en-GB-SoniaNeural",
  es: "es-ES-ElviraNeural",
  "es-ES": "es-ES-ElviraNeural",
  "es-MX": "es-MX-DaliaNeural",
  zh: "zh-CN-XiaoxiaoNeural",
  "zh-CN": "zh-CN-XiaoxiaoNeural",
  "zh-TW": "zh-TW-HsiaoChenNeural",
};

/** Maps app locale to Edge TTS lang (e.g. en-US). */
const LOCALE_TO_LANG: Record<string, string> = {
  en: "en-US",
  "en-US": "en-US",
  "en-GB": "en-GB",
  es: "es-ES",
  "es-ES": "es-ES",
  "es-MX": "es-MX",
  zh: "zh-CN",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
};

function getVoice(locale: string): string {
  const normalized = locale.trim().replace(/_/g, "-");
  return LOCALE_TO_VOICE[normalized] ?? LOCALE_TO_VOICE.en;
}

function getLang(locale: string): string {
  const normalized = locale.trim().replace(/_/g, "-");
  return LOCALE_TO_LANG[normalized] ?? LOCALE_TO_LANG.en;
}

/**
 * Edge TTS provider using Microsoft Edge's online TTS (no API key).
 * Uses the node-edge-tts package.
 */
export function createEdgeTTSProvider(): TTSProvider {
  return {
    name: "Edge TTS",

    recommendedChunkSize: 3000,

    async generate(text: string, options: TTSGenerateOptions): Promise<TTSGenerateResult> {
      const voice = getVoice(options.locale);
      const lang = getLang(options.locale);

      const { EdgeTTS } = await import("node-edge-tts");
      const tts = new EdgeTTS({
        voice,
        lang,
        outputFormat: "audio-24khz-48kbitrate-mono-mp3",
        saveSubtitles: true,
        // Long chunks can take >10s; default timeout causes "Timed out" then ENOENT when
        // the library writes chunk.mp3.json after our cleanup has removed the temp dir.
        timeout: 120_000,
      });

      const tmpDir = path.join(os.tmpdir(), `wchen-tts-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      const tmpFile = path.join(tmpDir, "chunk.mp3");
      try {
        await tts.ttsPromise(text, tmpFile);
        const audio = Buffer.from(fs.readFileSync(tmpFile));
        let subtitles: SubtitleSegment[] | undefined;
        const subPath = `${tmpFile}.json`;
        if (fs.existsSync(subPath)) {
          try {
            const raw = fs.readFileSync(subPath, "utf8");
            const arr = JSON.parse(raw) as unknown;
            if (Array.isArray(arr) && arr.every((s) => s && typeof s.part === "string" && typeof s.start === "number" && typeof s.end === "number")) {
              subtitles = arr as SubtitleSegment[];
            }
          } catch {
            // ignore
          }
          try {
            fs.unlinkSync(subPath);
          } catch {
            // ignore
          }
        }
        return { audio, subtitles };
      } finally {
        try {
          fs.unlinkSync(tmpFile);
          fs.rmdirSync(tmpDir);
        } catch {
          // ignore cleanup errors
        }
      }
    },
  };
}
