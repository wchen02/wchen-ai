"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useAudioPlayback } from "@/components/AudioPlaybackContext";
import { useAudioPlayerVisibility } from "@/components/AudioPlayerVisibilityContext";

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Defer initial sync so setState runs in a callback (satisfies react-hooks/set-state-in-effect)
    queueMicrotask(() => setPrefersReducedMotion(mq.matches));
    const listener = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return prefersReducedMotion;
}

interface AudioTimingSegment {
  start: number;
  end: number;
  startOffset: number;
  endOffset: number;
}

interface AudioTimingFile {
  textHash: string;
  segments: AudioTimingSegment[];
}

interface AudioOffsetSpan extends HTMLSpanElement {
  dataset: DOMStringMap & {
    audioStartOffset?: string;
    audioEndOffset?: string;
  };
}

const AUDIO_OFFSET_SELECTOR = "[data-audio-start-offset][data-audio-end-offset]";

function collectSpans(container: HTMLDivElement | null): AudioOffsetSpan[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<AudioOffsetSpan>(AUDIO_OFFSET_SELECTOR));
}

const HIGHLIGHT_CLASSES = [
  "text-emerald-600",
  "dark:text-emerald-400",
  "bg-emerald-500/10",
  "dark:bg-emerald-400/10",
];

export default function ArticleBodyHighlighter({
  subtitlesUrl,
  expectedTextHash,
  bodyStartOffset = 0,
  children,
}: {
  subtitlesUrl?: string;
  expectedTextHash?: string;
  /** For project pages: character offset in full audio where the MDX body starts. Used when segment offsets are body-relative (legacy JSON). */
  bodyStartOffset?: number;
  children: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [segments, setSegments] = useState<AudioTimingSegment[]>([]);
  const spansRef = useRef<AudioOffsetSpan[]>([]);
  const highlightedSpansRef = useRef<AudioOffsetSpan[]>([]);
  const highlightedSegmentIndexRef = useRef<number>(-1);
  const playback = useAudioPlayback();
  const currentTime = playback?.currentTime ?? 0;
  const scrollFollowEnabled = playback?.scrollFollowEnabled ?? true;
  const visibility = useAudioPlayerVisibility();
  const isPlayerOpen = visibility?.isOpen ?? false;
  const stickyBarVisible = visibility?.stickyBarVisible ?? false;
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!subtitlesUrl) {
      queueMicrotask(() => setSegments([]));
      return;
    }
    let cancelled = false;
    fetch(subtitlesUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`Subtitle fetch ${r.status}`);
        return r.json();
      })
      .then((payload: unknown) => {
        if (cancelled) return;
        if (
          payload &&
          typeof payload === "object" &&
          typeof (payload as AudioTimingFile).textHash === "string" &&
          Array.isArray((payload as AudioTimingFile).segments)
        ) {
          const timingFile = payload as AudioTimingFile;
          const hashMismatch = expectedTextHash && timingFile.textHash !== expectedTextHash;
          if (hashMismatch && bodyStartOffset <= 0) {
            setSegments([]);
            return;
          }
          const nextSegments = timingFile.segments.filter(
            (segment) =>
              typeof segment?.start === "number" &&
              typeof segment?.end === "number" &&
              typeof segment?.startOffset === "number" &&
              typeof segment?.endOffset === "number"
          );
          const alignedSegments =
            hashMismatch && bodyStartOffset > 0
              ? nextSegments.map((segment) => ({
                  ...segment,
                  startOffset: segment.startOffset + bodyStartOffset,
                  endOffset: segment.endOffset + bodyStartOffset,
                }))
              : nextSegments;
          setSegments(alignedSegments);
        }
      })
      .catch(() => {
        // CORS or network error: segments stay empty (read-along disabled). In production, use
        // same-origin audio (e.g. R2_AUDIO_PUBLIC_BASE_URL=/audio with /audio/* proxied) or set CORS on the asset origin.
        if (!cancelled) {
          try {
            setSegments([]);
          } catch {
            // ignore
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [expectedTextHash, subtitlesUrl, bodyStartOffset]);

  // Run synchronously after DOM update so spans from server-rendered/hydrated content are found (fixes production).
  useLayoutEffect(() => {
    spansRef.current = collectSpans(bodyRef.current);
  }, [children, segments.length]);

  // Retry span collection when segments have loaded but no spans were found (hydration/timing in production).
  useLayoutEffect(() => {
    if (segments.length === 0 || spansRef.current.length > 0) return;
    let cancelled = false;
    const onFrame = () => {
      if (cancelled) return;
      spansRef.current = collectSpans(bodyRef.current);
      if (spansRef.current.length > 0) return;
      window.setTimeout(() => {
        if (!cancelled) spansRef.current = collectSpans(bodyRef.current);
      }, 100);
    };
    const id = requestAnimationFrame(onFrame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [segments.length]);

  useEffect(() => {
    if (!bodyRef.current || segments.length === 0 || spansRef.current.length === 0) return;
    const timeMs = currentTime * 1000;
    let activeSegmentIndex = -1;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (timeMs >= segment.start && timeMs < segment.end) {
        activeSegmentIndex = i;
        break;
      }
    }
    if (activeSegmentIndex === highlightedSegmentIndexRef.current) return;

    for (const span of highlightedSpansRef.current) {
      HIGHLIGHT_CLASSES.forEach((className) => span.classList.remove(className));
    }
    highlightedSpansRef.current = [];
    highlightedSegmentIndexRef.current = activeSegmentIndex;

    if (activeSegmentIndex < 0) return;

    const activeSegment = segments[activeSegmentIndex];
    const segStart = activeSegment.startOffset;
    const segEnd = activeSegment.endOffset;
    const nextHighlighted = spansRef.current.filter((span) => {
      const spanStart = Number(span.dataset.audioStartOffset);
      const spanEnd = Number(span.dataset.audioEndOffset);
      return spanStart < segEnd && spanEnd > segStart;
    });
    if (nextHighlighted.length > 0) {
      for (const span of nextHighlighted) {
        HIGHLIGHT_CLASSES.forEach((className) => span.classList.add(className));
      }
      highlightedSpansRef.current = nextHighlighted;
      if (scrollFollowEnabled) {
        const el = nextHighlighted[0];
        if (el) {
          const rect = el.getBoundingClientRect();
          const offsetPx = stickyBarVisible ? 80 : isPlayerOpen ? 160 : 96;
          const viewportHeight = window.innerHeight;
          const topInView = rect.top >= offsetPx;
          const bottomInView = rect.bottom <= viewportHeight - 24;
          const inView = topInView && bottomInView;
          if (!inView) {
            const scrollTop =
              rect.top < offsetPx
                ? window.scrollY + rect.top - offsetPx
                : window.scrollY + rect.bottom - viewportHeight + 24;
            window.scrollTo({
              top: Math.max(0, scrollTop),
              behavior: prefersReducedMotion ? "auto" : "smooth",
            });
          }
        }
      }
    }
  }, [
    currentTime,
    segments,
    scrollFollowEnabled,
    isPlayerOpen,
    stickyBarVisible,
    prefersReducedMotion,
  ]);

  // When sticky bar is visible, reserve enough top margin so highlighted text scrolls below it (not under it)
  const scrollMarginClass = stickyBarVisible
    ? "[&_[data-audio-start-offset]]:scroll-mt-32"
    : isPlayerOpen
      ? "[&_[data-audio-start-offset]]:scroll-mt-36"
      : "[&_[data-audio-start-offset]]:scroll-mt-24";
  const transitionClass =
    "[&_[data-audio-start-offset]]:transition-colors [&_[data-audio-start-offset]]:duration-150 [&_[data-audio-start-offset]]:motion-reduce:duration-0";

  return (
    <div ref={bodyRef} className={`${scrollMarginClass} ${transitionClass}`}>
      {children}
    </div>
  );
}
