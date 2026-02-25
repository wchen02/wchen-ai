"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { type ReactNode, Children, cloneElement, isValidElement } from "react";

const STAGGER_DELAY = 0.08;
const BLOCK_DURATION = 0.4;

interface HeroMotionClientProps {
  children: ReactNode;
}

export default function HeroMotionClient({ children }: HeroMotionClientProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div>{children}</div>;
  }

  const child = Children.only(children);
  if (!isValidElement(child) || typeof child.type === "string") {
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

  const headerChildren = Children.toArray((child.props as { children?: ReactNode }).children);

  return (
    <LazyMotion features={domAnimation} strict>
      {cloneElement(child as React.ReactElement<{ children?: ReactNode; className?: string }>, {
        children: headerChildren.map((block, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: BLOCK_DURATION,
              delay: i * STAGGER_DELAY,
              ease: "easeOut",
            }}
            className={i === 1 ? "font-mono tracking-tight" : undefined}
          >
            {i === 1 && isValidElement(block)
              ? cloneElement(block as React.ReactElement<{ children?: ReactNode }>, {
                  children: (
                    <>
                      <span className="text-emerald-600 dark:text-emerald-400/90 select-none" aria-hidden="true">$ </span>
                      {(block.props as { children?: ReactNode }).children}
                    </>
                  ),
                })
              : block}
          </m.div>
        )),
      })}
    </LazyMotion>
  );
}
