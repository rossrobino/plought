import {
	getAllPostSlugs,
	getPostBySlug,
	parseBlogSource,
	sortAndFilterPosts,
} from "$lib/server/blog";
import { describe, expect, it } from "vitest";

describe("blog loader", () => {
	it("parses valid markdown with YAML frontmatter", () => {
		const post = parseBlogSource(
			[
				"---",
				"title: Sample Post",
				"description: A valid test post.",
				"author: Test Author",
				"date: 2026-03-31",
				"---",
				"",
				"## Heading",
				"",
				"Body text.",
			].join("\n"),
			"sample-post.md",
			"sample-post",
		);

		expect(post).toMatchObject({
			slug: "sample-post",
			title: "Sample Post",
			description: "A valid test post.",
			author: "Test Author",
			date: "2026-03-31",
			draft: false,
		});
		expect(post.html).toContain("<h2>Heading</h2>");
		expect(post.html).toContain("<p>Body text.</p>");
	});

	it("rejects missing frontmatter fields", () => {
		expect(() =>
			parseBlogSource(
				[
					"---",
					"title: Missing Description",
					"author: Test Author",
					"date: 2026-03-31",
					"---",
					"",
					"Body text.",
				].join("\n"),
				"missing-description.md",
				"missing-description",
			),
		).toThrowError(/missing-description\.md/);
	});

	it("rejects invalid YAML", () => {
		expect(() =>
			parseBlogSource(
				[
					"---",
					"title: [",
					"description: Broken",
					"author: Test Author",
					"date: 2026-03-31",
					"---",
				].join("\n"),
				"broken-yaml.md",
				"broken-yaml",
			),
		).toThrowError(/broken-yaml\.md/);
	});

	it("rejects invalid ISO dates", () => {
		expect(() =>
			parseBlogSource(
				[
					"---",
					"title: Invalid Date",
					"description: Not a real ISO date.",
					"author: Test Author",
					"date: not-a-date",
					"---",
				].join("\n"),
				"invalid-date.md",
				"invalid-date",
			),
		).toThrowError(/Invalid date/);
	});

	it("returns the seeded residency post by slug", async () => {
		const post = await getPostBySlug(
			"how-to-systematically-rank-medical-residency-programs",
		);

		expect(post?.title).toBe(
			"How to Systematically Rank Medical Residency Programs",
		);
		expect(post?.description).toContain(
			"Learn how to rank medical residency programs with a structured process",
		);
		expect(post?.author).toBe("Ross Robino");
		expect(post?.html).toContain("Quality of Training");
	});

	it("lists all blog slugs", async () => {
		expect(await getAllPostSlugs()).toContain(
			"how-to-systematically-rank-medical-residency-programs",
		);
	});

	it("filters draft posts from production-style queries", async () => {
		const visible = parseBlogSource(
			[
				"---",
				"title: Visible Post",
				"description: Always visible.",
				"author: Test Author",
				"date: 2026-03-01",
				"---",
			].join("\n"),
			"visible-post.md",
			"visible-post",
		);
		const draft = parseBlogSource(
			[
				"---",
				"title: Draft Post",
				"description: Hidden in production.",
				"author: Test Author",
				"date: 2026-04-01",
				"draft: true",
				"---",
			].join("\n"),
			"draft-post.md",
			"draft-post",
		);

		expect(
			sortAndFilterPosts(
				[visible, draft].map(({ html, ...post }) => post),
				{ includeDrafts: false },
			),
		).toEqual([
			expect.objectContaining({ slug: "visible-post", draft: false }),
		]);
		expect(
			sortAndFilterPosts(
				[visible, draft].map(({ html, ...post }) => post),
				{ includeDrafts: true },
			).map((post) => post.slug),
		).toEqual(["draft-post", "visible-post"]);
	});

	it("sorts post metadata newest first", async () => {
		const older = parseBlogSource(
			[
				"---",
				"title: Older",
				"description: Older test post.",
				"author: Test Author",
				"date: 2026-01-01",
				"---",
			].join("\n"),
			"older.md",
			"older",
		);
		const newer = parseBlogSource(
			[
				"---",
				"title: Newer",
				"description: Newer test post.",
				"author: Test Author",
				"date: 2026-02-01",
				"---",
			].join("\n"),
			"newer.md",
			"newer",
		);

		expect(
			sortAndFilterPosts([older, newer].map(({ html, ...post }) => post)).map(
				(post) => post.slug,
			),
		).toEqual(["newer", "older"]);
	});
});
