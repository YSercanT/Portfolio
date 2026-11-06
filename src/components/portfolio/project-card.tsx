"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { hasProjectLinks, ProjectLinks } from "@/components/portfolio/project-links";
import { Badge } from "@/components/ui/badge";
import { parseYouTubeId } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Dictionary, Locale } from "@/i18n";
import type { Project } from "@/repositories/interfaces/project-repository";

interface ProjectCardProps {
  // already translated, see i18n/localize.ts
  project: Project;
  locale: Locale;
  labels: Pick<Dictionary["projects"], "liveDemo" | "github" | "kaggle">;
  // position in the grid, used to stagger the fade-in
  index?: number;
}

// Project card for the homepage grid.
// It fades in on scroll, lifts and glows on hover, and a hosted video plays muted
// while you hover (unless reduced motion is on). YouTube only gets a thumbnail here.
//
// The whole card is clickable: the title link has an ::after that covers the card.
// The GitHub/Kaggle/demo buttons sit above it with z-10 so they still work on their own.
// (Wrapping everything in one <a> isn't allowed since you can't nest links.)
export function ProjectCard({ project, index = 0, locale, labels }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const reduceMotion = useReducedMotion();

  const isVideo = project.demoMediaType === "video_hosted" && !!project.demoMediaUrl;
  const canPreview = isVideo && !reduceMotion;

  const startPreview = () => {
    const video = videoRef.current;
    if (!canPreview || !video) return;
    // play() throws if the mouse leaves quickly, that's fine
    video.play().then(() => setPlaying(true), () => undefined);
  };

  const stopPreview = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setPlaying(false);
  };

  return (
    <Reveal className="h-full" delay={Math.min(index, 5) * 0.07}>
      <article
        onPointerEnter={startPreview}
        onPointerLeave={stopPreview}
        onFocus={startPreview}
        onBlur={stopPreview}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
          // use `translate` here, not `transform`, so it doesn't fight with Framer on the wrapper
          "transition-[translate,box-shadow,border-color] duration-300 ease-out-expo",
          "hover:border-primary/40 hover:shadow-glow motion-safe:hover:-translate-y-1",
          "has-[a:focus-visible]:border-primary/60 has-[a:focus-visible]:shadow-glow",
        )}
      >
        <div className="relative aspect-video overflow-hidden border-b bg-muted">
          <CardMedia project={project} videoRef={videoRef} />

          {(isVideo || project.demoMediaType === "youtube_embed") && (
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                playing ? "opacity-0" : "opacity-100",
              )}
            >
              <span className="flex size-12 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-[scale,background-color] duration-300 ease-out-expo group-hover:bg-primary/80 group-hover:text-primary-foreground motion-safe:group-hover:scale-110">
                <Play className="size-5 translate-x-px fill-current" />
              </span>
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="flex items-center justify-between gap-2 font-semibold leading-none">
            <Link
              href={`/${locale}/projects/${project.slug}`}
              className="outline-none transition-colors group-hover:text-primary after:absolute after:inset-0 after:content-['']"
            >
              {project.title}
            </Link>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-[translate,color] duration-300 group-hover:text-primary motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
          </h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{project.summary}</p>
          {project.techStack.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
              {project.techStack.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          {hasProjectLinks(project) && (
            // z-10 keeps the buttons clickable above the card link
            <ProjectLinks project={project} labels={labels} className={cn("relative z-10 pt-1", project.techStack.length === 0 && "mt-auto")} />
          )}
        </div>
      </article>
    </Reveal>
  );
}

const ZOOM = "transition-[scale] duration-700 ease-out-expo motion-safe:group-hover:scale-[1.04]";

function CardMedia({
  project,
  videoRef,
}: {
  project: Project;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const { demoMediaType: type, demoMediaUrl: url, title } = project;

  if (type === "image" && url) {
    return (
      <Image
        src={url}
        alt={`${title} screenshot`}
        fill
        sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
        unoptimized={!url.startsWith("/")}
        className={cn("object-cover", ZOOM)}
      />
    );
  }

  if (type === "video_hosted" && url) {
    return (
      <video
        ref={videoRef}
        // #t=0.1 makes Safari show the first frame instead of a black box
        src={`${url}#t=0.1`}
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
        aria-hidden
        className={cn("size-full object-cover", ZOOM)}
      />
    );
  }

  const youTubeId = type === "youtube_embed" && url ? parseYouTubeId(url) : null;
  if (youTubeId) {
    return (
      <Image
        src={`https://i.ytimg.com/vi/${youTubeId}/hqdefault.jpg`}
        alt={`${title} video thumbnail`}
        fill
        sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
        unoptimized
        className={cn("object-cover", ZOOM)}
      />
    );
  }

  // no media yet, show a placeholder
  return (
    <div aria-hidden className="size-full bg-gradient-to-br from-primary/25 via-accent-2/10 to-card">
      <div className="bg-grid size-full opacity-60" />
    </div>
  );
}
