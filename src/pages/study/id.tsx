import { Layout } from "../layout";
import type { Study, User } from "@/lib/db/table";

export const StudyId = async (props: { user: User | null; study: Study }) => {
	const href = `/study/${props.study.id}`;

	return (
		<Layout user={props.user}>
			<h1 class="flex gap-4 items-center">
				<a class="underline text-4xl" href={href}>
					#{props.study.id}
				</a>
				<span>{props.study.title}</span>
			</h1>
			<p>{props.study.description}</p>

			{props.study.userId === props.user?.id && (
				<a href={`${href}/update`}>Update</a>
			)}
		</Layout>
	);
};
