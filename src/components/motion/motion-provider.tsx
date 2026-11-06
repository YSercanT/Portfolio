"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

// Load the animation code after the page is up instead of in the main bundle.
// Nothing animates on first paint anyway.
const loadFeatures = () => import("./features").then((mod) => mod.default);

// Only loads the basic animation features (no layout or drag), and `strict`
// stops anyone from using the heavier motion.* components by accident.
// reducedMotion="user" respects the "reduce motion" setting of the OS.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

// shared timings so the animations feel consistent
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
