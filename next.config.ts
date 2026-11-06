import type { NextConfig } from "next";

// Basic security headers for every response.
// TODO: add a proper CSP once we know which outside scripts we need.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // don't bundle native Node modules
  serverExternalPackages: ["ioredis", "postgres", "bcryptjs"],
  experimental: {
    // Default is 1 MB, too small for uploads. Keep it a bit above the biggest
    // allowed file (50 MB videos, see lib/uploads.ts).
    serverActions: { bodySizeLimit: "52mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
