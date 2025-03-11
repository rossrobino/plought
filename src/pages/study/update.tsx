import type { Study, User } from "@/lib/db/table";
import { Layout } from "@/pages/layout";
import { StudyForm } from "@/ui/form/study";
import { Issues } from "@/ui/issue";
import type { ZodIssue } from "zod";

export const StudyUpdate = async (props: {
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
			</article>
		</Layout>
	);
};
