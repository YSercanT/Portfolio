import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RootDocument } from "@/components/layout/root-document";
import { SiteHeader } from "@/components/layout/site-header";
import { MotionProvider } from "@/components/motion/motion-provider";
import { getDictionary, parseLocale } from "@/i18n";
import { localizeResume } from "@/i18n/localize";
import { getContainer } from "@/lib/container";
import { baseMetadata, baseOpenGraph, baseViewport, defaultOgImage, truncate } from "@/lib/site";

// without JS the fade-in sections would stay invisible, this shows them
const NO_JS_REVEAL_FALLBACK = "<style>[data-reveal]{opacity:1!important;transform:none!important}</style>";

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export const viewport = baseViewport;
// No generateStaticParams on purpose. With it Next tried to prerender the pages
// at build time, which needs the db and would show stale data.

// Default title and description for the public pages, built from the profile.
// Homepage: "<name> - <title>". Other pages: "<page> · <name>".
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  if (!locale) return {};
  const dict = getDictionary(locale);

  const profile = await getContainer()
    .resumeService.getResume()
    .then((r) => localizeResume(r, locale).profile)
    .catch(() => null);
  if (!profile) return { ...baseMetadata, description: dict.meta.siteDescription };

  const title = `${profile.name} — ${profile.title}`;
  const description = truncate(profile.bio || dict.meta.siteDescription);
  return {
    ...baseMetadata,
    // absolute so the homepage doesn't get " · The Hub" tacked on
    title: { absolute: title, template: `%s · ${profile.name}` },
    description,
    authors: [{ name: profile.name, url: profile.githubUrl ?? profile.linkedinUrl ?? undefined }],
    creator: profile.name,
    openGraph: {
      type: "website",
      ...baseOpenGraph(locale),
      url: `/${locale}`,
      title,
      description,
      images: [defaultOgImage(locale, title)],
    },
    twitter: { card: "summary_large_image", title, description, images: [defaultOgImage(locale).url] },
  };
}

// root layout for the public site, sets <html lang>
export default async function LocaleLayout({ children, params }: Props) {
  const locale = parseLocale((await params).lang);
  if (!locale) notFound(); // e.g. /de gives a 404
  const dict = getDictionary(locale);

  return (
    <RootDocument lang={locale}>
      <MotionProvider>
        <noscript dangerouslySetInnerHTML={{ __html: NO_JS_REVEAL_FALLBACK }} />
        <SiteHeader locale={locale} labels={dict.nav} />
        {children}
      </MotionProvider>
    </RootDocument>
  );
}
