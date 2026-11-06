"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary, Locale } from "@/i18n";
import { cn } from "@/lib/utils";

const SECTIONS = ["projects", "experience", "publications"] as const;

// Header links with an active state. On a project page "Projects" is active.
// On the homepage it highlights whichever section is in the middle of the screen.
export function SiteNav({ locale, labels }: { locale: Locale; labels: Dictionary["nav"] }) {
  const pathname = usePathname();
  const [section, setSection] = useState<string | null>(null);

  const home = `/${locale}`;
  const isHome = pathname === home;

  useEffect(() => {
    if (!isHome) return;
    const targets = SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setSection(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }, // thin strip in the middle of the screen
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [isHome]);

  const activeId = pathname.startsWith(`${home}/projects`) ? "projects" : isHome ? section : null;

  return (
    <nav data-nav="sections" className="flex items-center text-[13px] sm:gap-1 sm:text-sm">
      {SECTIONS.map((id) => {
        const active = activeId === id;
        const label = labels[id];
        return (
          <Link
            key={id}
            href={`${home}#${id}`}
            aria-current={active ? "true" : undefined}
            className={cn(
              id !== "projects" && "hidden min-[420px]:inline-block",
              "relative rounded-md px-2 py-1.5 font-medium whitespace-nowrap transition-colors hover:text-primary sm:px-3",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {label}
            {/* underline for the active link */}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-2 -bottom-[11px] sm:inset-x-3 h-px origin-center bg-primary shadow-glow-sm transition-[scale] duration-300 ease-out-expo",
                active ? "scale-x-100" : "scale-x-0",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
