import crypto from "node:crypto";

export const AUDIO_TEXT_VERSION = 1;
const NFC = "NFC" as const;

export interface AudioTextState {
  text: string;
  length: number;
  lastWasSpace: boolean;
}

export interface AudioTimingSegment {
  start: number;
  end: number;
  startOffset: number;
  endOffset: number;
}

export interface AudioTimingFile {
  version: number;
  textHash: string;
  segments: AudioTimingSegment[];
}

export interface ProviderSubtitleSegment {
  part: string;
  start: number;
  end: number;
}

export function normalizeAudioQuotes(s: string): string {
  return s
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'");
}

export function createAudioTextState(): AudioTextState {
  return { text: "", length: 0, lastWasSpace: false };
}

export function appendAudioText(state: AudioTextState, raw: string): { startOffset: number; endOffset: number } {
  const startOffset = state.length;
  for (const char of raw) {
    if (/\s/.test(char)) {
      if (state.length > 0 && !state.lastWasSpace) {
        state.text += " ";
        state.length += 1;
      }
      state.lastWasSpace = true;
      continue;
    }
    const normalized = normalizeAudioQuotes(char.normalize(NFC)).normalize(NFC);
    state.text += normalized;
    state.length += [...normalized].length;
    state.lastWasSpace = false;
  }
  return { startOffset, endOffset: state.length };
}

export function normalizeAudioText(raw: string): string {
  const state = createAudioTextState();
  appendAudioText(state, raw);
  return state.text;
}

export function hashAudioText(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex").slice(0, 16);
}

/**
 * Converts MDX/markdown body to canonical plain text for TTS and audio highlighting.
 * Strips frontmatter and code fences, keeps link text, and normalizes whitespace/punctuation.
 */
export function mdxToAudioText(mdxContent: string): string {
  const raw = mdxContent
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~`>]/g, "")
    .replace(/\n+/g, " ");
  return normalizeAudioText(raw);
}

export interface ProjectAudioLabels {
  motivationLabel: string;
  problemLabel: string;
  learningsLabel: string;
}

export interface ProjectForAudio {
  motivation: string;
  problemAddressed: string;
  learnings?: string;
  content: string;
}

/**
 * Builds full plain text for project TTS: motivation, problem, key learnings (if present), then body.
 * Returns full text and the character offset where the body starts (for highlight sync).
 */
export function projectToAudioText(
  project: ProjectForAudio,
  labels: ProjectAudioLabels
): { fullText: string; bodyStartOffset: number } {
  const state = createAudioTextState();
  appendAudioText(state, labels.motivationLabel);
  appendAudioText(state, " ");
  appendAudioText(state, project.motivation);
  appendAudioText(state, " ");
  appendAudioText(state, labels.problemLabel);
  appendAudioText(state, " ");
  appendAudioText(state, project.problemAddressed);
  if (project.learnings) {
    appendAudioText(state, " ");
    appendAudioText(state, labels.learningsLabel);
    appendAudioText(state, " ");
    appendAudioText(state, project.learnings);
  }
  let bodyStartOffset = state.length;
  const bodyText = mdxToAudioText(project.content);
  if (bodyText) {
    appendAudioText(state, " ");
    bodyStartOffset = state.length;
    appendAudioText(state, bodyText);
  }
  return { fullText: state.text, bodyStartOffset };
}

export function buildAudioTimingSegments(
  subtitles: ProviderSubtitleSegment[] | undefined,
  offsetBase = 0
): { segments: AudioTimingSegment[]; textLength: number } {
  if (!subtitles?.length) return { segments: [], textLength: 0 };
  const state = createAudioTextState();
  const segments: AudioTimingSegment[] = [];
  for (const subtitle of subtitles) {
    const { startOffset, endOffset } = appendAudioText(state, subtitle.part);
    if (endOffset <= startOffset) continue;
    segments.push({
      start: subtitle.start,
      end: subtitle.end,
      startOffset: offsetBase + startOffset,
      endOffset: offsetBase + endOffset,
    });
  }
  return { segments, textLength: state.length };
}
