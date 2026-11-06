// Gets the visitor's IP for rate limiting.
//
// Careful: x-forwarded-for can only be trusted behind a proxy you control
// (Vercel, Nginx, Cloudflare) that overwrites it. Without one, anyone can fake it.
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
