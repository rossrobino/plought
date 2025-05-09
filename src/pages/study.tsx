import * as query from "@/lib/db/query";
import type * as table from "@/lib/db/table";
import { Checkbox, Input, Textarea } from "@/ui/form";
import { Issues } from "@/ui/issue";
import { Table } from "@/ui/table";
import type { ZodIssue } from "zod";

export const Home = (props: { user: table.User | null }) => {
	return (
		<article>
			<div class="flex items-center justify-between">
				<h1>Studies</h1>
				<a class="button" href="/study/create">
					Create
				</a>
			</div>
			<div class="space-y-4 mt-8">
				<h2>Public</h2>
				{async () => {
					const publicStudies = await query.studiesPublic();
					return <StudyTable studies={publicStudies} />;
				}}

				<h2>Studies</h2>
				{async () => {
					const userStudies = await query.studiesByUserId(props.user?.id);
					return <StudyTable studies={userStudies} />;
				}}
			</div>
		</article>
	);
};

export const Create = async (props: { issues?: ZodIssue[] }) => {
	return (
		<article>
			<h1 class="mb-8">Create a New Study</h1>
			<StudyForm />
			<Issues issues={props.issues} />
		</article>
	);
};

export const Study = async (props: {
	user: table.User | null;
	study: table.Study;
}) => {
	const { user, study } = props;

	const pathname = `/study/${study.id}`;

	return (
		<>
			<h1 class="flex gap-4 items-center">
				<a class="underline text-4xl" href={pathname}>
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
						<a href={`${pathname}/update`}>Update</a>
					</div>

					{() => {
						if (study.status === "draft") {
							return (
								<form
									class="grid gap-4"
									method="post"
									action={`/study/${study.id}/draft`}
								>
									{/* TODO No endpoint for this yet. */}

									<p>Select instruments to run your study with:</p>

									{async () => {
										const instruments = await query.instrumentsAll();

										return instruments.map((inst) => {
											return (
												<div class="border rounded p-4">
													<Checkbox
														name="instrument"
														label={inst.name}
														value={`${inst.id}`}
														desc={inst.description}
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
		</>
	);
};

export const Update = (props: {
	study: Partial<table.Study>;
	issues?: ZodIssue[];
}) => {
	return (
		<article>
			<h1 class="mb-8">Update Study</h1>
			<StudyForm study={props.study} />
			<Issues issues={props.issues} />
			<form action={`/study/${props.study.id}/delete`}>
				<button class="destructive mt-4">Delete</button>
			</form>
		</article>
	);
};

const StudyForm = (props: { study?: Partial<table.Study> }) => {
	return (
		<form method="post" class="space-y-3">
			<Input name="title" value={props.study?.title ?? ""} />
			<Textarea name="description">{props.study?.description ?? ""}</Textarea>
			<Checkbox name="public" checked={props.study?.public ? true : false} />
			<button>Submit</button>
		</form>
	);
};

const StudyTable = (props: { studies?: table.Study[] }) => (
	<Table
		data={props.studies}
		columns={(h) => {
			return [
				h("id", { head: "#" }),
				h("title", {
					cell: ({ id, title }) => <a href={`/study/${id}`}>{title}</a>,
				}),
				h("description"),
				h("status", {
					cell: ({ status }) => <span class="capitalize">{status}</span>,
				}),
			];
		}}
	/>
);
