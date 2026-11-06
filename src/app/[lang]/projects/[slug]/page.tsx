import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { ProjectLinks } from "@/components/portfolio/project-links";
import { ProjectMedia } from "@/components/project-media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDictionary, parseLocale, type Locale } from "@/i18n";
import { localizeProject } from "@/i18n/localize";
import { getContainer } from "@/lib/container";
import { baseOpenGraph, languageAlternates, projectOgImage, truncate } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ lang: string; slug: string }> };

// cache() so generateMetadata and the page don't both hit the db
const getProject = cache(async (slug: string, locale: Locale) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null; // don't bother looking up obviously bad slugs
  const project = await getContainer().projectService.getPublishedBySlug(slug);
  return project && localizeProject(project, locale);
});

// first normal paragraph of the write-up, used when there's no summary
function firstParagraph(md: string): string {
  const para = md.split(/\n\s*\n/).find((p) => p.trim() && !/^\s*(#|>|\||[-*]\s|```)/.test(p)) ?? "";
  return para.replace(/[*_`[\]]|\(.*?\)/g, "");
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const project = locale && (await getProject(slug, locale));
  // drafts and unknown slugs: don't reveal anything and don't index
  if (!locale || !project) {
    return { title: getDictionary(locale ?? "en").projects.notFound, robots: { index: false, follow: false } };
  }

  const path = `/projects/${project.slug}`;
  const description = truncate(
    project.summary || firstParagraph(project.contentMd) || getDictionary(locale).meta.siteDescription,
  );
  const image = projectOgImage(project, locale);

  return {
    title: project.title,
    description,
    keywords: project.techStack,
    // tells Google the /en and /tr pages are the same content
    alternates: { canonical: `/${locale}${path}`, languages: languageAlternates(path) },
    openGraph: {
      ...baseOpenGraph(locale),
      type: "article",
      url: `/${locale}${path}`,
      title: project.title,
      description,
      images: [image],
      publishedTime: project.publishedAt?.toISOString(),
      modifiedTime: project.updatedAt.toISOString(),
      tags: project.techStack,
    },
    twitter: { card: "summary_large_image", title: project.title, description, images: [image.url] },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  if (!locale) notFound();
  const project = await getProject(slug, locale);
  if (!project) notFound();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
        <Link href={`/${locale}#projects`}>
          <ArrowLeft /> {dict.projects.allProjects}
        </Link>
      </Button>

      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">{project.title}</h1>
        {project.summary && <p className="mt-4 text-lg text-muted-foreground text-pretty">{project.summary}</p>}
        {project.techStack.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.techStack.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        )}
        <ProjectLinks project={project} labels={dict.projects} variant="page" className="mt-6" />
      </header>

      <ProjectMedia
        type={project.demoMediaType}
        url={project.demoMediaUrl}
        title={project.title}
        priority
        className="mb-12"
      />

      {project.contentMd && <Markdown>{project.contentMd}</Markdown>}
    </main>
  );
}
