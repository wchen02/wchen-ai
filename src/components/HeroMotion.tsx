"use client";

import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import HeroMotionClient from "./HeroMotionClient";

interface HeroMotionProps {
  children: ReactNode;
}

let clientMounted = false;

function subscribeToMounted(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  queueMicrotask(() => {
    clientMounted = true;
    callback();
  });
  return () => {};
}

function getMountedSnapshot() {
  return clientMounted;
}

function getServerSnapshot() {
  return false;
}

/**
 * Renders children in the initial HTML (for SSR and no-JS) and the animated
 * version after mount so the hero is always readable without JavaScript.
 */
export default function HeroMotion({ children }: HeroMotionProps) {
  const mounted = useSyncExternalStore(
    subscribeToMounted,
    getMountedSnapshot,
    getServerSnapshot,
  );

  if (!mounted) {
    return <>{children}</>;
  }
  return <HeroMotionClient>{children}</HeroMotionClient>;
}
