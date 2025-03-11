import { html } from "@/content/about.md";
import { Layout } from "@/pages/layout";

export const About = () => {
	return (
		<Layout user={null}>
			<article class="prose">{html}</article>
		</Layout>
	);
};
