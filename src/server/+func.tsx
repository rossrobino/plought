import * as auth from "@/lib/auth";
import * as google from "@/lib/auth/google";
import { db } from "@/lib/db";
import * as query from "@/lib/db/query";
import * as schema from "@/lib/db/schema";
import * as table from "@/lib/db/table";
import * as f from "@/lib/fetch";
import type { State } from "@/lib/types";
import { About } from "@/pages/about";
import { Home } from "@/pages/home";
import { Login } from "@/pages/login";
import { Study } from "@/pages/study";
import { StudyCreate } from "@/pages/study/create";
import { StudyId } from "@/pages/study/id";
import { StudyUpdate } from "@/pages/study/update";
import { Page } from "@robino/html";
import { Router } from "@robino/router";
import { html } from "client:page";

const app = new Router<State>({
	start() {
		return { page: new Page(html), auth: { user: null, session: null } };
	},
});

app.get("/", auth.setAuth(), async (c) => {
	c.res = c.state.page.body(<Home user={c.state.auth.user} />).toResponse();
});

app.get("/about", async (c) => {
	c.res = c.state.page.body(<About />).toResponse();
});

app.get("/study", auth.setAuth(), (c) => {
	c.res = c.state.page.body(<Study user={c.state.auth.user} />).toResponse();
});

app
	.get("/study/create", auth.setAuth(true), (c) => {
		c.res = c.state.page
			.body(<StudyCreate user={c.state.auth.user} />)
			.toResponse();
	})
	.post("/study/create", auth.setAuth(true), async (c) => {
		const formData = await c.req.formData();

		const insert = schema.study.Insert.safeParse({
			userId: c.state.auth.user?.id,
			title: formData.get("title"),
			description: formData.get("description"),
		});

		if (!insert.success) {
			c.res = c.state.page
				.body(
					<StudyCreate user={c.state.auth.user} issues={insert.error.issues} />,
				)
				.toResponse();
			return;
		}

		const [study] = await db
			.insert(table.study)
			.values(insert.data)
			.returning({ id: table.study.id });

		if (study) {
			c.res = f.redirect(`/study/${study.id}`);
		}
	});

app.get("/study/:id", auth.setAuth(), async (c) => {
	const study = await query.getStudyById(c.params.id);
	if (!study) return;
	c.res = c.state.page
		.body(<StudyId user={c.state.auth.user} study={study} />)
		.toResponse();
});

app
	.get("/study/:id/update", auth.setAuth(true), async (c) => {
		const study = await query.getStudyById(c.params.id);
		if (!study || study.userId !== c.state.auth.user?.id) return;

		c.res = c.state.page
			.body(<StudyUpdate study={study} user={c.state.auth.user} />)
			.toResponse();
	})
	.post("/study/:id/update", auth.setAuth(true), async (c) => {
		const formData = await c.req.formData();

		const title = String(formData.get("title"));
		const description = String(formData.get("description"));

		const update = schema.study.Update.safeParse({
			userId: c.state.auth.user?.id,
			title,
			description,
		});

		if (!update.success) {
			c.res = c.state.page
				.body(
					<StudyUpdate
						study={{ title, description }}
						user={c.state.auth.user}
						issues={update.error.issues}
					/>,
				)
				.toResponse();
			return;
		}

		const [study] = await db
			.update(table.study)
			.set(update.data)
			.returning({ id: table.study.id });

		c.res = f.redirect(`/study/${study?.id}`);
	});

app.get("/login", auth.setAuth(), (c) => {
	if (c.state.auth.user) {
		c.res = f.redirect("/");
		return;
	}

	c.res = c.state.page.body(<Login />).toResponse();
});

app.get("/logout", auth.setAuth(), async (c) => {
	if (c.state.auth.user) {
		await auth.invalidateAllSessions(c.state.auth.user.id);
	}

	c.res = f.redirect("/");
	auth.deleteSessionTokenCookie(c.res);
});

app
	.get("/login/google", google.login)
	.get("/login/google/callback", google.loginCallback);

export const handler = app.fetch;
