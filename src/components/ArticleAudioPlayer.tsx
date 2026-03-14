"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioPlayback } from "@/components/AudioPlaybackContext";

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

export default function ArticleAudioPlayer({
  hasAudio,
  audioUrl,
  subtitlesUrl,
  highlightMode = "transcript",
  label,
  ariaLabel,
  readAlongHint,
  loadingLabel,
  errorLabel,
  retryLabel,
  playLabel,
  pauseLabel,
  progressAriaLabel,
  speedMenuAriaLabel,
  scrollFollowLabel,
  scrollFollowHint,
  scrollFollowOn,
  scrollFollowOff,
  downloadLabel,
}: {
  hasAudio: boolean;
  audioUrl: string;
  subtitlesUrl?: string;
  highlightMode?: "transcript" | "body";
  label: string;
  ariaLabel: string;
  readAlongHint?: string;
  loadingLabel?: string;
  errorLabel?: string;
  retryLabel?: string;
  playLabel?: string;
  pauseLabel?: string;
  progressAriaLabel?: string;
  speedMenuAriaLabel?: string;
  scrollFollowLabel?: string;
  scrollFollowHint?: string;
  scrollFollowOn?: string;
  scrollFollowOff?: string;
  downloadLabel?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playback = useAudioPlayback();
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [playbackRateIndex, setPlaybackRateIndex] = useState(1); // 1 -> 1x
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const durationSeconds = playback?.duration ?? duration;
  const currentTimeSeconds = playback?.currentTime ?? currentTime;
  const isPlayingState = playback ? playback.isPlaying : isPlaying;
  const error = playback?.error ?? localError;

  const syncFromAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = audio.currentTime;
    setCurrentTime(t);
    playback?.setCurrentTime(t);
  }, [playback]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      playback?.setDuration(audio.duration);
      setLocalError(null);
      playback?.setError(null);
      setLoading(false);
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    const handleDurationChange = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
        playback?.setDuration(audio.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      playback?.setIsPlaying(true);
      syncFromAudio();
    };

    const handlePause = () => {
      setIsPlaying(false);
      playback?.setIsPlaying(false);
      syncFromAudio();
    };

    const handleTimeUpdate = () => syncFromAudio();
    const handleSeeked = () => syncFromAudio();

    const handleError = () => {
      setLoading(false);
      const msg = errorLabel ?? "Couldn't load audio.";
      setLocalError(msg);
      playback?.setError(msg);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("seeked", handleSeeked);
    audio.addEventListener("error", handleError);

    if (audio.readyState >= 1) {
      queueMicrotask(() => {
        setLoading(false);
        setDuration(audio.duration);
        playback?.setDuration(audio.duration);
      });
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("seeked", handleSeeked);
      audio.removeEventListener("error", handleError);
    };
  }, [audioUrl, errorLabel, playback, syncFromAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!playback || !subtitlesUrl || highlightMode !== "body") return;
    const pushTime = () => playback.setCurrentTime(audio.currentTime);
    audio.addEventListener("timeupdate", pushTime);
    audio.addEventListener("play", pushTime);
    audio.addEventListener("seeked", pushTime);
    return () => {
      audio.removeEventListener("timeupdate", pushTime);
      audio.removeEventListener("play", pushTime);
      audio.removeEventListener("seeked", pushTime);
    };
  }, [highlightMode, playback, subtitlesUrl]);

  useEffect(() => {
    if (!playback?.playbackRate) return;
    const idx = SPEEDS.indexOf(playback.playbackRate as (typeof SPEEDS)[number]);
    if (idx >= 0) queueMicrotask(() => setPlaybackRateIndex(idx));
  }, [playback?.playbackRate]);

  useEffect(() => {
    if (!playback?.registerAudioControls) return;
    const unregister = playback.registerAudioControls(
      () => audioRef.current?.pause(),
      () => audioRef.current?.play().catch(() => {}),
      (t: number) => {
        const audio = audioRef.current;
        if (audio && Number.isFinite(t)) audio.currentTime = t;
      },
      (r: number) => {
        const audio = audioRef.current;
        if (audio && Number.isFinite(r)) {
          audio.playbackRate = r;
          playback?.setPlaybackRate(r);
        }
      }
    );
    return unregister;
  }, [playback]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  const seek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      const val = Number(e.target.value);
      if (!audio || !Number.isFinite(val)) return;
      audio.currentTime = val;
      setCurrentTime(val);
      playback?.setCurrentTime(val);
    },
    [playback]
  );

  const cycleSpeed = useCallback(() => {
    const next = (playbackRateIndex + 1) % SPEEDS.length;
    const rate = SPEEDS[next];
    setPlaybackRateIndex(next);
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = rate;
      playback?.setPlaybackRate(rate);
    }
  }, [playbackRateIndex, playback]);

  const retry = useCallback(() => {
    setLocalError(null);
    playback?.setError(null);
    setLoading(true);
    const audio = audioRef.current;
    if (audio) {
      audio.load();
      audio.play().catch(() => {});
    }
  }, [playback]);

  const seekBy = useCallback(
    (deltaSeconds: number) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(durationSeconds)) return;
      const next = Math.max(0, Math.min(durationSeconds, currentTimeSeconds + deltaSeconds));
      audio.currentTime = next;
      setCurrentTime(next);
      playback?.setCurrentTime(next);
    },
    [currentTimeSeconds, durationSeconds, playback]
  );

  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekBy(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekBy(5);
          break;
      }
    },
    [togglePlayPause, seekBy]
  );

  if (!hasAudio) return null;

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900 p-4 space-y-3"
      role="group"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleContainerKeyDown}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" className="sr-only" aria-hidden>
        <a href={audioUrl} download className="text-emerald-600 dark:text-emerald-400 hover:underline">
          {label}
        </a>
      </audio>

      {loading && !error && (
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-emerald-600 dark:border-t-emerald-400" />
          <span>{loadingLabel ?? "Loading audio…"}</span>
        </div>
      )}

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{error}</span>
          <button
            type="button"
            onClick={retry}
            className="shrink-0 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 transition-colors"
          >
            {retryLabel ?? "Retry"}
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={togglePlayPause}
              className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 transition-colors motion-reduce:transition-none"
              aria-label={isPlayingState ? (pauseLabel ?? "Pause") : (playLabel ?? "Play")}
              title={isPlayingState ? (pauseLabel ?? "Pause") : (playLabel ?? "Play")}
              aria-live="polite"
            >
              {isPlayingState ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="flex-1 min-w-0 relative flex items-center h-2">
                <div
                  className="absolute inset-0 h-2 rounded-full bg-gray-200 dark:bg-gray-700"
                  aria-hidden
                />
                <div
                  className="absolute left-0 top-0 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500 transition-[width] duration-75 motion-reduce:duration-0"
                  style={{
                    width:
                      durationSeconds > 0
                        ? `${(currentTimeSeconds / durationSeconds) * 100}%`
                        : "0%",
                  }}
                  aria-hidden
                />
                <input
                  type="range"
                  min={0}
                  max={durationSeconds > 0 ? durationSeconds : 100}
                  value={currentTimeSeconds}
                  onChange={seek}
                  onInput={(e) => {
                    const val = Number((e.target as HTMLInputElement).value);
                    if (Number.isFinite(val)) {
                      setCurrentTime(val);
                      playback?.setCurrentTime(val);
                    }
                  }}
                  step={0.1}
                  className="relative z-10 w-full min-w-0 h-2 rounded-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:dark:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-600 [&::-moz-range-thumb]:dark:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-track]:bg-transparent"
                  aria-label={progressAriaLabel ?? "Playback progress"}
                  aria-valuemin={0}
                  aria-valuemax={durationSeconds > 0 ? Math.floor(durationSeconds) : 100}
                  aria-valuenow={Math.floor(currentTimeSeconds)}
                />
              </div>
              <span className="shrink-0 text-sm tabular-nums text-gray-600 dark:text-gray-400 min-w-[4.5rem]">
                {formatTime(currentTimeSeconds)} / {formatTime(durationSeconds)}
              </span>
              <a
                href={audioUrl}
                download
                className="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-neutral-900 rounded"
                aria-label={downloadLabel ?? "Download audio"}
              >
                {downloadLabel ?? "Download"}
              </a>
            </div>
            <button
              type="button"
              onClick={cycleSpeed}
              className="shrink-0 px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              aria-label={`${speedMenuAriaLabel ?? "Playback speed"}, ${SPEEDS[playbackRateIndex]}×`}
              title={`${speedMenuAriaLabel ?? "Playback speed"}: ${SPEEDS[playbackRateIndex]}× (click for ${SPEEDS[(playbackRateIndex + 1) % SPEEDS.length]}×)`}
            >
              {SPEEDS[playbackRateIndex]}×
            </button>
          </div>
          {subtitlesUrl && (readAlongHint || playback) && (
            <div className="flex flex-col gap-2">
              {playback && (
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  {readAlongHint && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{readAlongHint}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={playback.scrollFollowEnabled}
                      aria-label={`${scrollFollowLabel ?? "Scroll with highlight"}, ${playback.scrollFollowEnabled ? (scrollFollowOn ?? "On") : (scrollFollowOff ?? "Off")}`}
                      title={scrollFollowHint}
                      onClick={() => playback.setScrollFollowEnabled(!playback.scrollFollowEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-neutral-900 motion-reduce:transition-none ${
                        playback.scrollFollowEnabled
                          ? "bg-emerald-600 dark:bg-emerald-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out motion-reduce:transition-none ${
                          playback.scrollFollowEnabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                        aria-hidden
                      />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {scrollFollowLabel ?? "Scroll with highlight"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
