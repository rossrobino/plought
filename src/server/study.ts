import * as auth from "@/lib/auth";
import { db } from "@/lib/db";
import * as query from "@/lib/db/query";
import * as schema from "@/lib/db/schema";
import * as table from "@/lib/db/table";
import type { State } from "@/lib/types";
import { Studies } from "@/pages/study";
import { StudyCreate } from "@/pages/study/create";
import { StudyId } from "@/pages/study/id";
import { StudyUpdate } from "@/pages/study/update";
import { Router } from "@robino/router";

export const studyApp = new Router<State>();

studyApp.get("/", auth.setAuth(), async (c) => {
	const studies = await db.query.study.findMany();

	c.res.html((p) => {
		p.body(Studies({ user: c.state.auth.user, studies }));
	});
});

studyApp
	.get("/create", auth.setAuth(true), (c) => {
		c.res.html((p) => {
			p.body(StudyCreate({ user: c.state.auth.user }));
		});
	})
	.post("/create", auth.setAuth(true), async (c) => {
		const formData = await c.req.formData();

		const insert = schema.study.Insert.safeParse({
			userId: c.state.auth.user?.id,
			title: formData.get("title"),
			description: formData.get("description"),
		});

		if (!insert.success) {
			c.res.html((p) => {
				p.body(
					StudyCreate({ user: c.state.auth.user, issues: insert.error.issues }),
				);
			});

			return;
		}

		const [study] = await db
			.insert(table.study)
			.values(insert.data)
			.returning({ id: table.study.id });

		if (study) {
			c.res.redirect(`/study/${study.id}`);
		}
	});

studyApp.get("/:id", auth.setAuth(), async (c) => {
	const study = await query.getStudyById(c.params.id);
	if (!study) return;

	c.res.html((p) => {
		p.body(StudyId({ user: c.state.auth.user, study }));
	});
});

studyApp
	.get("/:id/update", auth.setAuth(true), async (c) => {
		const study = await query.getStudyById(c.params.id);
		if (!study || study.userId !== c.state.auth.user?.id) return;

		c.res.html((p) => {
			p.body(StudyUpdate({ user: c.state.auth.user, study }));
		});
	})
	.post("/:id/update", auth.setAuth(true), async (c) => {
		const formData = await c.req.formData();

		const title = String(formData.get("title"));
		const description = String(formData.get("description"));

		const update = schema.study.Update.safeParse({
			userId: c.state.auth.user?.id,
			title,
			description,
		});

		if (!update.success) {
			c.res.html((p) => {
				p.body(
					StudyUpdate({
						study: { title, description },
						user: c.state.auth.user,
						issues: update.error.issues,
					}),
				);
			});

			return;
		}

		const [study] = await db
			.update(table.study)
			.set(update.data)
			.returning({ id: table.study.id });

		c.res.redirect(`/study/${study?.id}`);
	});
