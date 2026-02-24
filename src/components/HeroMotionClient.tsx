"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

interface HeroMotionClientProps {
  children: ReactNode;
}

export default function HeroMotionClient({ children }: HeroMotionClientProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div>{children}</div>;
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
