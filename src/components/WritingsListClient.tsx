"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import type { Writing } from "@/lib/schemas";
import WritingCard from "@/components/WritingCard";

const STAGGER_DELAY = 0.06;

interface WritingsListClientProps {
  writings: Writing[];
}

export default function WritingsListClient({ writings }: WritingsListClientProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="grid gap-6">
        {writings.map((writing) => (
          <WritingCard key={writing.slug} writing={writing} />
        ))}
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="grid gap-6">
        {writings.map((writing, i) => (
          <m.div
            key={writing.slug}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * STAGGER_DELAY, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            className="transition-[box-shadow] duration-200 hover:shadow-[0_4px_14px_-4px_rgba(16,185,129,0.2)] dark:hover:shadow-[0_4px_14px_-4px_rgba(16,185,129,0.15)]"
          >
            <WritingCard writing={writing} />
          </m.div>
        ))}
      </div>
    </LazyMotion>
  );
}
