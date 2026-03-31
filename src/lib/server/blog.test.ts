import {
	getAllPostSlugs,
	getAllPostsMeta,
	getPostBySlug,
	parseBlogSource,
} from "$lib/server/blog";
import { randomUUID } from "node:crypto";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const blogDir = join(process.cwd(), "src", "content", "blog");

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
		const id = randomUUID();
		const slug = `zz-test-${id}-draft`;

		try {
			await writeFile(
				join(blogDir, `${slug}.md`),
				[
					"---",
					"title: Draft Post",
					"description: Hidden in production.",
					"author: Test Author",
					"date: 2026-04-01",
					"draft: true",
					"---",
					"",
					"Draft body.",
				].join("\n"),
			);

			expect(
				(await getAllPostsMeta({ includeDrafts: false })).some(
					(post) => post.slug === slug,
				),
			).toBe(false);
			expect(await getPostBySlug(slug, { includeDrafts: false })).toBeNull();
			expect(await getAllPostSlugs({ includeDrafts: false })).not.toContain(
				slug,
			);
			expect(await getPostBySlug(slug, { includeDrafts: true })).toMatchObject({
				slug,
				draft: true,
			});
		} finally {
			await rm(join(blogDir, `${slug}.md`), { force: true });
		}
	});

	it("sorts post metadata newest first", async () => {
		const id = randomUUID();
		const newer = `zz-test-${id}-newer`;
		const older = `zz-test-${id}-older`;

		try {
			await writeFile(
				join(blogDir, `${older}.md`),
				[
					"---",
					"title: Older",
					"description: Older test post.",
					"author: Test Author",
					"date: 2026-01-01",
					"---",
				].join("\n"),
			);
			await writeFile(
				join(blogDir, `${newer}.md`),
				[
					"---",
					"title: Newer",
					"description: Newer test post.",
					"author: Test Author",
					"date: 2026-02-01",
					"---",
				].join("\n"),
			);

			expect(
				(await getAllPostsMeta())
					.filter((post) => post.slug === newer || post.slug === older)
					.map((post) => post.slug),
			).toEqual([newer, older]);
		} finally {
			await rm(join(blogDir, `${older}.md`), { force: true });
			await rm(join(blogDir, `${newer}.md`), { force: true });
		}
	});
});
