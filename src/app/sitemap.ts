import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getContainer } from "@/lib/container";
import { absoluteUrl, languageAlternates } from "@/lib/site";

// built on each request, so new projects show up right away and the build
// doesn't need a database
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

// One entry per page per language, each listing all language versions.
// That's how Google knows /en/x and /tr/x are the same page, and it wants the
// links on every version, not just one.
function localized(path: string, base: Omit<Entry, "url" | "alternates">): Entry[] {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(path)).map(([lang, href]) => [lang, absoluteUrl(href)]),
  );
  return locales.map((locale) => ({ ...base, url: absoluteUrl(`/${locale}${path}`), alternates: { languages } }));
}

// homepage plus every published project in both languages (no drafts)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projectService, resumeService } = getContainer();
  const [projects, profile] = await Promise.all([
    projectService.listSitemapEntries().catch((err) => {
      console.error("[sitemap] failed to load projects", err);
      return [];
    }),
    resumeService.getResume().then((r) => r.profile).catch(() => null),
  ]);

  // the homepage changes whenever a project on it changes
  const homeModified = [profile?.updatedAt, ...projects.map((p) => p.updatedAt)]
    .filter((d): d is Date => d instanceof Date)
    .reduce<Date | undefined>((latest, d) => (!latest || d > latest ? d : latest), undefined);

  return [
    ...localized("", { lastModified: homeModified, changeFrequency: "weekly", priority: 1 }),
    ...projects.flatMap((p) =>
      localized(`/projects/${p.slug}`, { lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.8 }),
    ),
  ];
}
