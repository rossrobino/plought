import * as auth from "@/lib/auth";
import { db } from "@/lib/db";
import * as query from "@/lib/db/query";
import * as schema from "@/lib/db/schema";
import * as table from "@/lib/db/table";
import type { State } from "@/lib/types";
import { Layout } from "@/server/layout";
import { StudyCreate } from "@/server/study/create";
import { StudyUpdate } from "@/server/study/update";
import { Checkbox } from "@/ui/form";
import { StudyTable } from "@/ui/table/study";
import { time } from "build:time";
import { eq } from "drizzle-orm";
import { Router } from "ovr";

export const studyApp = new Router<State>();

studyApp.get("/", (c) => {
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
			return c.page(<StudyCreate user={user} issues={insert.error.issues} />);
		}

		const [study] = await db
			.insert(table.study)
			.values(insert.data)
			.returning({ id: table.study.id });

		if (study) c.redirect(`/study/${study.id}`);
	});

studyApp.get("/:id", async (c) => {
	const [{ user }, study] = await Promise.all([
		auth.get(c),
		query.getStudyById(c.params.id),
	]);

	if (!study) return;

	if (c.etag(time + study.updatedAt)) return;

	const href = `/study/${study.id}`;

	c.page(
		<Layout user={user}>
			<h1 class="flex gap-4 items-center">
				<a class="underline text-4xl" href={href}>
					#{study.id}
				</a>
				<span>{study.title}</span>
			</h1>
			<div class="flex gap-2 my-4">
				<div class="badge">{study.status}</div>
				<div>{study.description}</div>
			</div>

			{study.userId === user?.id && (
				<div>
					<div class="mb-4">
						<a href={`${href}/update`}>Update</a>
					</div>

					{() => {
						if (study.status === "draft") {
							return (
								<form class="grid gap-4">
									{/* TODO No endpoint for this yet. */}
									<p>Select instruments to run your study with:</p>

									{async () => {
										const instruments = await query.getInstrumentsAll();
										return instruments.map((ins) => {
											return (
												<div class="border rounded p-4">
													<Checkbox
														name="instrument"
														label={ins.name}
														desc={ins.description}
													/>
												</div>
											);
										});
									}}

									<button>Next</button>
								</form>
							);
						}

						return null;
					}}
				</div>
			)}
		</Layout>,
	);
});

studyApp.on(["GET", "POST"], ["/:id/update", "/:id/delete"], async (c) => {
	const [{ user }, study] = await Promise.all([
		auth.get(c),
		query.getStudyById(c.params.id),
	]);

	if (!user) return c.redirect("/");
	if (!study || study.userId !== user?.id) return;

	if (c.url.pathname.includes("delete")) {
		await db.delete(table.study).where(eq(table.study.id, study.id));
		return c.redirect("/study");
	}

	if (c.req.method === "GET") {
		return c.page(<StudyUpdate user={user} study={study} />);
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
				<StudyUpdate user={user} study={study} issues={update.error.issues} />,
			);
		}

		await db
			.update(table.study)
			.set(update.data)
			.where(eq(table.study.id, study.id));

		return c.redirect(`/study/${c.params.id}`);
	}
});
