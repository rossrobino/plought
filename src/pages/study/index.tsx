import type { User } from "@/lib/db/table";
import { Layout } from "@/pages/layout";

export const Study = (props: { user: User | null }) => {
	return (
		<Layout user={props.user}>
			<article>
				<h1>Study</h1>
				<a href="/study/create">Create</a>
			</article>
		</Layout>
	);
};
