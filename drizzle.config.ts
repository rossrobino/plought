import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");

export default defineConfig({
	schema: "./src/lib/db/table.ts",
	out: "./migrations",
	dialect: "postgresql",
	verbose: true,
	strict: true,
	casing: "snake_case",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
