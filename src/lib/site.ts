import type { Metadata, Viewport } from "next";
import { defaultLocale, ogLocale, type Locale } from "@/i18n/config";
import { parseYouTubeId } from "@/lib/media";

// SEO settings shared across the site.
// NEXT_PUBLIC_APP_URL is the public address of the site (e.g. https://example.dev).
// It's used as metadataBase so relative URLs in metadata turn into full ones.
// Heads up: Next bakes NEXT_PUBLIC_* in at build time, so set it before `next build`.
const FALLBACK_URL = "http://localhost:3000";

function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (raw) {
    try {
      const url = new URL(raw);
      if (url.protocol === "https:" || url.protocol === "http:") return new URL(url.origin);
    } catch {
      // ignore, fall back below
    }
    console.warn(`[site] Invalid NEXT_PUBLIC_APP_URL "${raw}", falling back to ${FALLBACK_URL}`);
  }
  return new URL(FALLBACK_URL);
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "The Hub";
export const SITE_DESCRIPTION =
  "AI & full-stack engineering portfolio: curated projects, research publications and an interactive AI playground.";

// 1200x630 is what LinkedIn, X, WhatsApp and Facebook show as a big preview.
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

// default share image, in the visitor's language
export const defaultOgImage = (locale: Locale = defaultLocale, alt: string = SITE_NAME) => ({
  url: locale === defaultLocale ? "/og" : `/og?lang=${locale}`,
  ...OG_IMAGE_SIZE,
  alt,
});

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

// cut text to `max` chars without breaking a word (Google cuts around 155-160 anyway)
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6))}…`;
}

// A page's openGraph replaces the layout's instead of merging, so pages spread this in.
export const baseOpenGraph = (locale: Locale) => ({
  siteName: SITE_NAME,
  locale: ogLocale[locale],
  alternateLocale: Object.entries(ogLocale)
    .filter(([l]) => l !== locale)
    .map(([, code]) => code),
});

// hreflang links for a path without the language part ("" is the homepage).
// x-default is the plain URL, the middleware sends people to the right language from there.
export function languageAlternates(path: string): Record<string, string> {
  return { en: `/en${path}`, tr: `/tr${path}`, "x-default": path || "/" };
}

// Defaults for all three root layouts ([lang], admin, login).
// Without metadataBase the share images wouldn't load on LinkedIn/X/WhatsApp.
// I left out a global robots tag on purpose: it clashed with the noindex Next adds to 404 pages.
export const baseMetadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: SITE_NAME,
  title: { default: `${SITE_NAME} — AI Portfolio & Playground`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    ...baseOpenGraph(defaultLocale),
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [defaultOgImage()],
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images: [defaultOgImage().url] },
  formatDetection: { telephone: false, email: false, address: false },
};

export const baseViewport: Viewport = { themeColor: "#0b0b10", colorScheme: "dark" };

interface OgImage {
  url: string;
  width?: number;
  height?: number;
  alt: string;
}

// Share image for a project. Uses the demo image if it's a JPG/PNG (LinkedIn is
// flaky with WebP/GIF), then the YouTube thumbnail, and otherwise the generated /og/[slug] card.
export function projectOgImage(
  p: { slug: string; title: string; demoMediaType: string | null; demoMediaUrl: string | null },
  locale: Locale = defaultLocale,
): OgImage {
  const url = p.demoMediaUrl;
  if (p.demoMediaType === "image" && url && !/\.(webp|gif)$/i.test(new URL(url, SITE_URL).pathname)) {
    return { url, alt: `${p.title} screenshot` };
  }
  if (p.demoMediaType === "youtube_embed" && url) {
    const id = parseYouTubeId(url);
    if (id) return { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, width: 480, height: 360, alt: `${p.title} video` };
  }
  return { url: `/og/${p.slug}${locale === defaultLocale ? "" : `?lang=${locale}`}`, ...OG_IMAGE_SIZE, alt: p.title };
}
