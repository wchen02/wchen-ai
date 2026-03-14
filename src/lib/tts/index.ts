import type { TTSProvider } from "./types";
import { createEdgeTTSProvider } from "./providers/edge";

export type { TTSProvider, TTSGenerateOptions, TTSGenerateResult, SubtitleSegment } from "./types";

/**
 * Returns the TTS provider to use. Driven by env TTS_PROVIDER (default: "edge").
 * Swap provider by setting TTS_PROVIDER=openai (future) or implementing another in providers/.
 */
export function getTTSProvider(): TTSProvider {
  const provider = process.env.TTS_PROVIDER ?? "edge";
  switch (provider) {
    case "edge":
      return createEdgeTTSProvider();
    default:
      return createEdgeTTSProvider();
  }
}
