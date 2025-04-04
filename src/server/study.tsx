import * as auth from "@/lib/auth";
import { db } from "@/lib/db";
import * as query from "@/lib/db/query";
import * as schema from "@/lib/db/schema";
import * as table from "@/lib/db/table";
import type { State } from "@/lib/types";
import { Layout } from "@/server/layout";
import { StudyForm } from "@/ui/form/study";
import { Issues } from "@/ui/issue";
import { StudyTable } from "@/ui/table/study";
import { time } from "build:time";
import { eq } from "drizzle-orm";
import { Router } from "ovr";
import type { ZodIssue } from "zod";

export const studyApp = new Router<State>();

studyApp.get("/", auth.setAuth(), async (c) => {
	c.page(async () => {
		const [publicStudies, userStudies] = await Promise.all([
			query.getStudiesPublic(),
			query.getStudiesByUserId(c.state.auth?.user?.id),
		]);

		return (
			<Layout user={c.state.auth.user}>
				<article>
					<div class="flex items-center justify-between">
						<h1>Studies</h1>
						<a class="button" href="/study/create">
							Create
						</a>
					</div>
					<div class="space-y-4 mt-8">
						<h2>Public</h2>
						<StudyTable studies={publicStudies} />
						<h2>User</h2>
						<StudyTable studies={userStudies} />
					</div>
				</article>
			</Layout>
		);
	});
});

const StudyCreate = async (props: {
	user: table.User | null;
	issues?: ZodIssue[];
}) => {
	return (
		<Layout user={props.user}>
			<article>
				<h1 class="mb-8">Create a New Study</h1>
				<StudyForm />
				<Issues issues={props.issues} />
			</article>
		</Layout>
	);
};

studyApp
	.get("/create", auth.setAuth({ redirect: true }), (c) => {
		c.page(<StudyCreate user={c.state.auth.user} />);
	})
	.post("/create", auth.setAuth({ redirect: true }), async (c) => {
		const formData = await c.req.formData();

		const insert = schema.study.Insert.safeParse({
			userId: c.state.auth.user?.id,
			title: formData.get("title"),
			description: formData.get("description"),
			public: Boolean(formData.get("public")),
		});

		if (!insert.success) {
			c.page(
				<StudyCreate user={c.state.auth.user} issues={insert.error.issues} />,
			);
			return;
		}

		const [study] = await db
			.insert(table.study)
			.values(insert.data)
			.returning({ id: table.study.id });

		if (study) {
			c.redirect(`/study/${study.id}`);
		}
	});

studyApp.get("/:id", auth.setAuth(), async (c) => {
	const study = await query.getStudyById(c.params.id);
	if (!study) return;

	if (c.etag(time + study.updatedAt)) return;

	const { user } = c.state.auth;

	const href = `/study/${study.id}`;

	c.page(
		<Layout user={user}>
			<h1 class="flex gap-4 items-center">
				<a class="underline text-4xl" href={href}>
					#{study.id}
				</a>
				<span>{study.title}</span>
			</h1>
			<p>{study.description}</p>

			{study.userId === user?.id && <a href={`${href}/update`}>Update</a>}
		</Layout>,
	);
});

const StudyUpdate = async (props: {
	user: table.User | null;
	study: Partial<table.Study>;
	issues?: ZodIssue[];
}) => {
	return (
		<Layout user={props.user}>
			<article>
				<h1 class="mb-8">Update Study</h1>
				<StudyForm study={props.study} />
				<Issues issues={props.issues} />
				<form action={`/study/${props.study.id}/delete`}>
					<button class="destructive mt-4">Delete</button>
				</form>
			</article>
		</Layout>
	);
};

studyApp
	.get("/:id/update", auth.setAuth({ redirect: true }), async (c) => {
		const study = await query.getStudyById(c.params.id);
		if (!study || study.userId !== c.state.auth.user?.id) return;

		if (c.etag(time + study.updatedAt)) return;

		c.page(<StudyUpdate user={c.state.auth.user} study={study} />);
	})
	.post("/:id/update", auth.setAuth({ redirect: true }), async (c) => {
		const study = await query.getStudyById(c.params.id);
		if (!study || study.userId !== c.state.auth.user?.id) return;

		const formData = await c.req.formData();

		const update = schema.study.Update.safeParse({
			userId: c.state.auth.user?.id,
			title: formData.get("title"),
			description: formData.get("description"),
			public: Boolean(formData.get("public")),
		});

		if (!update.success) {
			c.page(
				<StudyUpdate
					user={c.state.auth.user}
					study={study}
					issues={update.error.issues}
				/>,
			);

			return;
		}

		await db
			.update(table.study)
			.set(update.data)
			.where(eq(table.study.id, study.id));

		c.redirect(`/study/${c.params.id}`);
	})
	.get("/:id/delete", auth.setAuth({ redirect: true }), async (c) => {
		const study = await query.getStudyById(c.params.id);
		if (!study || study.userId !== c.state.auth.user?.id) return;

		await db.delete(table.study).where(eq(table.study.id, study.id));

		c.redirect("/study");
	});
