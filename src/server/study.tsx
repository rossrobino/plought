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

studyApp.get("/", async (c) => {
	c.page(async () => {
		const [{ user }, publicStudies] = await Promise.all([
			auth.get(c),
			query.getStudiesPublic(),
		]);

		return (
			<Layout user={user}>
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
						{async () => {
							const userStudies = await query.getStudiesByUserId(user?.id);
							return <StudyTable studies={userStudies} />;
						}}
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
	.get("/create", async (c) => {
		const { user } = await auth.get(c);
		if (!user) return c.redirect("/");

		c.page(<StudyCreate user={user} />);
	})
	.post("/create", async (c) => {
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
			c.page(<StudyCreate user={user} issues={insert.error.issues} />);
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

studyApp.get("/:id", async (c) => {
	const study = await query.getStudyById(c.params.id);
	if (!study) return;

	if (c.etag(time + study.updatedAt)) return;

	const href = `/study/${study.id}`;

	const { user } = await auth.get(c);

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
	.get("/:id/update", async (c) => {
		const { user } = await auth.get(c);
		if (!user) return c.redirect("/");

		const study = await query.getStudyById(c.params.id);
		if (!study || study.userId !== user?.id) return;

		if (c.etag(time + study.updatedAt)) return;

		c.page(<StudyUpdate user={user} study={study} />);
	})
	.post("/:id/update", async (c) => {
		const { user } = await auth.get(c);
		if (!user) return c.redirect("/");

		const study = await query.getStudyById(c.params.id);
		if (!study || study.userId !== user?.id) return;

		const formData = await c.req.formData();

		const update = schema.study.Update.safeParse({
			userId: user?.id,
			title: formData.get("title"),
			description: formData.get("description"),
			public: Boolean(formData.get("public")),
		});

		if (!update.success) {
			c.page(
				<StudyUpdate user={user} study={study} issues={update.error.issues} />,
			);

			return;
		}

		await db
			.update(table.study)
			.set(update.data)
			.where(eq(table.study.id, study.id));

		c.redirect(`/study/${c.params.id}`);
	})
	.get("/:id/delete", async (c) => {
		const { user } = await auth.get(c);
		if (!user) return c.redirect("/");

		const study = await query.getStudyById(c.params.id);
		if (!study || study.userId !== user?.id) return;

		await db.delete(table.study).where(eq(table.study.id, study.id));

		c.redirect("/study");
	});
