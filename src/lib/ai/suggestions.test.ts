import { AI } from "$lib/ai/core";
import { decisionDefaults } from "$lib/state";
import { describe, expect, it } from "vitest";

const client = new AI("test");

describe("AI suggestion helpers", () => {
	it("ignores untouched default decision text when building prompt input", () => {
		const prompt = client.buildAlternativePrompt({
			title: decisionDefaults.title,
			goal: decisionDefaults.goal,
			context: "  west coast  ",
			existingAlternatives: ["Alternative #1", "Portland"],
			requestId: "abc",
		});

		expect(prompt).toContain("Decision title: not provided");
		expect(prompt).toContain("Decision goal: not provided");
		expect(prompt).toContain("Extra context: west coast");
		expect(prompt).toContain("Portland");
		expect(prompt).not.toContain("Alternative #1");
	});

	it("filters placeholder alternatives and criteria from prompt context", () => {
		const prompt = client.buildCriteriaPrompt({
			title: "Next move",
			goal: "Choose a city",
			context: "",
			existingAlternatives: ["Alternative #1", "Seattle", "Portland"],
			existingCriteria: ["Criterion #1", "Schools", "Weather"],
			requestId: "abc",
		});

		expect(prompt).not.toContain("Alternative #1");
		expect(prompt).not.toContain("Criterion #1");
		expect(prompt).toContain("Seattle");
		expect(prompt).toContain("Schools");
		expect(prompt).toContain("Make each suggestion as independent as possible");
	});

	it("treats defaults and placeholders as empty when checking if a request is useful", () => {
		const valid = client.hasInput(
			{
				title: decisionDefaults.title,
				goal: decisionDefaults.goal,
				context: "",
				existingAlternatives: ["Alternative #1", "Alternative #2"],
				existingCriteria: ["Criterion #1", "Criterion #2"],
				requestId: "abc",
			},
			"criteria",
		);

		expect(valid).toBe(false);
	});

	it("normalizes model output by trimming, deduping, excluding existing items, and capping the result", () => {
		const result = client.normalizeResult(
			{
				summary: "  Suggestions for the move.  ",
				items: [
					{ name: "", reason: "drop empty" },
					{ name: "Seattle", reason: "Strong job market." },
					{ name: "  Portland  ", reason: "  Family friendly.  " },
					{ name: "seattle", reason: "Duplicate" },
					{ name: "San Diego", reason: "" },
					...Array.from({ length: 20 }, (_, i) => {
						return { name: `City ${i + 1}`, reason: `Reason ${i + 1}` };
					}),
				],
			},
			["Portland"],
		);

		expect(result.summary).toBe("Suggestions for the move.");
		expect(result.items[0]).toEqual({
			name: "Seattle",
			reason: "Strong job market.",
		});
		expect(result.items[1]).toEqual({
			name: "San Diego",
			reason: "Fits the context you provided for this decision.",
		});
		expect(result.items).toHaveLength(15);
		expect(result.items.some((item) => item.name === "Portland")).toBe(false);
		expect(result.items.filter((item) => item.name === "Seattle")).toHaveLength(
			1,
		);
	});

	it("rejects invalid model output", () => {
		expect(() =>
			client.parseResult({
				summary: 123,
				items: [{ name: "Seattle", reason: "Because" }],
			}),
		).toThrow("AI returned an invalid suggestion response.");
	});
});
