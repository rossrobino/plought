import * as schema from "@/lib/db/table";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set.");

export const db = drizzle(neon(process.env.DATABASE_URL), {
	schema,
	casing: "snake_case",
});
