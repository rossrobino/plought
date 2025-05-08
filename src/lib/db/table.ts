import { sql } from "drizzle-orm";
import * as table from "drizzle-orm/pg-core";

const timestamps = {
	createdAt: table
		.timestamp({ withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: table
		.timestamp({ withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull()
		.$onUpdate(() => sql`now()`),
};

export const user = table.pgTable("user", {
	id: table.serial().primaryKey(),
	googleId: table.text().notNull().unique(),
	username: table.text().notNull().unique(),
	email: table.text().notNull().unique(),
	firstName: table.text().notNull(),
	lastName: table.text().notNull(),
	...timestamps,
});

export type User = typeof user.$inferSelect;

export const session = table.pgTable("session", {
	id: table.text().primaryKey(),
	userId: table
		.integer()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	expiresAt: table.timestamp({ withTimezone: true, mode: "date" }).notNull(),
});

export type Session = typeof session.$inferSelect;

export const studyStatus = table.pgEnum("study_status", [
	"draft",
	"active",
	"complete",
]);

export const study = table.pgTable("study", {
	id: table.serial().primaryKey(),
	title: table.text().notNull(),
	description: table.text(),
	userId: table
		.integer()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	status: studyStatus().default("draft").notNull(),
	public: table.boolean().default(false).notNull(),
	...timestamps,
});

export type Study = typeof study.$inferSelect;

export const instrument = table.pgTable("instrument", {
	id: table.serial().primaryKey(),
	name: table.text().notNull().unique(),
	description: table.text().notNull().default(""),
});

/** Junction table connecting studies to instruments */
export const studyInstrument = table.pgTable("study_instrument", {
	id: table.serial().primaryKey(),
	studyId: table
		.integer()
		.notNull()
		.references(() => study.id, { onDelete: "cascade" }),
	instrumentId: table
		.integer()
		.notNull()
		.references(() => instrument.id, { onDelete: "cascade" }),
	/** Specific configuration for this instrument in this study */
	config: table.json(),
});

export const response = table.pgTable("response", {
	id: table.serial().primaryKey(),
	studyId: table
		.integer()
		.notNull()
		.references(() => study.id, { onDelete: "cascade" }),
	userId: table
		.integer()
		.notNull()
		.references(() => user.id),
	instrumentId: table
		.integer()
		.notNull()
		.references(() => instrument.id),
	data: table.json().notNull(),
	...timestamps,
});
