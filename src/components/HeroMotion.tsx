"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface HeroMotionProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export default function HeroMotion({ children, ...props }: HeroMotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
