import type { User } from "@/lib/db/table";
import { Layout } from "@/pages/layout";
import { StudyForm } from "@/ui/form/study";
import { Issues } from "@/ui/issue";
import type { ZodIssue } from "zod";

export const StudyCreate = async (props: {
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
