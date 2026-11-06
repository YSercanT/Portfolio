import type { Locale } from "@/i18n/config";
import type { Project } from "@/repositories/interfaces/project-repository";
import type { Resume } from "@/services/resume-service";

// Picks the right language after reading from the cache. The cached rows have
// both languages in them, so we don't need separate cache keys per language.
// Empty Turkish fields fall back to English.

const pick = (locale: Locale, en: string, tr: string): string => (locale === "tr" && tr.trim() ? tr : en);

export function localizeProject(p: Project, locale: Locale): Project {
  if (locale === "en") return p;
  return { ...p, summary: pick(locale, p.summary, p.summaryTr), contentMd: pick(locale, p.contentMd, p.contentMdTr) };
}

export function localizeResume(r: Resume, locale: Locale): Resume {
  if (locale === "en") return r;
  return {
    profile: r.profile && {
      ...r.profile,
      title: pick(locale, r.profile.title, r.profile.titleTr),
      bio: pick(locale, r.profile.bio, r.profile.bioTr),
    },
    experience: r.experience.map((x) => ({
      ...x,
      role: pick(locale, x.role, x.roleTr),
      description: pick(locale, x.description, x.descriptionTr),
    })),
    education: r.education.map((e) => ({
      ...e,
      degree: pick(locale, e.degree, e.degreeTr),
      institution: pick(locale, e.institution, e.institutionTr),
      description: pick(locale, e.description, e.descriptionTr),
    })),
    publications: r.publications.map((p) => ({
      ...p,
      title: pick(locale, p.title, p.titleTr),
      abstract: pick(locale, p.abstract, p.abstractTr),
    })),
  };
}
