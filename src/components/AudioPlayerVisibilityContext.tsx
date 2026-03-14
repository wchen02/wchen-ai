"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAudioPlayback } from "@/components/AudioPlaybackContext";

interface AudioPlayerVisibilityContextValue {
  isOpen: boolean;
  toggle: () => void;
  playerContainerRef: React.RefObject<HTMLDivElement | null>;
  stickyDismissed: boolean;
  setStickyDismissed: (d: boolean) => void;
  stickyBarVisible: boolean;
  setStickyBarVisible: (v: boolean) => void;
}

const AudioPlayerVisibilityContext = createContext<AudioPlayerVisibilityContextValue | null>(null);

export function AudioPlayerVisibilityProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  return (
    <AudioPlayerVisibilityContext.Provider
      value={{
        isOpen,
        toggle,
        playerContainerRef,
        stickyDismissed,
        setStickyDismissed: useCallback((d: boolean) => setStickyDismissed(d), []),
        stickyBarVisible,
        setStickyBarVisible: useCallback((v: boolean) => setStickyBarVisible(v), []),
      }}
    >
      {children}
    </AudioPlayerVisibilityContext.Provider>
  );
}

export function useAudioPlayerVisibility(): AudioPlayerVisibilityContextValue | null {
  return useContext(AudioPlayerVisibilityContext);
}

export function AudioPlayerTrigger({
  label,
  hideLabel,
  ariaLabel,
}: {
  label: string;
  hideLabel: string;
  ariaLabel: string;
}) {
  const visibility = useAudioPlayerVisibility();
  if (!visibility) return null;

  const isOpen = visibility.isOpen;
  return (
    <button
      type="button"
      onClick={visibility.toggle}
      className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 rounded"
      aria-label={isOpen ? hideLabel : ariaLabel}
      aria-expanded={isOpen}
    >
      {isOpen ? hideLabel : label}
    </button>
  );
}

export function AudioPlayerGate({ children }: { children: ReactNode }) {
  const visibility = useAudioPlayerVisibility();
  if (!visibility?.isOpen) return null;
  return <>{children}</>;
}

export function InPagePlayerWrapper({ children }: { children: ReactNode }) {
  const visibility = useAudioPlayerVisibility();
  if (!visibility) return <>{children}</>;
  return <div ref={visibility.playerContainerRef}>{children}</div>;
}

