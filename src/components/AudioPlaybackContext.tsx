"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Noop = () => void;
type SeekFn = (t: number) => void;

interface AudioPlaybackContextValue {
  currentTime: number;
  setCurrentTime: (t: number) => void;
  duration: number;
  isPlaying: boolean;
  error: string | null;
  playbackRate: number;
  scrollFollowEnabled: boolean;
  setDuration: (d: number) => void;
  setIsPlaying: (p: boolean) => void;
  setError: (e: string | null) => void;
  setPlaybackRate: (r: number) => void;
  setScrollFollowEnabled: (v: boolean) => void;
  registerAudioControls: (pause: Noop, play: Noop, seek: SeekFn, setPlaybackRateImpl: SeekFn) => () => void;
  requestPause: () => void;
  requestPlay: () => void;
  requestSeek: (t: number) => void;
  requestSetPlaybackRate: (r: number) => void;
}

const noop: Noop = () => {};
const noopSeek: SeekFn = () => {};

const AudioPlaybackContext = createContext<AudioPlaybackContextValue | null>(null);

function AudioPlaybackProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [scrollFollowEnabled, setScrollFollowEnabled] = useState(true);
  const pauseRef = useRef<Noop>(noop);
  const playRef = useRef<Noop>(noop);
  const seekRef = useRef<SeekFn>(noopSeek);
  const setPlaybackRateRef = useRef<SeekFn>(noopSeek);

  const registerAudioControls = useCallback(
    (pause: Noop, play: Noop, seek: SeekFn, setPlaybackRateImpl: SeekFn) => {
      pauseRef.current = pause;
      playRef.current = play;
      seekRef.current = seek;
      setPlaybackRateRef.current = setPlaybackRateImpl;
      return () => {
        pauseRef.current = noop;
        playRef.current = noop;
        seekRef.current = noopSeek;
        setPlaybackRateRef.current = noopSeek;
      };
    },
    []
  );

  const value: AudioPlaybackContextValue = {
    currentTime,
    setCurrentTime: useCallback((t: number) => setCurrentTime(t), []),
    duration,
    setDuration: useCallback((d: number) => setDuration(d), []),
    isPlaying,
    setIsPlaying: useCallback((p: boolean) => setIsPlaying(p), []),
    error,
    setError: useCallback((e: string | null) => setError(e), []),
    playbackRate,
    setPlaybackRate: useCallback((r: number) => setPlaybackRate(r), []),
    scrollFollowEnabled,
    setScrollFollowEnabled: useCallback((v: boolean) => setScrollFollowEnabled(v), []),
    registerAudioControls,
    requestPause: useCallback(() => pauseRef.current(), []),
    requestPlay: useCallback(() => playRef.current(), []),
    requestSeek: useCallback((t: number) => seekRef.current(t), []),
    requestSetPlaybackRate: useCallback((r: number) => setPlaybackRateRef.current(r), []),
  };
  return (
    <AudioPlaybackContext.Provider value={value}>
      {children}
    </AudioPlaybackContext.Provider>
  );
}

export { AudioPlaybackProvider };
export default AudioPlaybackProvider;

export function useAudioPlayback(): AudioPlaybackContextValue | null {
  return useContext(AudioPlaybackContext);
}
