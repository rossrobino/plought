import { AI } from "$lib/ai";
import { decisionDefaults } from "$lib/state";
import { allocationTotal, normalizeAllocationRow } from "$lib/util/allocate";
import { describe, expect, it, vi } from "vitest";

const createClient = (response: {
	output?: unknown[];
	output_text?: string;
}) => {
	return {
		responses: { create: vi.fn().mockResolvedValue(response) },
	} as unknown as ConstructorParameters<typeof AI>[1];
};

describe("AI research helpers", () => {
	it("includes cleaned decision notes and target details in the score prompt", () => {
		const client = new AI("test");
		const prompt = client.buildScoreResearchPrompt({
			title: decisionDefaults.title,
			goal: decisionDefaults.goal,
			notes: "  current cost and commute details  ",
			alternative: "Seattle",
			criterion: "Affordability",
			existingAlternatives: ["Alternative #1", "Seattle", "Portland"],
			existingCriteria: ["Criterion #1", "Affordability", "Weather"],
			requestId: "abc",
		});

		expect(prompt).toContain("Decision title: not provided");
		expect(prompt).toContain("Decision goal: not provided");
		expect(prompt).toContain(
			"Decision notes: current cost and commute details",
		);
		expect(prompt).toContain("Target alternative: Seattle");
		expect(prompt).toContain("Target criterion: Affordability");
		expect(prompt).not.toContain("Alternative #1");
		expect(prompt).not.toContain("Criterion #1");
	});

	it("rejects placeholder targets for score and allocate research", () => {
		const client = new AI("test");

		expect(
			client.canScore({
				title: decisionDefaults.title,
				goal: decisionDefaults.goal,
				notes: "",
				alternative: "Alternative #1",
				criterion: "Criterion #1",
				existingAlternatives: ["Alternative #1", "Alternative #2"],
				existingCriteria: ["Criterion #1", "Criterion #2"],
				requestId: "abc",
			}),
		).toBe(false);

		expect(
			client.canAllocate({
				title: "Move",
				goal: "Choose a city",
				notes: "",
				criterion: "Criterion #1",
				existingAlternatives: ["Seattle", "Alternative #2"],
				existingCriteria: ["Criterion #1", "Weather"],
				requestId: "abc",
			}),
		).toBe(false);
	});

	it("parses score research, keeps sources, and dedupes citations", async () => {
		const client = new AI(
			"test",
			createClient({
				output_text: JSON.stringify({
					summary: " Seattle is a strong fit. ",
					suggestedScore: 7.25,
					reason: "  Housing costs are still high. ",
					considerations: ["Taxes", " Schools ", "Taxes"],
					confidence: "medium",
				}),
				output: [
					{
						type: "message",
						content: [
							{
								type: "output_text",
								annotations: [
									{
										type: "url_citation",
										title: "Cost of living index",
										url: "https://example.com/cost",
									},
									{
										type: "url_citation",
										title: "Cost of living index",
										url: "https://example.com/cost",
									},
								],
							},
						],
					},
				],
			}),
		);

		const result = await client.createScoreResearch({
			title: "Next move",
			goal: "Choose a city",
			notes: "",
			alternative: "Seattle",
			criterion: "Affordability",
			existingAlternatives: ["Seattle", "Portland"],
			existingCriteria: ["Affordability", "Weather"],
			requestId: "abc",
		});

		expect(result).toEqual({
			summary: "Seattle is a strong fit.",
			suggestedScore: 7,
			reason: "Housing costs are still high.",
			considerations: ["Taxes", "Schools"],
			confidence: "medium",
			sources: [
				{ title: "Cost of living index", url: "https://example.com/cost" },
			],
		});
	});

	it("normalizes allocate research to the decision alternatives", async () => {
		const client = new AI(
			"test",
			createClient({
				output_text: JSON.stringify({
					summary: "Prefer the cities with stronger schools.",
					suggestedPoints: [
						{
							alternative: "Portland",
							points: 35,
							reason: "Solid schools and family amenities.",
						},
						{
							alternative: "Seattle",
							points: 65,
							reason: "Broader school and neighborhood options.",
						},
					],
					confidence: "high",
				}),
				output: [
					{
						type: "web_search_call",
						action: {
							type: "search",
							sources: [{ type: "url", url: "https://example.com/schools" }],
						},
					},
				],
			}),
		);

		const result = await client.createAllocateResearch({
			title: "Next move",
			goal: "Choose a city",
			notes: "",
			criterion: "Schools",
			existingAlternatives: ["Seattle", "Portland"],
			existingCriteria: ["Schools", "Weather"],
			requestId: "abc",
		});

		expect(result.suggestedPoints.map((item) => item.alternative)).toEqual([
			"Seattle",
			"Portland",
		]);
		expect(
			normalizeAllocationRow(
				result.suggestedPoints.map((item) => item.points),
				result.suggestedPoints.length,
				allocationTotal,
			).reduce((sum, item) => sum + item, 0),
		).toBeCloseTo(100, 5);
		expect(result.sources).toEqual([
			{ title: "example.com", url: "https://example.com/schools" },
		]);
	});
});
