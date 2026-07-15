"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Slow, deliberate scroll-reveal. Fades + rises once when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 32,
  duration = 0.9,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div style={style}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: EASE }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
