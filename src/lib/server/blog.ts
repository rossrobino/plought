import { dev } from "$app/environment";
import { read } from "$app/server";
import { load } from "js-yaml";
import { marked } from "marked";
import * as v from "valibot";

const postExt = ".md";
const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const postAssets = Object.fromEntries(
	Object.entries(
		import.meta.glob("/src/content/blog/*.md", {
			eager: true,
			import: "default",
			query: "?url",
		}),
	).map(([path, asset]) => [path.split("/").at(-1) ?? path, asset]),
) as Record<string, string>;
const postSources =
	process.env.TEST === "true"
		? (Object.fromEntries(
				Object.entries(
					import.meta.glob("/src/content/blog/*.md", {
						eager: true,
						import: "default",
						query: "?raw",
					}),
				).map(([path, source]) => [path.split("/").at(-1) ?? path, source]),
			) as Record<string, string>)
		: {};

const frontmatterSchema = v.strictObject({
	title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(120)),
	description: v.pipe(v.string(), v.nonEmpty(), v.maxLength(240)),
	author: v.pipe(v.string(), v.nonEmpty(), v.maxLength(80)),
	date: v.pipe(v.string(), v.nonEmpty(), v.isoDate()),
	draft: v.optional(v.boolean(), false),
});

type Frontmatter = v.InferOutput<typeof frontmatterSchema>;
interface BlogOptions {
	includeDrafts?: boolean;
}

export interface BlogPostMeta extends Frontmatter {
	slug: string;
}

export interface BlogPost extends BlogPostMeta {
	html: string;
}

const validateFrontmatter = (value: unknown, file: string) => {
	const result = v.safeParse(frontmatterSchema, value);
	if (result.success) {
		return result.output;
	}

	throw new Error(
		`Invalid frontmatter in blog post "${file}": ${v.summarize(result.issues)}`,
	);
};

const normalizeFrontmatter = (value: unknown) => {
	if (
		typeof value === "object" &&
		value != null &&
		"date" in value &&
		value.date instanceof Date
	) {
		return { ...value, date: value.date.toISOString().slice(0, 10) };
	}

	return value;
};

const listPostFiles = () => Object.keys(postAssets).sort();

export const parseBlogSource = (
	source: string,
	file: string,
	slug: string,
): BlogPost => {
	const match = source.match(frontmatterPattern);
	if (match == null) {
		throw new Error(`Blog post "${file}" is missing YAML frontmatter.`);
	}

	let frontmatter: Frontmatter;

	try {
		frontmatter = validateFrontmatter(
			normalizeFrontmatter(load(match[1])),
			file,
		);
	} catch (cause) {
		if (
			cause instanceof Error &&
			cause.message.startsWith("Invalid frontmatter")
		) {
			throw cause;
		}

		const message = cause instanceof Error ? cause.message : String(cause);
		throw new Error(
			`Could not parse frontmatter in blog post "${file}": ${message}`,
		);
	}

	return {
		slug,
		...frontmatter,
		html: marked.parse(match[2], { async: false }),
	};
};

const readPost = async (file: string, slug: string) => {
	return parseBlogSource(
		postSources[file] ?? (await read(postAssets[file]).text()),
		file,
		slug,
	);
};

const comparePosts = (a: BlogPostMeta, b: BlogPostMeta) => {
	return b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug);
};

const shouldShowPost = (post: BlogPostMeta, includeDrafts: boolean) => {
	return includeDrafts || !post.draft;
};

const resolveIncludeDrafts = (includeDrafts = dev) => includeDrafts;
export const sortAndFilterPosts = (
	posts: BlogPostMeta[],
	{ includeDrafts }: BlogOptions = {},
) => {
	return posts
		.filter((post) => shouldShowPost(post, resolveIncludeDrafts(includeDrafts)))
		.toSorted(comparePosts);
};

export const getAllPostsMeta = async ({ includeDrafts }: BlogOptions = {}) => {
	return sortAndFilterPosts(
		await Promise.all(
			listPostFiles().map(async (file) => {
				const slug = file.slice(0, -postExt.length);
				const { html, ...post } = await readPost(file, slug);
				return post;
			}),
		),
		{ includeDrafts },
	);
};

export const getPostBySlug = async (
	slug: string,
	{ includeDrafts }: BlogOptions = {},
) => {
	if (!/^[a-z0-9-]+$/.test(slug)) {
		return null;
	}

	const file = `${slug}${postExt}`;
	if (!(file in postAssets)) {
		return null;
	}

	const post = await readPost(file, slug);
	return shouldShowPost(post, resolveIncludeDrafts(includeDrafts))
		? post
		: null;
};

export const getAllPostSlugs = async (options: BlogOptions = {}) => {
	return (await getAllPostsMeta(options)).map((post) => post.slug);
};
