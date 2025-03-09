import { Processor } from "@robino/md";
import tailwindcss from "@tailwindcss/vite";
import { domco } from "domco";
import { defineConfig } from "vite";

const processor = new Processor();

export default defineConfig({
	plugins: [
		domco(),
		tailwindcss(),
		{
			name: "local:markdown",
			async transform(md, id) {
				if (/\.(md)$/.test(id)) {
					// convert to html with `marked`
					const { html, article, headings, frontmatter } =
						await processor.process(md);

					return {
						code: `
					export const html = ${JSON.stringify(html)};
					export const article = ${JSON.stringify(article)};
					export const headings = ${JSON.stringify(headings)};
					export const frontmatter = ${JSON.stringify(frontmatter)};
				`.trim(),
						map: null,
					};
				}
			},
		},
	],
});
