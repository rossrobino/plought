import type { SnapshotState } from "$lib/state";
import {
	createSnapshotFile,
	parseSnapshotJson,
	sanitizeSnapshotFilename,
	serializeSnapshot,
	snapshotSchemaVersion,
} from "$lib/util/snapshot";
import { describe, expect, it } from "vitest";

const snapshotState: SnapshotState = {
	decision: { title: "Title", goal: "Goal", notes: "" },
	criteria: [{ name: "Cost", weight: 0.5 }],
	alternatives: [
		{ name: "A", scores: [5], pairwise: [0.5, 1] },
		{ name: "B", scores: [7], pairwise: [0, 0.5] },
	],
	allocation: [[50, 50]],
	appMeta: {
		weigh: { used: true },
		score: { used: false },
		compare: { used: true },
		allocate: { used: false },
	},
	methodMeta: {
		weightedSum: { used: true, included: true },
		pairwise: { used: true, included: true },
		topsis: { used: false, included: false },
		allocate: { used: false, included: false },
	},
	setupStepMeta: {
		start: { used: true },
		alternatives: { used: true },
		criteria: { used: true },
	},
};

describe("snapshot util", () => {
	it("serializes snapshot with schemaVersion and exportedAt", () => {
		const file = createSnapshotFile(snapshotState);
		const value = JSON.parse(serializeSnapshot(file)) as {
			schemaVersion: number;
			exportedAt: string;
		};

		expect(value.schemaVersion).toBe(snapshotSchemaVersion);
		expect(typeof value.exportedAt).toBe("string");
	});

	it("parses valid v1 snapshot files", () => {
		const text = JSON.stringify({
			schemaVersion: 1,
			exportedAt: "2026-03-04T00:00:00.000Z",
			state: {
				...snapshotState,
				rankOrder: [0, 1],
				appMeta: { ...snapshotState.appMeta, rank: { used: false } },
				methodMeta: {
					...snapshotState.methodMeta,
					rankOrder: { used: false, included: false },
				},
			},
		});

		expect(parseSnapshotJson(text)).toEqual(snapshotState);
	});

	it("parses current v2 snapshot files", () => {
		const text = JSON.stringify({
			schemaVersion: 2,
			exportedAt: "2026-03-04T00:00:00.000Z",
			state: snapshotState,
		});

		expect(parseSnapshotJson(text)).toEqual(snapshotState);
	});

	it("parses legacy snapshots without envelope", () => {
		expect(
			parseSnapshotJson(
				JSON.stringify({
					...snapshotState,
					rankOrder: [0, 1],
					appMeta: { ...snapshotState.appMeta, rank: { used: false } },
					methodMeta: {
						...snapshotState.methodMeta,
						rankOrder: { used: false, included: false },
					},
				}),
			),
		).toEqual(snapshotState);
	});

	it("rejects invalid JSON", () => {
		expect(() => parseSnapshotJson("{")).toThrowError(
			/Could not read JSON file\./,
		);
	});

	it("rejects unsupported newer schema", () => {
		const text = JSON.stringify({ schemaVersion: 99, state: snapshotState });
		expect(() => parseSnapshotJson(text)).toThrowError(
			/Snapshot format is not supported\./,
		);
	});

	it("rejects unsupported schema version values", () => {
		const text = JSON.stringify({ schemaVersion: 0, state: snapshotState });
		expect(() => parseSnapshotJson(text)).toThrowError(
			/Snapshot format is not supported\./,
		);
	});

	it("rejects invalid known key types", () => {
		const text = JSON.stringify({
			schemaVersion: 1,
			state: { ...snapshotState, criteria: {} },
		});
		expect(() => parseSnapshotJson(text)).toThrowError(
			/Snapshot format is not supported\./,
		);
	});

	it("rejects invalid legacy rank key types", () => {
		const text = JSON.stringify({
			schemaVersion: 1,
			state: { ...snapshotState, rankOrder: {} },
		});

		expect(() => parseSnapshotJson(text)).toThrowError(
			/Snapshot format is not supported\./,
		);
	});

	it("sanitizes filenames with .plought.json extension", () => {
		expect(sanitizeSnapshotFilename("  My Great: Decision!!! ")).toBe(
			"my-great-decision.plought.json",
		);
		expect(sanitizeSnapshotFilename(" ")).toBe("decision.plought.json");
	});
});