const STICKY_BAR_HEIGHT_REM = 4;
const SPEEDS = [0.75, 1, 1.25, 1.5] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayIconSm({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function PauseIconSm({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

export function StickyAudioPlayerBar({
  playLabel = "Play",
  pauseLabel = "Pause",
  progressAriaLabel = "Playback progress",
  speedMenuAriaLabel = "Playback speed",
  closeStickyLabel = "Close player",
  scrollFollowLabel = "Scroll with highlight",
  scrollFollowShortLabel = "Scroll",
  scrollFollowHint = "Page scrolls to the current sentence as you listen",
  scrollFollowOn = "On",
  scrollFollowOff = "Off",
  title: articleTitle,
}: {
  playLabel?: string;
  pauseLabel?: string;
  progressAriaLabel?: string;
  speedMenuAriaLabel?: string;
  closeStickyLabel?: string;
  scrollFollowLabel?: string;
  scrollFollowShortLabel?: string;
  scrollFollowHint?: string;
  scrollFollowOn?: string;
  scrollFollowOff?: string;
  title?: string;
}) {
  const visibility = useAudioPlayerVisibility();
  const playback = useAudioPlayback();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const tickRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    if (!visibility?.isOpen || !visibility.playerContainerRef?.current || !playback) return;

    const update = () => {
      const el = visibility.playerContainerRef?.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrolledPast = rect.bottom < 0;
      if (!scrolledPast) visibility.setStickyDismissed(false);
      const playbackStarted = playback.currentTime > 0 || playback.isPlaying;
      const next =
        visibility.isOpen && scrolledPast && playbackStarted && !visibility.stickyDismissed;
      setShowStickyBar(next);
    };

    const onScrollOrResize = () => {
      if (tickRef.current !== null) return;
      tickRef.current = requestAnimationFrame(() => {
        tickRef.current = null;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (tickRef.current !== null) cancelAnimationFrame(tickRef.current);
    };
  }, [
    visibility?.isOpen,
    visibility?.stickyDismissed,
    visibility?.playerContainerRef,
    visibility?.setStickyDismissed,
    visibility?.setStickyBarVisible,
    playback?.currentTime,
    playback?.isPlaying,
    playback,
  ]);

  useEffect(() => {
    visibility?.setStickyBarVisible(showStickyBar ?? false);
    return () => {
      visibility?.setStickyBarVisible(false);
    };
  }, [showStickyBar, visibility?.setStickyBarVisible]);

  if (!showStickyBar || !playback) return null;

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(playback.playbackRate as (typeof SPEEDS)[number]);
    const nextIdx = idx < 0 ? 1 : (idx + 1) % SPEEDS.length;
    playback.requestSetPlaybackRate(SPEEDS[nextIdx]);
  };

  const handleClose = () => {
    playback.requestPause();
    visibility?.setStickyDismissed(true);
    setShowStickyBar(false);
  };

  const currentSpeedIndex =
    SPEEDS.indexOf(playback.playbackRate as (typeof SPEEDS)[number]) >= 0
      ? SPEEDS.indexOf(playback.playbackRate as (typeof SPEEDS)[number])
      : 1;

  return (
    <>
      <div
        className="w-full shrink-0 bg-transparent"
        style={{ height: `${STICKY_BAR_HEIGHT_REM}rem` }}
        aria-hidden
      />
      <div className="fixed left-0 right-0 top-0 z-40 w-full bg-background border-b border-gray-200 dark:border-gray-800 py-2 md:py-3">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {articleTitle && (
              <span
                className="shrink-0 max-w-[8rem] sm:max-w-[12rem] text-sm font-medium text-gray-700 dark:text-gray-300 truncate"
                title={articleTitle}
              >
                {articleTitle}
              </span>
            )}
            <button
              type="button"
              onClick={playback.isPlaying ? playback.requestPause : playback.requestPlay}
              className="shrink-0 flex h-11 w-11 min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 transition-colors"
              aria-label={playback.isPlaying ? pauseLabel : playLabel}
              title={playback.isPlaying ? pauseLabel : playLabel}
            >
              {playback.isPlaying ? (
                <PauseIconSm className="h-5 w-5" />
              ) : (
                <PlayIconSm className="h-5 w-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 relative flex items-center h-2">
                <div
                  className="absolute inset-0 h-2 rounded-full bg-gray-200 dark:bg-gray-700"
                  aria-hidden
                />
                <div
                  className="absolute left-0 top-0 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500 transition-[width] duration-75 motion-reduce:duration-0"
                  style={{
                    width:
                      playback.duration > 0
                        ? `${(playback.currentTime / playback.duration) * 100}%`
                        : "0%",
                  }}
                  aria-hidden
                />
                <input
                  type="range"
                  min={0}
                  max={playback.duration > 0 ? playback.duration : 100}
                  value={playback.currentTime}
                  onChange={(e) => playback.requestSeek(Number(e.target.value))}
                  onInput={(e) =>
                    playback.requestSeek(Number((e.target as HTMLInputElement).value))
                  }
                  step={0.1}
                  className="relative z-10 w-full min-w-0 h-2 rounded-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:dark:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-600 [&::-moz-range-thumb]:dark:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-track]:bg-transparent"
                  aria-label={progressAriaLabel}
                />
              </div>
              <span className="shrink-0 text-sm tabular-nums text-gray-600 dark:text-gray-400 min-w-[4rem]">
                {formatTime(playback.currentTime)} / {formatTime(playback.duration)}
              </span>
            </div>
            <button
              type="button"
              onClick={cycleSpeed}
              className="shrink-0 px-2 py-1.5 min-h-[2.75rem] min-w-[2.75rem] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 transition-colors inline-flex items-center justify-center"
              aria-label={`${speedMenuAriaLabel}, ${SPEEDS[currentSpeedIndex]}×`}
              title={`${speedMenuAriaLabel}: ${SPEEDS[currentSpeedIndex]}× (click for ${SPEEDS[(currentSpeedIndex + 1) % SPEEDS.length]}×)`}
            >
              {SPEEDS[currentSpeedIndex]}×
            </button>
            <div className="shrink-0 flex items-center gap-1.5">
              <span className="hidden sm:inline text-xs font-medium text-gray-500 dark:text-gray-400">
                {scrollFollowShortLabel}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={playback.scrollFollowEnabled}
                aria-label={`${scrollFollowLabel}, ${playback.scrollFollowEnabled ? scrollFollowOn : scrollFollowOff}`}
                title={scrollFollowHint}
                onClick={() => playback.setScrollFollowEnabled(!playback.scrollFollowEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 motion-reduce:transition-none ${
                  playback.scrollFollowEnabled
                    ? "bg-emerald-600 dark:bg-emerald-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out motion-reduce:transition-none ${
                    playback.scrollFollowEnabled ? "translate-x-4" : "translate-x-0.5"
                  }`}
                  aria-hidden
                />
              </button>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 flex h-10 w-10 min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 transition-colors"
              aria-label={closeStickyLabel}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
