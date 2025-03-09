import type { State } from "../types";
import * as auth from "@/lib/auth";
import * as constants from "@/lib/constants";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import * as table from "@/lib/db/table";
import { SuperHeaders } from "@mjackson/headers";
import type { Middleware } from "@robino/router";
import { Google } from "arctic";
import * as arctic from "arctic";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { z } from "zod";

if (!process.env.GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID not set");
if (!process.env.GOOGLE_CLIENT_SECRET)
	throw new Error("GOOGLE_CLIENT_SECRET not set");

export const google = new Google(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${constants.origin}/login/google/callback`,
);

export const login: Middleware<Record<string, string>, State> = (c) => {
	const state = arctic.generateState();
	const codeVerifier = arctic.generateCodeVerifier();
	const scopes = ["openid", "profile", "email"];

	const url = google.createAuthorizationURL(state, codeVerifier, scopes);

	c.res = new Response(null, {
		status: 302,
		// @ts-expect-error https://github.com/mjackson/remix-the-web/issues/31
		headers: new SuperHeaders({
			location: url.toString(),
			setCookie: [
				{
					name: "google_oauth_state",
					value: state,
					path: "/",
					httpOnly: true,
					maxAge: 60 * 10,
					sameSite: "Lax",
				},
				{
					name: "google_code_verifier",
					value: codeVerifier,
					path: "/",
					httpOnly: true,
					maxAge: 60 * 10,
					sameSite: "Lax",
				},
			],
		}),
	});
};

const ClaimsSchema = z.object({
	sub: z.string(),
	family_name: z.string(),
	given_name: z.string(),
	email: z.string().email(),
	email_verified: z.boolean(),
	picture: z.string().url(),
});

export const loginCallback: Middleware<Record<string, string>, State> = async (
	c,
) => {
	const code = c.url.searchParams.get("code");
	const state = c.url.searchParams.get("state");

	const headers = new SuperHeaders(c.req.headers);

	const storedState = headers.cookie.get("google_oauth_state");
	const codeVerifier = headers.cookie.get("google_code_verifier");

	if (
		code === null ||
		state === null ||
		storedState === null ||
		codeVerifier === null ||
		state !== storedState
	) {
		c.res = new Response("Invalid request", { status: 400 });
		return;
	}

	const tokens = await google.validateAuthorizationCode(code, codeVerifier);

	const { sub, email, email_verified, family_name, given_name } =
		ClaimsSchema.parse(arctic.decodeIdToken(tokens.idToken()));

	let [user] = await db
		.select()
		.from(table.user)
		.where(eq(table.user.googleId, sub));

	if (!user) {
		if (!email_verified)
			throw new Error("Please verify your Google email address.");

		const newUser = schema.user.Insert.parse({
			googleId: sub,
			email: email,
			firstName: given_name,
			lastName: family_name,
			username: `${given_name.toLowerCase()}-${crypto.randomUUID().split("-").at(0)}`,
		});

		[user] = await db.insert(table.user).values(newUser).returning();

		if (!user) throw new Error("Unable to find or create user.");
	}

	const sessionToken = auth.generateSessionToken();
	const session = await auth.createSession(sessionToken, user.id);

	c.res = new Response(null, { status: 302, headers: { Location: "/" } });
	auth.setSessionTokenCookie(c.res, sessionToken, session.expiresAt);
};
