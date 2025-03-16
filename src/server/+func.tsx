import { authApp } from "./auth";
import { studyApp } from "./study";
import * as auth from "@/lib/auth";
import type { State } from "@/lib/types";
import { About } from "@/pages/about";
import { Home } from "@/pages/home";
import { Router } from "@robino/router";
import { html } from "client:page";

const app = new Router<State>({
	html,
	start: () => ({ auth: { user: null, session: null } }),
});

app.get("/", auth.setAuth(), async (c) => {
	c.res.html((p) => p.body(Home({ user: c.state.auth.user })));
});

app.get("/about", async (c) => {
	const about = await About();
	if (c.res.etag(about)) return;

	c.res.html((p) => p.body(about));
});

app.mount("/study", studyApp);
app.mount("/", authApp);

export const handler = app.fetch;
