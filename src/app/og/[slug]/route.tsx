import type { NextRequest } from "next/server";
import { defaultLocale, getDictionary, parseLocale } from "@/i18n";
import { localizeProject } from "@/i18n/localize";
import { getContainer } from "@/lib/container";
import { renderOgCard } from "@/lib/og-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// share image for a project, ?lang=tr for Turkish
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // drawing the image is slow, so throw out bad slugs before that
  if (!SLUG.test(slug)) return new Response("Not found", { status: 404 });
  const locale = parseLocale(req.nextUrl.searchParams.get("lang") ?? "") ?? defaultLocale;

  const { projectService, resumeService } = getContainer();
  const [project, profile] = await Promise.all([
    projectService.getPublishedBySlug(slug), // cached, returns null for drafts
    resumeService.getResume().then((r) => r.profile).catch(() => null),
  ]);
  if (!project) return new Response("Not found", { status: 404 });
  const p = localizeProject(project, locale);

  return renderOgCard({
    eyebrow: getDictionary(locale).og.project,
    title: p.title,
    subtitle: p.summary || undefined,
    chips: p.techStack,
    footer: profile?.name,
  });
}
