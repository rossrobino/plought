import type { Study, User } from "@/lib/db/table";
import { Layout } from "@/pages/layout";
import { StudyTable } from "@/ui/table/study";

export const Studies = (props: {
	user: User | null;
	publicStudies: Study[];
	userStudies?: Study[];
}) => {
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
					<StudyTable studies={props.publicStudies} />
					<h2>User</h2>
					<StudyTable studies={props.userStudies} />
				</div>
			</article>
		</Layout>
	);
};
