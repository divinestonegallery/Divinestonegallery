import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./packages/database/drizzle",
  schema: "./packages/database/src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/divine_stone_gallery",
  },
  strict: true,
  verbose: true,
});
