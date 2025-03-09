import * as auth from "@/lib/auth";
import * as google from "@/lib/auth/google";
import type { State } from "@/lib/types";
import { About } from "@/pages/about";
import { Home } from "@/pages/home";
import { Layout } from "@/pages/layout";
import { Page } from "@robino/html";
import { Router } from "@robino/router";
import { html } from "client:page";

const app = new Router<State>({
	start() {
		return { page: new Page(html), auth: { user: null, session: null } };
	},
});

app.get("/", auth.setAuth, async (c) => {
	c.res = c.state.page
		.body(
			<Layout user={c.state.auth.user}>
				<Home user={c.state.auth.user} />
			</Layout>,
		)
		.toResponse();
});

app.get("/about", auth.setAuth, async (c) => {
	c.res = c.state.page
		.body(
			<Layout user={c.state.auth.user}>
				<About />
			</Layout>,
		)
		.toResponse();
});

app.get("/login", auth.setAuth, (c) => {
	if (c.state.auth.user) {
		c.res = new Response(null, {
			status: 302,
			headers: {
				Location: "/app",
			},
		});

		return;
	}

	c.res = c.state.page
		.body(
			<Layout user={c.state.auth.user}>
				<div class="border rounded-xl p-6">
					<a class="button" href="/login/google">
						Login with Google
					</a>
				</div>
			</Layout>,
		)
		.toResponse();
});

app.get("/logout", auth.setAuth, async (c) => {
	if (c.state.auth.user) {
		await auth.invalidateAllSessions(c.state.auth.user.id);
	}

	c.res = new Response(null, {
		status: 302,
		headers: { Location: "/" },
	});
	auth.deleteSessionTokenCookie(c.res);
});

app
	.get("/login/google", google.login)
	.get("/login/google/callback", google.loginCallback);

export const handler = app.fetch;
