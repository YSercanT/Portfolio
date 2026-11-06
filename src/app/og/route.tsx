import type { NextRequest } from "next/server";
import { defaultLocale, getDictionary, parseLocale } from "@/i18n";
import { localizeResume } from "@/i18n/localize";
import { getContainer } from "@/lib/container";
import { renderOgCard } from "@/lib/og-card";
import { SITE_NAME } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// default share image, ?lang=tr for Turkish
export async function GET(req: NextRequest) {
  const locale = parseLocale(req.nextUrl.searchParams.get("lang") ?? "") ?? defaultLocale;
  const dict = getDictionary(locale);
  const profile = await getContainer()
    .resumeService.getResume()
    .then((r) => localizeResume(r, locale).profile)
    .catch(() => null); // still render something if the db is down

  return renderOgCard({
    eyebrow: dict.og.portfolio,
    title: profile?.name ?? SITE_NAME,
    subtitle: profile?.title ?? dict.meta.siteDescription,
    chips: dict.og.chips,
    footer: dict.og.footer,
  });
}
