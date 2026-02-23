"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useSyncExternalStore } from "react";

const HeroMotionClient = dynamic(
  () => import("./HeroMotionClient"),
  { ssr: false }
);

const emptySubscribe = () => () => {};

interface HeroMotionProps {
  children: ReactNode;
}

export default function HeroMotion({ children }: HeroMotionProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!isClient) {
    return <div>{children}</div>;
  }

  return <HeroMotionClient>{children}</HeroMotionClient>;
}
