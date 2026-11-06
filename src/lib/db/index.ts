import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

// One shared db connection.
// It lives on globalThis because in dev Next reloads modules on every save, and
// we'd open a new connection pool each time otherwise.
const globalForDb = globalThis as unknown as {
  __hubSql?: postgres.Sql;
  __hubDb?: Database;
};

export function getDb(): Database {
  if (globalForDb.__hubDb) return globalForDb.__hubDb;

  const sql =
    globalForDb.__hubSql ??
    postgres(getEnv().DATABASE_URL, {
      max: 10, // connections per process
      idle_timeout: 30,
      connect_timeout: 10,
      prepare: true, // prepared statements, values are sent separately from the SQL
    });

  globalForDb.__hubSql = sql;
  globalForDb.__hubDb = drizzle(sql, { schema });
  return globalForDb.__hubDb;
}

export { schema };
