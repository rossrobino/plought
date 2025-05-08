import * as query from "@/lib/db/query";
import type { Study, User } from "@/lib/db/table";
import { Layout } from "@/pages/layout";
import { Checkbox, Input, Textarea } from "@/ui/form";
import { Issues } from "@/ui/issue";
import { Table } from "@/ui/table";
import type { ZodIssue } from "zod";

export const Home = (props: { user: User | null }) => {
	return (
		<Layout user={props.user}>
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
		</Layout>
	);
};

export const Create = async (props: {
	user: User | null;
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

export const Update = (props: {
	user: User | null;
	study: Partial<Study>;
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

const StudyForm = (props: { study?: Partial<Study> }) => {
	return (
		<form method="post" class="space-y-3">
			<Input name="title" value={props.study?.title ?? ""} />
			<Textarea name="description">{props.study?.description ?? ""}</Textarea>
			<Checkbox name="public" checked={props.study?.public ? true : false} />
			<button>Submit</button>
		</form>
	);
};

const StudyTable = (props: { studies?: Study[] }) => (
	<Table
		data={props.studies}
		columns={(column) => {
			return [
				column("id", { head: "#" }),
				column("title", {
					cell: ({ id, title }) => <a href={`/study/${id}`}>{title}</a>,
				}),
				column("description"),
				column("status", {
					cell: ({ status }) => <span class="capitalize">{status}</span>,
				}),
			];
		}}
	/>
);
