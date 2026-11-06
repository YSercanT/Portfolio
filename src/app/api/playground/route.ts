import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getContainer } from "@/lib/container";
import { getClientIp } from "@/lib/security/client-ip";
import { rateLimitHeaders } from "@/lib/security/rate-limiter";

export const runtime = "nodejs"; // ioredis needs Node sockets
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  model: z.string().min(1).max(100),
  prompt: z.string().min(1).max(8_000),
});

// AI playground endpoint, not finished yet.
// Rate limit first since it's the cheapest check, then validate, then call the model.
export async function POST(req: NextRequest) {
  const { playgroundRateLimiter } = getContainer();

  let rl;
  try {
    rl = await playgroundRateLimiter.limit(getClientIp(req.headers));
  } catch (err) {
    // if the limiter is down, refuse instead of paying for unlimited model calls
    console.error("[playground] rate limiter unavailable", err);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  const headers = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers });
  }

  const body = requestSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: body.error.issues.map((i) => i.message) },
      { status: 400, headers },
    );
  }

  // TODO: add a PlaygroundService for the model call and logging
  return NextResponse.json(
    { error: "Playground not implemented yet", echo: { model: body.data.model } },
    { status: 501, headers },
  );
}
