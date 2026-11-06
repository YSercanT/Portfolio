import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileHero } from "@/components/portfolio/profile-hero";
import { ProjectCard } from "@/components/portfolio/project-card";
import { EducationSection, ExperienceSection, PublicationsSection } from "@/components/portfolio/resume-sections";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary, parseLocale } from "@/i18n";
import { localizeProject, localizeResume } from "@/i18n/localize";
import { getContainer } from "@/lib/container";
import { languageAlternates } from "@/lib/site";
import type { Project } from "@/repositories/interfaces/project-repository";
import type { Resume } from "@/services/resume-service";

// rendered on every request, both reads below usually come from the cache
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string }> };

// Title, description and share image come from [lang]/layout.tsx. Don't set openGraph
// here, it would replace the layout's version completely instead of merging.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: { canonical: `/${lang}`, languages: languageAlternates("") } };
}

const EMPTY_RESUME: Resume = { profile: null, experience: [], education: [], publications: [] };

// if the db or cache fails, just hide that section instead of breaking the whole page
async function safe<T>(label: string, load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (err) {
    console.error(`[home] failed to load ${label}`, err);
    return fallback;
  }
}

export default async function HomePage({ params }: Props) {
  const locale = parseLocale((await params).lang);
  if (!locale) notFound();
  const dict = getDictionary(locale);

  const { projectService, resumeService } = getContainer();
  const [rawResume, rawProjects] = await Promise.all([
    safe("resume", () => resumeService.getResume(), EMPTY_RESUME),
    safe<Project[]>("projects", () => projectService.listPublished(), []),
  ]);
  const resume = localizeResume(rawResume, locale);
  const projects = rawProjects.map((p) => localizeProject(p, locale));

  return (
    <main className="mx-auto max-w-6xl px-6">
      <ProfileHero profile={resume.profile} locale={locale} labels={dict.hero} />

      <section id="projects" className="scroll-mt-20 pb-24">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">{dict.sections.projects}</h2>
        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>{dict.projects.emptyTitle}</CardTitle>
              <CardDescription>{dict.projects.emptyBody}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} locale={locale} labels={dict.projects} />
            ))}
          </div>
        )}
      </section>

      <ExperienceSection items={resume.experience} locale={locale} dict={dict} />
      <PublicationsSection items={resume.publications} locale={locale} dict={dict} />
      <EducationSection items={resume.education} locale={locale} dict={dict} />
    </main>
  );
}
