import { html as aboutHtml } from "@/content/about.md";
import * as auth from "@/lib/auth";
import type { State } from "@/lib/types";
import { authApp } from "@/server/auth";
import { Layout } from "@/server/layout";
import { studyApp } from "@/server/study";
import { time } from "build:time";
import { html } from "client:page";
import { Router } from "ovr";

const app = new Router<State>({
	start(c) {
		c.base = html;
		return { auth: { user: null, session: null } };
	},
});

app.get("/", auth.setAuth(), async (c) => {
	if (c.etag(time + c.state.auth.user?.updatedAt)) return;

	c.page(
		<Layout user={c.state.auth.user}>
			<h1>Hello {c.state.auth.user?.firstName}</h1>
		</Layout>,
	);
});

app.get("/about", async (c) => {
	if (c.etag(time)) return;

	c.page(
		<Layout user={null}>
			<article class="prose">{aboutHtml}</article>
		</Layout>,
	);
});

app.mount("/study", studyApp);
app.mount("/", authApp);

export default app;
