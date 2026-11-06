"use client";

import { useEffect } from "react";
import { m } from "framer-motion";
import { EASE_OUT_EXPO } from "@/components/motion/motion-provider";

// false on the server and on the first render, true after that.
// This way the first page shows right away and only later navigations fade in.
let hasHydrated = false;

// Fades pages in. Used in app/[lang]/template.tsx, which Next remounts on
// every navigation.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const animateIn = hasHydrated;

  useEffect(() => {
    hasHydrated = true;
  }, []);

  return (
    <m.div
      initial={animateIn ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
    >
      {children}
    </m.div>
  );
}
