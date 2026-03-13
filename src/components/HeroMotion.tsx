"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const HeroMotionClient = dynamic(() => import("./HeroMotionClient"), { ssr: false });

interface HeroMotionProps {
  children: ReactNode;
}

export default function HeroMotion({ children }: HeroMotionProps) {
  return <HeroMotionClient>{children}</HeroMotionClient>;
}
