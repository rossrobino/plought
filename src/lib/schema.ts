import * as t from "@/lib/db/table";
import {
	createInsertSchema,
	createUpdateSchema,
	createSelectSchema,
} from "drizzle-zod";
import * as z from "zod";

export const user = {
	Insert: createInsertSchema(t.user),
	Update: createUpdateSchema(t.user),
	Select: createSelectSchema(t.user),
};

export const session = {
	Insert: createInsertSchema(t.session),
	Update: createUpdateSchema(t.session),
	Select: createSelectSchema(t.session),
};

export const study = {
	Insert: createInsertSchema(t.study, {
		title: (s) => s.min(1).max(100),
		description: (s) => s.min(1).max(300),
	}),
	Update: createUpdateSchema(t.study, {
		title: (s) => s.min(1).max(100),
		description: (s) => s.min(1).max(300),
	}),
	Select: createSelectSchema(t.study),
};

export const instrument = {
	Insert: createInsertSchema(t.instrument),
	Update: createUpdateSchema(t.instrument),
	Select: createSelectSchema(t.instrument),
};

export const studyInstrument = {
	Insert: createInsertSchema(t.studyInstrument),
	Update: createUpdateSchema(t.studyInstrument),
	Select: createSelectSchema(t.studyInstrument),
};

export const response = {
	Insert: createInsertSchema(t.response),
	Update: createUpdateSchema(t.response),
	Select: createSelectSchema(t.response),
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
