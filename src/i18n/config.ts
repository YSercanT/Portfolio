// Language settings. The middleware imports this, so no Node-only APIs in here.
export const locales = ["en", "tr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// remembers the language, the middleware sets it on every /en or /tr visit
export const LOCALE_COOKIE = "NEXT_LOCALE";

// locale codes for Open Graph
export const ogLocale: Record<Locale, string> = { en: "en_US", tr: "tr_TR" };
// for formatting dates with Intl
export const intlLocale: Record<Locale, string> = { en: "en-US", tr: "tr-TR" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

// Picks a language from the Accept-Language header, e.g. "tr-TR,tr;q=0.9,en;q=0.8" gives "tr".
// Sorts by the q values, only looks at the first part (tr-TR counts as tr) and
// falls back to English. Small enough that a library isn't worth it.
export function matchAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return defaultLocale;
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const q = qParam ? Number(qParam.slice(2)) : 1;
      return { lang: tag.trim().toLowerCase().split("-")[0], q, index };
    })
    .filter((x) => x.lang && Number.isFinite(x.q) && x.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return ranked.find((r) => isLocale(r.lang))?.lang as Locale | undefined ?? defaultLocale;
}

// "/en/projects/x" becomes "/tr/projects/x". Adds the language if the path has none.
export function switchLocalePath(pathname: string, to: Locale): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) segments[1] = to;
  else segments.splice(1, 0, to);
  return segments.join("/").replace(/\/$/, "") || `/${to}`;
}
