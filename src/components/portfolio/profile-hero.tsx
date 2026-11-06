import Image from "next/image";
import { ArrowRight, BriefcaseBusiness, CodeXml } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Dictionary, Locale } from "@/i18n";
import type { Profile } from "@/repositories/interfaces/resume-repositories";

export function ProfileHero({
  profile,
  locale,
  labels,
}: {
  profile: Profile | null;
  locale: Locale;
  labels: Dictionary["hero"];
}) {
  const name = profile?.name ?? "The Hub";
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <section className="relative py-20 sm:py-28">
      {/* background grid and glow */}
      <div aria-hidden className="bg-grid pointer-events-none absolute -top-14 left-1/2 -z-10 h-[520px] w-screen -translate-x-1/2" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-72 w-[min(48rem,100%)] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/20 to-accent-2/20 blur-3xl"
      />
      <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-glow-sm sm:size-28">
          {profile?.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={name}
              fill
              sizes="112px"
              priority
              unoptimized={!profile.avatarUrl.startsWith("/")}
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl font-semibold text-primary">
              {initials}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-gradient pb-1 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{name}</h1>
          {profile?.title && <p className="mt-2 text-lg text-primary">{profile.title}</p>}
        </div>
      </div>
      {profile?.bio && <p className="mt-8 max-w-3xl text-lg text-muted-foreground text-pretty">{profile.bio}</p>}
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href={`/${locale}#projects`}>
            {labels.viewProjects} <ArrowRight />
          </Link>
        </Button>
        {profile?.githubUrl && (
          <Button asChild size="lg" variant="outline">
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
              <CodeXml /> GitHub
            </a>
          </Button>
        )}
        {profile?.linkedinUrl && (
          <Button asChild size="lg" variant="outline">
            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
              <BriefcaseBusiness /> LinkedIn
            </a>
          </Button>
        )}
      </div>
    </section>
  );
}
