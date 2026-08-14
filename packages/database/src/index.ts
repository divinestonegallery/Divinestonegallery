import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type QueryResult } from "pg";
import * as schema from "./schema";

type BatchQuery = {
  toSQL(): { sql: string; params: unknown[] };
};

type GlobalDatabaseCache = {
  divineStoneDatabase?: ReturnType<typeof createDatabase>;
};

const globalDatabaseCache = globalThis as typeof globalThis & GlobalDatabaseCache;

function createDatabase() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error(
      "PostgreSQL is unavailable. Add DATABASE_URL to the server environment before enabling database-backed features.",
    );
  }

  const databaseUrl = new URL(connectionString);
  if (databaseUrl.searchParams.get("sslmode") === "require") {
    databaseUrl.searchParams.set("sslmode", "verify-full");
  }

  const pool = new Pool({
    connectionString: databaseUrl.toString(),
    max: Number(process.env.DATABASE_POOL_MAX) || 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: process.env.DATABASE_SSL === "disable"
      ? false
      : process.env.DATABASE_SSL === "require"
        ? true
        : undefined,
  });
  const orm = drizzle(pool, { schema });

  const batch = async (queries: readonly BatchQuery[]) => {
    if (!queries.length) return [];
    const client = await pool.connect();
    const results: QueryResult[] = [];
    try {
      await client.query("BEGIN");
      for (const query of queries) {
        const statement = query.toSQL();
        results.push(await client.query(statement.sql, statement.params));
      }
      await client.query("COMMIT");
      return results;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  return Object.assign(orm, { batch, $pool: pool });
}

export function getDb() {
  globalDatabaseCache.divineStoneDatabase ??= createDatabase();
  return globalDatabaseCache.divineStoneDatabase;
}
