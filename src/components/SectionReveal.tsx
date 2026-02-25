"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { type ReactNode, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function SectionReveal({ children, className, id }: SectionRevealProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const prefersReducedMotion = useReducedMotion();

  if (!isClient || prefersReducedMotion) {
    return (
      <section className={className} id={id}>
        {children}
      </section>
    );
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <m.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={className}
        id={id}
      >
        {children}
      </m.section>
    </LazyMotion>
  );
}
