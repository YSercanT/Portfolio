import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// robots.txt: crawl everything except admin, login and the API.
// This only stops crawling. The admin pages also send noindex and need a login anyway.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login", "/api"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
