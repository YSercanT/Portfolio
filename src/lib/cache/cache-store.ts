// What the services need from a cache. They use this instead of Redis directly,
// so it can be swapped for an in-memory version in tests.
export interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(...keys: string[]): Promise<void>;
}

// All cache keys are built here so there are no typos.
// Bump the version when the shape of cached data changes, old entries just expire.
// (v2 added media/markdown, v3 the project links, v4 the Turkish columns.)
export const cacheKeys = {
  projectBySlug: (slug: string) => `hub:v4:project:slug:${slug}`,
  publishedProjectsFirstPage: (limit: number) => `hub:v4:projects:published:first:${limit}`,
  resume: "hub:v4:resume",
} as const;

// Try the cache first, otherwise load the data and store it.
// If Redis is down we just load from the db instead of failing.
export async function getOrSet<T>(
  cache: CacheStore,
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  try {
    const hit = await cache.get<T>(key);
    if (hit !== null) return hit;
  } catch (err) {
    console.warn("[cache] read failed, falling back to source", key, err);
  }

  const value = await loader();

  // don't cache misses, or a newly created item would stay a 404 until expiry
  if (value !== null && value !== undefined) {
    cache.set(key, value, ttlSeconds).catch((err) => {
      console.warn("[cache] write failed", key, err);
    });
  }
  return value;
}
