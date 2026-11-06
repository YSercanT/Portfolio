"use client";

import { m } from "framer-motion";
import { EASE_OUT_EXPO } from "@/components/motion/motion-provider";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  // which tag to render, use li inside lists
  as?: "div" | "li";
  // delay in seconds, handy for staggering grid items
  delay?: number;
}

// Fades its children in and slides them up the first time they scroll into view.
// Only animates opacity and transform, and only once, so it stays cheap.
// data-reveal is there so the <noscript> style in the layout can show everything without JS.
export function Reveal({ children, className, as = "div", delay = 0 }: RevealProps) {
  const Component = as === "li" ? m.li : m.div;
  return (
    <Component
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      // start a bit before it's fully on screen
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </Component>
  );
}
