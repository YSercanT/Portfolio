import Image from "next/image";
import type { DemoMediaType } from "@/lib/db/schema";
import { parseYouTubeId } from "@/lib/media";
import { cn } from "@/lib/utils";

interface ProjectMediaProps {
  type: DemoMediaType | null;
  url: string | null;
  title: string;
  className?: string;
  // set this when the media is at the top of the page so it loads first
  priority?: boolean;
}

// Shows the project's demo: a <video> for uploaded videos, a youtube-nocookie
// iframe for YouTube and next/image for pictures. Renders nothing if there's no usable media.
export function ProjectMedia({ type, url, title, className, priority = false }: ProjectMediaProps) {
  if (!type || !url) return null;

  const frame = cn("relative aspect-video w-full overflow-hidden rounded-xl border bg-muted", className);

  if (type === "video_hosted") {
    return (
      <div className={frame}>
        <video
          src={url}
          controls
          playsInline
          preload="metadata" // only grab size and length, not the whole video
          className="absolute inset-0 size-full bg-black object-contain"
          aria-label={`${title} demo video`}
        />
      </div>
    );
  }

  if (type === "youtube_embed") {
    const videoId = parseYouTubeId(url);
    if (!videoId) return null;
    return (
      <div className={frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
          title={`${title} demo`}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }

  return (
    <div className={frame}>
      <Image
        src={url}
        alt={`${title} screenshot`}
        fill
        sizes="(min-width: 1024px) 768px, 100vw"
        priority={priority}
        // external images aren't allowed in remotePatterns, so skip the optimizer for them
        unoptimized={!url.startsWith("/")}
        className="object-cover"
      />
    </div>
  );
}
