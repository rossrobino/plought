import type { Alternative, Criteria } from "$lib/types";
import { getRobustnessAnalysis, robustnessRuns } from "$lib/util/robustness";
import { describe, expect, it } from "vitest";

describe("robustness analysis", () => {
	it("returns deterministic winners when perturbation strength is zero", () => {
		const alt: Alternative[] = [
			{ name: "A", scores: [9, 8], pairwise: [0.5, 0.5] },
			{ name: "B", scores: [4, 3], pairwise: [0.5, 0.5] },
		];
		const cri: Criteria[] = [
			{ name: "Cost", weight: 0.6 },
			{ name: "Speed", weight: 0.4 },
		];
		const res = getRobustnessAnalysis(alt, cri, 0);

		expect(res.runs).toBe(robustnessRuns);
		expect(res.methods.weightedSum.winnerIndex).toBe(0);
		expect(res.methods.topsis.winnerIndex).toBe(0);
		expect(res.methods.combined.winnerIndex).toBe(0);
		expect(res.methods.weightedSum.alternatives[0].winRatePct).toBe(100);
		expect(res.methods.weightedSum.alternatives[1].winRatePct).toBe(0);
		expect(res.methods.weightedSum.alternatives[0].avgRank).toBe(1);
		expect(res.methods.weightedSum.alternatives[1].avgRank).toBe(2);
	});

	it("returns empty method results when no alternatives are provided", () => {
		const cri: Criteria[] = [{ name: "Cost", weight: 1 }];
		const res = getRobustnessAnalysis([], cri);

		expect(res.runs).toBe(robustnessRuns);
		expect(res.methods.weightedSum.alternatives).toEqual([]);
		expect(res.methods.topsis.alternatives).toEqual([]);
		expect(res.methods.combined.alternatives).toEqual([]);
		expect(res.methods.weightedSum.winnerIndex).toBeNull();
		expect(res.methods.topsis.winnerIndex).toBeNull();
		expect(res.methods.combined.winnerIndex).toBeNull();
	});

	it("uses a caller-provided run count", () => {
		const alt: Alternative[] = [
			{ name: "A", scores: [9, 8], pairwise: [0.5, 0.5] },
			{ name: "B", scores: [4, 3], pairwise: [0.5, 0.5] },
		];
		const cri: Criteria[] = [
			{ name: "Cost", weight: 0.6 },
			{ name: "Speed", weight: 0.4 },
		];
		const res = getRobustnessAnalysis(alt, cri, 0, 25);

		expect(res.runs).toBe(25);
		expect(res.methods.weightedSum.alternatives[0].winRatePct).toBe(100);
		expect(res.methods.weightedSum.alternatives[1].winRatePct).toBe(0);
	});
});
