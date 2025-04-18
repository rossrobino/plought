import * as auth from "@/lib/auth";
import * as constants from "@/lib/constants";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import * as table from "@/lib/db/table";
import type { State } from "@/lib/types";
import { Layout } from "@/server/layout";
import svg from "@/ui/svg/google.svg?raw";
import { Google } from "arctic";
import * as arctic from "arctic";
import { serialize, parseSetCookie } from "cookie-es";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { Router } from "ovr";
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

authApp.get("/login", async (c) => {
	const { user } = await auth.get(c);

	if (user) {
		c.redirect("/");
		return;
	}

	c.page(
		<Layout user={user}>
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

authApp
	.get("/login/google", (c) => {
		const state = arctic.generateState();
		const codeVerifier = arctic.generateCodeVerifier();
		const scopes = ["openid", "profile", "email"];

		const url = google.createAuthorizationURL(state, codeVerifier, scopes);

		c.redirect(url);

		c.headers.append(
			"Set-Cookie",
			serialize("google_oauth_state", state, {
				path: "/",
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: "lax",
			}),
		);

		c.headers.append(
			"Set-Cookie",
			serialize("google_code_verifier", codeVerifier, {
				path: "/",
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: "lax",
			}),
		);
	})
	.get("/login/google/callback", async (c) => {
		const { google_oauth_state, google_code_verifier } = parseSetCookie(
			c.req.headers.get("cookie") || "",
		);

		const CallbackSchema = z
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

		const result = CallbackSchema.safeParse({
			code: c.url.searchParams.get("code"),
			state: c.url.searchParams.get("state"),
			storedState: google_oauth_state,
			codeVerifier: google_code_verifier,
		});

		if (!result.success) {
			c.text("Invalid request", 400);
			return;
		}

		const { code, codeVerifier } = result.data;

		const tokens = await google.validateAuthorizationCode(code, codeVerifier);

		const ClaimsSchema = z.object({
			sub: z.string(),
			family_name: z.string(),
			given_name: z.string(),
			email: z.string().email(),
			email_verified: z.boolean(),
			picture: z.string().url(),
		});

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

		c.redirect("/");
		auth.setSessionTokenCookie(c, sessionToken, session.expiresAt);
	});

authApp.get("/logout", async (c) => {
	const { user } = await auth.get(c);
	if (user) await auth.invalidateAllSessions(user.id);

	c.redirect("/");
	auth.deleteSessionTokenCookie(c);
});
