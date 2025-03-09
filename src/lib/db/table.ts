import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";

const timestamps = {
	createdAt: t
		.timestamp({ withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull(),
	updatedAt: t
		.timestamp({ withTimezone: true, mode: "string" })
		.defaultNow()
		.notNull()
		.$onUpdate(() => sql`now()`),
};

export const studyStatus = t.pgEnum("study_status", [
	"draft",
	"active",
	"complete",
]);

export const user = t.pgTable("user", {
	id: t.serial().primaryKey(),
	googleId: t.text().notNull().unique(),
	username: t.text().notNull().unique(),
	email: t.text().notNull().unique(),
	firstName: t.text().notNull(),
	lastName: t.text().notNull(),
	...timestamps,
});

export type User = typeof user.$inferSelect;

export const session = t.pgTable("session", {
	id: t.text().primaryKey(),
	userId: t
		.integer()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	expiresAt: t
		.timestamp({
			withTimezone: true,
			mode: "date",
		})
		.notNull(),
});

export type Session = typeof session.$inferSelect;

export const study = t.pgTable("study", {
	id: t.serial().primaryKey(),
	title: t.text().notNull(),
	description: t.text(),
	userId: t
		.integer()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	status: studyStatus().default("draft").notNull(),
	public: t.boolean().default(false),
	...timestamps,
});

export const instrument = t.pgTable("instrument", {
	id: t.serial().primaryKey(),
	name: t.text().notNull().unique(),
	description: t.text().notNull().default(""),
});

/** Junction table connecting studies to their research instruments */
export const studyInstrument = t.pgTable("study_instrument", {
	id: t.serial().primaryKey(),
	studyId: t
		.integer()
		.notNull()
		.references(() => study.id, { onDelete: "cascade" }),
	instrumentId: t
		.integer()
		.notNull()
		.references(() => instrument.id, { onDelete: "cascade" }),
	/** Specific configuration for this instrument in this study */
	config: t.json(),
});

/** Responses to instruments without requiring a participation record */
export const response = t.pgTable("response", {
	id: t.serial().primaryKey(),
	studyId: t
		.integer()
		.notNull()
		.references(() => study.id, { onDelete: "cascade" }),
	userId: t
		.integer()
		.notNull()
		.references(() => user.id),
	instrumentId: t
		.integer()
		.notNull()
		.references(() => instrument.id),
	data: t.json().notNull(),
	...timestamps,
});
