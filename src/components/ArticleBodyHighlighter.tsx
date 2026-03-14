"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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

const HIGHLIGHT_CLASSES = [
  "text-emerald-600",
  "dark:text-emerald-400",
  "bg-emerald-500/10",
  "dark:bg-emerald-400/10",
];

export default function ArticleBodyHighlighter({
  subtitlesUrl,
  expectedTextHash,
  children,
}: {
  subtitlesUrl?: string;
  expectedTextHash?: string;
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
          if (expectedTextHash && timingFile.textHash !== expectedTextHash) {
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
          setSegments(nextSegments);
        }
      })
      .catch(() => {
        // CORS or network error: leave segments empty (read-along disabled). Ensure promise is handled.
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
  }, [expectedTextHash, subtitlesUrl]);

  useEffect(() => {
    spansRef.current = bodyRef.current
      ? Array.from(
          bodyRef.current.querySelectorAll<AudioOffsetSpan>("[data-audio-start-offset][data-audio-end-offset]")
        )
      : [];
  }, [children, segments.length]);

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
    const nextHighlighted = spansRef.current.filter((span) => {
      const spanStart = Number(span.dataset.audioStartOffset);
      const spanEnd = Number(span.dataset.audioEndOffset);
      return spanStart < activeSegment.endOffset && spanEnd > activeSegment.startOffset;
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
