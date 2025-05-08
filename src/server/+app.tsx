import * as auth from "@/lib/auth";
import { db } from "@/lib/db";
import * as query from "@/lib/db/query";
import * as table from "@/lib/db/table";
import * as schema from "@/lib/schema";
import type { State } from "@/lib/types";
import { Home } from "@/pages/home";
import { Login } from "@/pages/login";
import * as studyPages from "@/pages/study";
import * as arctic from "arctic";
import { html } from "client:page";
import { serialize, parse } from "cookie-es";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { Router } from "ovr";

const app = new Router<State>({
	start(c) {
		c.base = html;
	},
});

app.use(auth.csrf);

app.get("/", async (c) => {
	const { user } = await auth.get(c);

	c.page(<Home user={user} />);
});

app
	.get("/login", async (c) => {
		const { user } = await auth.get(c);
		if (user) return c.redirect("/"); // already logged in

		c.page(<Login user={user} />);
	})
	.get("/login/google", (c) => {
		const state = arctic.generateState();
		const codeVerifier = arctic.generateCodeVerifier();
		const scopes = ["openid", "profile", "email"];

		const url = auth.google.createAuthorizationURL(state, codeVerifier, scopes);

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
		const { google_oauth_state, google_code_verifier } = parse(
			c.req.headers.get("cookie") || "",
		);

		const result = schema.AuthCallback.safeParse({
			code: c.url.searchParams.get("code"),
			state: c.url.searchParams.get("state"),
			storedState: google_oauth_state,
			codeVerifier: google_code_verifier,
		});

		if (!result.success) return c.text("Invalid request", 400);

		const { code, codeVerifier } = result.data;

		const tokens = await auth.google.validateAuthorizationCode(
			code,
			codeVerifier,
		);

		const { sub, email, email_verified, family_name, given_name } =
			schema.AuthClaims.parse(arctic.decodeIdToken(tokens.idToken()));

		let [user] = await db
			.select()
			.from(table.user)
			.where(eq(table.user.googleId, sub));

		if (!user) {
			if (!email_verified)
				throw new Error("Please verify your Google email address.");

			const newUser = schema.user.Insert.parse({
				googleId: sub,
				email,
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
	})
	.get("/logout", async (c) => {
		const { user } = await auth.get(c);
		if (user) await auth.invalidateAllSessions(user.id);

		c.redirect("/");
		auth.deleteSessionTokenCookie(c);
	});

app
	.get("/study", (c) => {
		c.page(async () => {
			const { user } = await auth.get(c);

			return <studyPages.Home user={user} />;
		});
	})
	.get("/study/create", async (c) => {
		const { user } = await auth.get(c);
		if (!user) return c.redirect("/");

		c.page(<studyPages.Create user={user} />);
	})
	.post("/study/create", async (c) => {
		const { user } = await auth.get(c);
		if (!user) return c.redirect("/");

		const formData = await c.req.formData();

		const insert = schema.study.Insert.safeParse({
			userId: user?.id,
			title: formData.get("title"),
			description: formData.get("description"),
			public: Boolean(formData.get("public")),
		});

		if (!insert.success) {
			return c.page(
				<studyPages.Create user={user} issues={insert.error.issues} />,
			);
		}

		const [study] = await db
			.insert(table.study)
			.values(insert.data)
			.returning({ id: table.study.id });

		if (study) c.redirect(`/study/${study.id}`);
	})
	.get("/study/:id", async (c) => {
		const [{ user }, study] = await Promise.all([
			auth.get(c),
			query.studyById(c.params.id),
		]);

		if (!study) return;

		c.page(<studyPages.Study user={user} study={study} />);
	})
	.post("/study/:id/draft", async (c) => {
		const [{ user }, study] = await Promise.all([
			auth.get(c),
			query.studyById(c.params.id),
		]);

		if (!user) return c.redirect("/");
		if (!study || study.userId !== user?.id) return;

		const data = await c.req.formData();
		const instruments = data.getAll("instrument");

		await db
			.insert(table.studyInstrument)
			.values(
				instruments.map((instrument) => ({
					studyId: study.id,
					instrumentId: Number(instrument),
				})),
			);

		// TODO

		console.log(instruments);
	})
	.on(
		["GET", "POST"],
		["/study/:id/update", "/study/:id/delete"],
		async (c) => {
			const [{ user }, study] = await Promise.all([
				auth.get(c),
				query.studyById(c.params.id),
			]);

			if (!user) return c.redirect("/");
			if (!study || study.userId !== user?.id) return;

			if (c.url.pathname.includes("delete") && c.req.method === "POST") {
				// TODO use a hidden form instead of pathname
				await db.delete(table.study).where(eq(table.study.id, study.id));
				return c.redirect("/study");
			}

			if (c.req.method === "GET") {
				return c.page(<studyPages.Update user={user} study={study} />);
			}

			if (c.req.method === "POST") {
				const formData = await c.req.formData();

				const update = schema.study.Update.safeParse({
					userId: user?.id,
					title: formData.get("title"),
					description: formData.get("description"),
					public: Boolean(formData.get("public")),
				});

				if (!update.success) {
					return c.page(
						<studyPages.Update
							user={user}
							study={study}
							issues={update.error.issues}
						/>,
					);
				}

				await db
					.update(table.study)
					.set(update.data)
					.where(eq(table.study.id, study.id));

				return c.redirect(`/study/${c.params.id}`);
			}
		},
	);

export default app;
