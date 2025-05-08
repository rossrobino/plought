import * as table from "@/lib/db/table";
import {
	createInsertSchema,
	createUpdateSchema,
	createSelectSchema,
} from "drizzle-zod";
import * as z from "zod";

export const user = {
	Insert: createInsertSchema(table.user),
	Update: createUpdateSchema(table.user),
	Select: createSelectSchema(table.user),
};

export const session = {
	Insert: createInsertSchema(table.session),
	Update: createUpdateSchema(table.session),
	Select: createSelectSchema(table.session),
};

export const study = {
	Insert: createInsertSchema(table.study, {
		title: (s) => s.min(1).max(100),
		description: (s) => s.min(1).max(300),
	}),
	Update: createUpdateSchema(table.study, {
		title: (s) => s.min(1).max(100),
		description: (s) => s.min(1).max(300),
	}),
	Select: createSelectSchema(table.study),
};

export const instrument = {
	Insert: createInsertSchema(table.instrument),
	Update: createUpdateSchema(table.instrument),
	Select: createSelectSchema(table.instrument),
};

export const studyInstrument = {
	Insert: createInsertSchema(table.studyInstrument),
	Update: createUpdateSchema(table.studyInstrument),
	Select: createSelectSchema(table.studyInstrument),
};

export const response = {
	Insert: createInsertSchema(table.response),
	Update: createUpdateSchema(table.response),
	Select: createSelectSchema(table.response),
};

export const AuthCallback = z
	.object({
		code: z.string(),
		state: z.string(),
		storedState: z.string(),
		codeVerifier: z.string(),
	})
	.refine((data) => data.state === data.storedState, {
		message: "state does not match stored state",
		path: ["state", "storedState"],
	});

export const AuthClaims = z.object({
	sub: z.string(),
	family_name: z.string(),
	given_name: z.string(),
	email: z.string().email(),
	email_verified: z.boolean(),
	picture: z.string().url(),
});
