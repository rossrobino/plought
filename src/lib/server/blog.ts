import { dev } from "$app/environment";
import { load } from "js-yaml";
import { marked } from "marked";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import * as v from "valibot";

const blogDir = join(process.cwd(), "src", "content", "blog");
const postExt = ".md";
const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

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

const listPostFiles = async () => {
	return (await readdir(blogDir, { withFileTypes: true }))
		.filter((entry) => entry.isFile() && entry.name.endsWith(postExt))
		.map((entry) => entry.name)
		.sort();
};

const isMissingFile = (value: unknown) => {
	return (
		typeof value === "object" &&
		value != null &&
		"code" in value &&
		value.code === "ENOENT"
	);
};

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
		await readFile(join(blogDir, file), "utf8"),
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

export const getAllPostsMeta = async ({ includeDrafts }: BlogOptions = {}) => {
	return (
		await Promise.all(
			(await listPostFiles()).map(async (file) => {
				const slug = file.slice(0, -postExt.length);
				const { html, ...post } = await readPost(file, slug);
				return post;
			}),
		)
	)
		.filter((post) => shouldShowPost(post, resolveIncludeDrafts(includeDrafts)))
		.toSorted(comparePosts);
};

export const getPostBySlug = async (
	slug: string,
	{ includeDrafts }: BlogOptions = {},
) => {
	if (!/^[a-z0-9-]+$/.test(slug)) {
		return null;
	}

	try {
		const post = await readPost(`${slug}${postExt}`, slug);
		return shouldShowPost(post, resolveIncludeDrafts(includeDrafts))
			? post
			: null;
	} catch (cause) {
		if (isMissingFile(cause)) {
			return null;
		}
		throw cause;
	}
};

export const getAllPostSlugs = async (options: BlogOptions = {}) => {
	return (await getAllPostsMeta(options)).map((post) => post.slug);
};
