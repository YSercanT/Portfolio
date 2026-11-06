import "server-only";
import type Redis from "ioredis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  // when the window resets (ms timestamp)
  resetAt: number;
}

export interface RateLimiter {
  limit(identifier: string): Promise<RateLimitResult>;
}

// Sliding window rate limiter, done in a Lua script so Redis runs it in one go.
//
// It keeps a counter for the current and the previous window and estimates:
//   previous * (1 - elapsed/window) + current
// Only two small keys per client, no need to store every request.
// Running it as one script means two requests at the same time can't both slip through.
const SLIDING_WINDOW_LUA = `
local currentKey  = KEYS[1]
local previousKey = KEYS[2]
local limit       = tonumber(ARGV[1])
local windowMs    = tonumber(ARGV[2])
local elapsedMs   = tonumber(ARGV[3])

local previous = tonumber(redis.call('GET', previousKey) or '0')
local current  = tonumber(redis.call('GET', currentKey) or '0')
local weighted = previous * ((windowMs - elapsedMs) / windowMs) + current

if weighted >= limit then
  return {0, 0}
end

current = redis.call('INCR', currentKey)
if current == 1 then
  redis.call('PEXPIRE', currentKey, windowMs * 2)
end

local remaining = limit - (weighted + 1)
if remaining < 0 then remaining = 0 end
return {1, math.floor(remaining)}
`;

export class RedisSlidingWindowRateLimiter implements RateLimiter {
  constructor(
    private readonly redis: Redis,
    private readonly options: { prefix: string; limit: number; windowSeconds: number },
  ) {}

  async limit(identifier: string): Promise<RateLimitResult> {
    const { prefix, limit, windowSeconds } = this.options;
    const windowMs = windowSeconds * 1000;
    const now = Date.now();
    const windowIndex = Math.floor(now / windowMs);
    const elapsedMs = now - windowIndex * windowMs;

    const base = `hub:rl:${prefix}:${identifier}`;
    const [allowed, remaining] = (await this.redis.eval(
      SLIDING_WINDOW_LUA,
      2,
      `${base}:${windowIndex}`,
      `${base}:${windowIndex - 1}`,
      limit,
      windowMs,
      elapsedMs,
    )) as [number, number];

    return {
      success: allowed === 1,
      limit,
      remaining,
      resetAt: (windowIndex + 1) * windowMs,
    };
  }
}

// the usual RateLimit-* headers
export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  const resetSec = Math.max(0, Math.ceil((r.resetAt - Date.now()) / 1000));
  return {
    "RateLimit-Limit": String(r.limit),
    "RateLimit-Remaining": String(r.remaining),
    "RateLimit-Reset": String(resetSec),
    ...(r.success ? {} : { "Retry-After": String(resetSec) }),
  };
}
