import * as auth from "@/lib/auth";
import * as constants from "@/lib/constants";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import * as table from "@/lib/db/table";
import type { State } from "@/lib/types";
import { Layout } from "@/server/layout";
import svg from "@/ui/svg/google.svg?raw";
import { Router } from "@robino/router";
import { Google } from "arctic";
import * as arctic from "arctic";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const authApp = new Router<State>();

if (!process.env.GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID not set");
if (!process.env.GOOGLE_CLIENT_SECRET)
	throw new Error("GOOGLE_CLIENT_SECRET not set");

const google = new Google(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${constants.origin}/login/google/callback`,
);

const ClaimsSchema = z.object({
	sub: z.string(),
	family_name: z.string(),
	given_name: z.string(),
	email: z.string().email(),
	email_verified: z.boolean(),
	picture: z.string().url(),
});

authApp.get("/login", auth.setAuth(), (c) => {
	if (c.state.auth.user) {
		c.res.redirect("/");
		return;
	}

	c.res.html((p) => {
		p.body(
			<Layout user={null}>
				<article class="prose">
					<h1>Login</h1>
					<div class="border rounded-xl flex items-center justify-center p-6">
						<a class="contents" href="/login/google">
							{svg}
						</a>
					</div>
				</article>
			</Layout>,
		);
	});
});

authApp
	.get("/login/google", (c) => {
		const state = arctic.generateState();
		const codeVerifier = arctic.generateCodeVerifier();
		const scopes = ["openid", "profile", "email"];

		const url = google.createAuthorizationURL(state, codeVerifier, scopes);

		c.res.redirect(url);
		c.res.headers.setCookie = [
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
		];
	})
	.get("/login/google/callback", async (c) => {
		const code = c.req.url.searchParams.get("code");
		const state = c.req.url.searchParams.get("state");
		const storedState = c.req.headers.cookie.get("google_oauth_state");
		const codeVerifier = c.req.headers.cookie.get("google_code_verifier");

		if (
			code === null ||
			state === null ||
			storedState === null ||
			codeVerifier === null ||
			state !== storedState
		) {
			c.res.set("Invalid request", { status: 400 });
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

		c.res.redirect("/");
		auth.setSessionTokenCookie(c, sessionToken, session.expiresAt);
	});

authApp.get("/logout", auth.setAuth(), async (c) => {
	if (c.state.auth.user) {
		await auth.invalidateAllSessions(c.state.auth.user.id);
	}

	c.res.redirect("/");
	auth.deleteSessionTokenCookie(c);
});
