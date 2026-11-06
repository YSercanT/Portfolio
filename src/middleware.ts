import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import { isLocale, LOCALE_COOKIE, matchAcceptLanguage, type Locale } from "@/i18n/config";

// Next only allows one middleware file, so this one does two things:
//
// 1. /admin and /api/admin: login check (the rules are in authConfig.callbacks.authorized).
// 2. Public pages: language routing. /en/... and /tr/... go through and the choice is
//    saved in a cookie. Anything else gets redirected to /en or /tr, picked from the
//    cookie, then the browser language, then English.
//
// It skips /api (except /api/admin), /og, /uploads, /login, /_next and real files
// like sitemap.xml or robots.txt. See `config` at the bottom.

const { auth } = NextAuth(authConfig);
// `auth` can also be called as a middleware
const adminGate = auth as unknown as (req: NextRequest, event: NextFetchEvent) => Promise<Response | undefined>;

const ONE_YEAR = 60 * 60 * 24 * 365;

function preferredLocale(req: NextRequest): Locale {
  const fromCookie = req.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(fromCookie) ? fromCookie : matchAcceptLanguage(req.headers.get("accept-language"));
}

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin")) {
    return adminGate(req, event);
  }

  const segment = pathname.split("/")[1];
  if (isLocale(segment)) {
    const res = NextResponse.next();
    // remember the language they picked (e.g. from the switcher)
    if (req.cookies.get(LOCALE_COOKIE)?.value !== segment) {
      res.cookies.set(LOCALE_COOKIE, segment, {
        path: "/",
        maxAge: ONE_YEAR,
        sameSite: "lax",
        secure: req.nextUrl.protocol === "https:",
      });
    }
    return res;
  }

  // no language in the URL ("/" or an old /projects/x link), so redirect
  const url = req.nextUrl.clone();
  url.pathname = `/${preferredLocale(req)}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url, 307); // 307 because it depends on the visitor
  res.headers.set("Vary", "Accept-Language, Cookie"); // so a CDN doesn't cache one person's redirect for everyone
  return res;
}

export const config = {
  matcher: [
    // everything except api/, _next/, og, uploads/, login and files with an extension
    "/((?!api/|_next/|og(?:/|$)|uploads/|login(?:/|$)|.*\\..*).*)",
    "/api/admin/:path*",
  ],
};
