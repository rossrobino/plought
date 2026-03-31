import { getAllPostSlugs, getPostBySlug } from "$lib/server/blog";
import type { EntryGenerator, PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const entries: EntryGenerator = async () => {
	return (await getAllPostSlugs()).map((slug) => ({ slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPostBySlug(params.slug);
	if (post == null) {
		throw error(404, `Blog post not found: ${params.slug}`);
	}

	return { post };
};
