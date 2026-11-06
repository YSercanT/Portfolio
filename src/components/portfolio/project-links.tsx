import { Database, ExternalLink } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n";
import type { Project } from "@/repositories/interfaces/project-repository";

type LinkFields = Pick<Project, "githubRepoUrl" | "liveSiteUrl" | "kaggleUrl">;

interface ProjectLinksProps {
  labels: Pick<Dictionary["projects"], "liveDemo" | "github" | "kaggle">;
  project: LinkFields;
  // card = small buttons, page = bigger ones with Live Demo highlighted
  variant?: "card" | "page";
  className?: string;
}

export function hasProjectLinks(p: LinkFields): boolean {
  return Boolean(p.githubRepoUrl || p.liveSiteUrl || p.kaggleUrl);
}

// GitHub / Kaggle / Live Demo buttons. Shows nothing if none of the links are set.
// They open in a new tab with noopener noreferrer, and the URLs were already checked on save.
export function ProjectLinks({ project, labels, variant = "card", className }: ProjectLinksProps) {
  if (!hasProjectLinks(project)) return null;

  const size = variant === "page" ? "default" : "sm";
  const lift = cn(
    "group/cta motion-safe:hover:-translate-y-px transition-[translate,color,background-color,border-color,box-shadow]",
    // keep them small on cards so all three fit on one line
    variant === "card" && "h-7 gap-1.5 px-2.5 text-xs [&_svg]:size-3.5",
  );
  const external = { target: "_blank", rel: "noopener noreferrer" } as const;

  return (
    <div className={cn("flex flex-wrap items-center", variant === "card" ? "gap-1.5" : "gap-2", className)}>
      {project.liveSiteUrl && (
        <Button
          asChild
          size={size}
          variant={variant === "page" ? "default" : "outline"}
          className={cn(lift, variant === "card" && "hover:text-primary")}
        >
          <a href={project.liveSiteUrl} {...external}>
            {labels.liveDemo}
            <ExternalLink className="transition-[translate] duration-200 ease-out-expo motion-safe:group-hover/cta:translate-x-0.5 motion-safe:group-hover/cta:-translate-y-0.5" />
          </a>
        </Button>
      )}
      {project.githubRepoUrl && (
        <Button asChild size={size} variant="outline" className={cn(lift, "hover:text-primary hover:shadow-glow-sm")}>
          <a href={project.githubRepoUrl} {...external}>
            <GitHubIcon /> {labels.github}
          </a>
        </Button>
      )}
      {project.kaggleUrl && (
        <Button asChild size={size} variant="outline" className={cn(lift, "hover:text-primary hover:shadow-glow-sm")}>
          <a href={project.kaggleUrl} {...external}>
            <Database /> {labels.kaggle}
          </a>
        </Button>
      )}
    </div>
  );
}
