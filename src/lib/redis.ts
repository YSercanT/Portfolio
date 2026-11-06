import "server-only";
import Redis from "ioredis";
import { getEnv } from "@/lib/env";

// One shared Redis client, kept on globalThis like the db connection.
// ioredis sends everything over one connection, so one client is enough.
const globalForRedis = globalThis as unknown as { __hubRedis?: Redis };

export function getRedis(): Redis {
  if (globalForRedis.__hubRedis) return globalForRedis.__hubRedis;

  const client = new Redis(getEnv().REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableAutoPipelining: true,
    connectTimeout: 5_000,
  });
  client.on("error", (err) => {
    // don't crash on Redis hiccups, the callers handle it
    console.error("[redis]", err.message);
  });

  globalForRedis.__hubRedis = client;
  return client;
}
