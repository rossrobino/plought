import { html } from "@/content/about.md";
import type { User } from "@/lib/db/table";
import { Layout } from "@/pages/layout";

export const Home = (props: { user: User | null }) => {
	return (
		<Layout user={props.user}>
			<article class="prose">{html}</article>
		</Layout>
	);
};
