import type { Alternative, Criteria } from "$lib/types";
import {
	getAgreementLevel,
	getConsensusRank,
	getConsensusScore10,
	getGuidanceCopy,
	getMethodRanks,
	getMethodScores,
} from "$lib/util/analysis";
import { describe, expect, it } from "vitest";

describe("analysis utilities", () => {
	it("builds raw and normalized method scores", () => {
		const alt: Alternative[] = [
			{ name: "A", scores: [10, 5], pairwise: [0.5, 0.8, 0.6] },
			{ name: "B", scores: [8, 6], pairwise: [0.2, 0.5, 0.4] },
			{ name: "C", scores: [4, 9], pairwise: [0.4, 0.6, 0.5] },
		];
		const cri: Criteria[] = [
			{ name: "Cost", weight: 0.7 },
			{ name: "Speed", weight: 0.3 },
		];
		const allocation = [
			[70, 20, 10],
			[20, 30, 50],
		];

		const scores = getMethodScores(alt, cri, [2, 0, 1], allocation);

		expect(scores.raw.weightedSum).toEqual([8.5, 7.4, 5.5]);
		expect(scores.raw.pairwise).toEqual([1.4, 0.6, 1]);
		expect(scores.raw.rankOrder).toEqual([5, 0, 10]);
		expect(scores.raw.allocate).toEqual([5.5, 2.3, 2.2]);
		expect(scores.normalized10.weightedSum).toEqual([8.5, 7.4, 5.5]);
		expect(scores.normalized10.pairwise).toEqual([7, 3, 5]);
		expect(scores.normalized10.rankOrder).toEqual([5, 0, 10]);
		expect(scores.normalized10.allocate).toEqual([5.5, 2.3, 2.2]);
		expect(scores.normalized10.topsis).toEqual(scores.raw.topsis);
		expect(scores.raw.topsis.every((value) => value >= 0 && value <= 10)).toBe(
			true,
		);
	});

	it("assigns average ranks for ties", () => {
		const ranks = getMethodRanks({
			weightedSum: [8, 8, 4],
			pairwise: [1, 2, 3],
			rankOrder: [10, 5, 0],
			allocate: [4, 4, 8],
			topsis: [0, 0, 0],
		});

		expect(ranks.weightedSum).toEqual([1.5, 1.5, 3]);
		expect(ranks.pairwise).toEqual([3, 2, 1]);
		expect(ranks.rankOrder).toEqual([1, 2, 3]);
		expect(ranks.allocate).toEqual([2.5, 2.5, 1]);
		expect(ranks.topsis).toEqual([2, 2, 2]);
	});

	it("averages consensus scores across included methods", () => {
		const map = {
			weightedSum: [10, 5],
			pairwise: [0, 10],
			rankOrder: [2, 2],
			allocate: [6, 2],
			topsis: [4, 6],
		};

		expect(getConsensusScore10(map, [])).toEqual([0, 0]);
		expect(getConsensusScore10(map, ["weightedSum", "pairwise"])).toEqual([
			5, 7.5,
		]);
	});

	it("ranks consensus with score tie-breakers", () => {
		const rank = getConsensusRank(
			{
				weightedSum: [1, 2, 3],
				pairwise: [2, 1, 3],
				rankOrder: [1, 2, 3],
				allocate: [3, 2, 1],
				topsis: [1, 2, 3],
			},
			["weightedSum", "pairwise"],
			[7, 8, 2],
		);

		expect(rank.meanRank).toEqual([1.5, 1.5, 3]);
		expect(rank.order).toEqual([1, 0, 2]);
		expect(rank.winnerIndex).toBe(1);
		expect(rank.runnerUpIndex).toBe(0);
		expect(rank.runnerUpGap).toBe(1);
	});

	it("derives agreement levels from first-place votes", () => {
		const high = getAgreementLevel(
			{
				meanRank: [1, 2],
				order: [0, 1],
				runnerUpGap: 1,
				runnerUpIndex: 1,
				winnerIndex: 0,
			},
			{
				weightedSum: [1, 2],
				pairwise: [1, 2],
				rankOrder: [2, 1],
				allocate: [1, 2],
				topsis: [1, 2],
			},
			["weightedSum", "pairwise", "rankOrder", "allocate"],
		);
		const medium = getAgreementLevel(
			{
				meanRank: [1, 2],
				order: [0, 1],
				runnerUpGap: 1,
				runnerUpIndex: 1,
				winnerIndex: 0,
			},
			{
				weightedSum: [1, 2],
				pairwise: [1, 2],
				rankOrder: [2, 1],
				allocate: [2, 1],
				topsis: [2, 1],
			},
			["weightedSum", "pairwise", "rankOrder", "allocate"],
		);
		const low = getAgreementLevel(
			{
				meanRank: [1, 2],
				order: [0, 1],
				runnerUpGap: 1,
				runnerUpIndex: 1,
				winnerIndex: 0,
			},
			{
				weightedSum: [1, 2],
				pairwise: [2, 1],
				rankOrder: [2, 1],
				allocate: [2, 1],
				topsis: [2, 1],
			},
			["weightedSum", "pairwise", "rankOrder", "allocate"],
		);
		const none = getAgreementLevel(
			{
				meanRank: [],
				order: [],
				runnerUpGap: 0,
				runnerUpIndex: null,
				winnerIndex: null,
			},
			{
				weightedSum: [1, 2],
				pairwise: [2, 1],
				rankOrder: [2, 1],
				allocate: [2, 1],
				topsis: [2, 1],
			},
			[],
		);

		expect(high).toBe("high");
		expect(medium).toBe("medium");
		expect(low).toBe("low");
		expect(none).toBe("none");
	});

	it("returns guidance copy for method and summary paths", () => {
		const alt: Alternative[] = [
			{ name: "Alpha", scores: [], pairwise: [] },
			{ name: "Beta", scores: [], pairwise: [] },
		];

		const methodCopy = getGuidanceCopy({
			agreement: "medium",
			alternatives: alt,
			method: "pairwise",
		});
		const emptyCopy = getGuidanceCopy({
			agreement: "none",
			alternatives: alt,
			includedMethods: [],
		});
		const summaryCopy = getGuidanceCopy({
			agreement: "high",
			alternatives: alt,
			consensus: {
				meanRank: [1, 2],
				order: [0, 1],
				runnerUpGap: 1.2,
				runnerUpIndex: 1,
				winnerIndex: 0,
			},
			includedMethods: ["weightedSum", "pairwise"],
		});

		expect(methodCopy.summary).toContain("head-to-head");
		expect(emptyCopy.summary).toContain("No methods are included");
		expect(summaryCopy.summary).toContain("Alpha currently leads");
		expect(summaryCopy.comparison).toContain("Most included methods agree");
	});
});
