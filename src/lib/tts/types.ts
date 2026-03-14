/**
 * TTS provider interface. Implement this to swap providers (Edge, OpenAI, etc.).
 * The build script chunks long text and concatenates audio; each call receives one chunk.
 */
export interface TTSGenerateOptions {
  /** BCP 47 locale (e.g. en, es, zh). Provider maps to voice/language. */
  locale: string;
}

/** Word/phrase segment with start/end in milliseconds for read-along sync. */
export interface SubtitleSegment {
  part: string;
  start: number;
  end: number;
}

export interface TTSGenerateResult {
  audio: Buffer;
  subtitles?: SubtitleSegment[];
}

export interface TTSProvider {
  /**
   * Generate audio for the given text. Text should be within provider's recommended
   * chunk size (see recommendedChunkSize). Returns audio and optional subtitles for sync.
   */
  generate(text: string, options: TTSGenerateOptions): Promise<TTSGenerateResult>;

  /**
   * Max characters per request. Build script chunks content to this size.
   * Conservative value to avoid timeouts or incomplete audio.
   */
  readonly recommendedChunkSize: number;

  /** Human-readable name for logs. */
  readonly name: string;
}
