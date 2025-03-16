import { authApp } from "./auth";
import { studyApp } from "./study";
import { html as aboutHtml } from "@/content/about.md";
import * as auth from "@/lib/auth";
import type { State } from "@/lib/types";
import { Layout } from "@/server/layout";
import { Router } from "@robino/router";
import { html } from "client:page";

const app = new Router<State>({
	html,
	start: () => ({ auth: { user: null, session: null } }),
});

app.get("/", auth.setAuth(), async (c) => {
	c.res.html((p) =>
		p.body(
			<Layout user={c.state.auth.user}>
				<h1>Hello {c.state.auth.user?.firstName}</h1>
			</Layout>,
		),
	);
});

app.get("/about", async (c) => {
	const about = await (
		<Layout user={null}>
			<article class="prose">{aboutHtml}</article>
		</Layout>
	);

	if (c.res.etag(about)) return;

	c.res.html((p) => p.body(about));
});

app.mount("/study", studyApp);
app.mount("/", authApp);

export const handler = app.fetch;
