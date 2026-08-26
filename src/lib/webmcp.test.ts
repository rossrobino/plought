import type { SiteTool } from "$lib/webmcp";
import { compareEvent } from "$lib/events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class MemoryStorage implements Storage {
	#map = new Map<string, string>();

	get length() {
		return this.#map.size;
	}

	clear() {
		this.#map.clear();
	}

	getItem(key: string) {
		return this.#map.get(key) ?? null;
	}

	key(i: number) {
		return [...this.#map.keys()][i] ?? null;
	}

	removeItem(key: string) {
		this.#map.delete(key);
	}

	setItem(key: string, value: string) {
		this.#map.set(key, String(value));
	}
}

const setWindow = () => {
	const storage = new MemoryStorage();
	Object.defineProperty(globalThis, "window", {
		configurable: true,
		value: Object.assign(new EventTarget(), {
			localStorage: storage,
			sessionStorage: storage,
			location: { pathname: "/setup" },
		}),
	});
};

let state: typeof import("$lib/state");
let webmcp: typeof import("$lib/webmcp");
let tools: SiteTool[];
let navigate: (href: string) => void;

const getTool = (name: string) => {
	const tool = tools.find((item) => item.name === name);
	if (tool == null) {
		throw new Error(`Missing tool: ${name}`);
	}
	return tool;
};

const populate = () => {
	return getTool("populate_plought").execute({
		title: "Choose a city",
		goal: "Find the best place to live.",
		notes: "Stay within budget.",
		alternatives: ["Ann Arbor", "Royal Oak"],
		criteria: [
			{ name: "Cost", weightPercent: 60 },
			{ name: "Walkability", weightPercent: 40 },
		],
	});
};

describe("WebMCP", () => {
	beforeEach(async () => {
		setWindow();
		vi.resetModules();
		state = await import("$lib/state");
		webmcp = await import("$lib/webmcp");
		state.reset();
		navigate = vi.fn<(href: string) => void>();
		tools = webmcp.createPloughtTools(navigate);
	});

	afterEach(() => {
		Reflect.deleteProperty(globalThis, "window");
	});

	it("registers and unregisters the complete site tool set", () => {
		const registered: string[] = [];
		const unregistered: string[] = [];
		const cleanup = webmcp.registerPloughtTools(
			{
				registerTool(tool) {
					registered.push(tool.name);
				},
				unregisterTool(name) {
					unregistered.push(name);
				},
			},
			navigate,
		);

		expect(registered).toEqual([
			"read_plought",
			"populate_plought",
			"update_plought",
			"replace_plought",
			"reset_plought",
			"undo_plought",
			"navigate_plought",
		]);
		cleanup();
		expect(unregistered).toEqual(registered);
	});

	it("publishes plain JSON Schemas that describe tool arguments", () => {
		expect(getTool("read_plought").inputSchema).toMatchObject({
			type: "object",
			additionalProperties: false,
		});
		expect(getTool("populate_plought").inputSchema).toMatchObject({
			type: "object",
			required: ["title", "alternatives", "criteria"],
			properties: {
				title: { type: "string" },
				alternatives: { type: "array" },
				criteria: { type: "array" },
			},
		});
	});

	it("populates a complete decision directly", async () => {
		await populate();

		expect(state.decision.current).toEqual({
			title: "Choose a city",
			goal: "Find the best place to live.",
			notes: "Stay within budget.",
		});
		expect(state.criteria.current).toEqual([
			{ name: "Cost", weight: 0.6 },
			{ name: "Walkability", weight: 0.4 },
		]);
		expect(state.alternatives.current).toEqual([
			{ name: "Ann Arbor", scores: [0, 0], pairwise: [0.5, 0.5] },
			{ name: "Royal Oak", scores: [0, 0], pairwise: [0.5, 0.5] },
		]);
		expect(state.allocation.current).toEqual([
			[50, 50],
			[50, 50],
		]);
		expect(state.isSetupStepUsed("start")).toBe(true);
		expect(state.isSetupStepUsed("alternatives")).toBe(true);
		expect(state.isSetupStepUsed("criteria")).toBe(true);
		expect(state.isAppUsed("weigh")).toBe(true);
	});

	it("marks weighing only when the agent supplies weights", async () => {
		await getTool("populate_plought").execute({
			title: "Choose a city",
			alternatives: ["Ann Arbor", "Royal Oak"],
			criteria: [{ name: "Cost" }, { name: "Walkability" }],
		});
		expect(state.isAppUsed("weigh")).toBe(false);

		await getTool("update_plought").execute({
			criteria: [
				{ name: "Cost", weightPercent: 60 },
				{ name: "Walkability", weightPercent: 40 },
			],
		});
		expect(state.isAppUsed("weigh")).toBe(true);
	});

	it("reads the complete state and current analysis", async () => {
		await populate();
		await getTool("update_plought").execute({
			scores: [{ alternative: "Ann Arbor", criterion: "Cost", score: 8 }],
			includedMethods: ["weightedSum"],
		});

		expect(await getTool("read_plought").execute({})).toMatchObject({
			state: {
				decision: { title: "Choose a city" },
				criteria: [{ name: "Cost" }, { name: "Walkability" }],
			},
			analysis: { ready: true, includedMethods: ["weightedSum"] },
			view: "/setup",
			undo: { available: true },
		});
	});

	it("updates judgments, methods, and decision details atomically", async () => {
		await populate();
		const compared: string[][] = [];
		window.addEventListener(compareEvent, (event) => {
			if (event instanceof CustomEvent && Array.isArray(event.detail)) {
				compared.push(event.detail);
			}
		});
		await getTool("update_plought").execute({
			decision: { notes: "Prefer a lively downtown." },
			weights: [
				{ criterion: "Cost", weightPercent: 30 },
				{ criterion: "Walkability", weightPercent: 70 },
			],
			scores: [
				{ alternative: "Ann Arbor", criterion: "Cost", score: 6 },
				{ alternative: "Royal Oak", criterion: "Cost", score: 8 },
				{ alternative: "Ann Arbor", criterion: "Walkability", score: 9 },
			],
			comparisons: [
				{ first: "Ann Arbor", second: "Royal Oak", preferred: "first" },
			],
			allocations: [
				{
					criterion: "Cost",
					points: [
						{ alternative: "Ann Arbor", points: 40 },
						{ alternative: "Royal Oak", points: 60 },
					],
				},
			],
			includedMethods: ["weightedSum", "pairwise", "topsis", "allocate"],
		});

		expect(state.decision.current.notes).toBe("Prefer a lively downtown.");
		expect(state.criteria.current.map((item) => item.weight)).toEqual([
			0.3, 0.7,
		]);
		expect(state.alternatives.current[0].scores).toEqual([6, 9]);
		expect(state.alternatives.current[1].scores).toEqual([8, 0]);
		expect(state.alternatives.current[0].pairwise[1]).toBe(1);
		expect(state.alternatives.current[1].pairwise[0]).toBe(0);
		expect(compared).toEqual([["0:1"]]);
		expect(state.allocation.current[0]).toEqual([40, 60]);
		expect(state.isAppUsed("weigh")).toBe(true);
		expect(state.isAppUsed("score")).toBe(true);
		expect(state.isAppUsed("compare")).toBe(true);
		expect(state.isAppUsed("allocate")).toBe(true);
		expect(state.isMethodIncluded("topsis")).toBe(true);
	});

	it("preserves matching judgments when structure changes", async () => {
		await populate();
		await getTool("update_plought").execute({
			scores: [
				{ alternative: "Royal Oak", criterion: "Walkability", score: 8 },
			],
		});
		await getTool("update_plought").execute({
			alternatives: ["Royal Oak", "Ferndale", "Ann Arbor"],
			criteria: [
				{ name: "Walkability" },
				{ name: "Cost" },
				{ name: "Schools" },
			],
		});

		expect(state.alternatives.current.map((item) => item.name)).toEqual([
			"Royal Oak",
			"Ferndale",
			"Ann Arbor",
		]);
		expect(state.criteria.current.map((item) => item.name)).toEqual([
			"Walkability",
			"Cost",
			"Schools",
		]);
		expect(state.alternatives.current[0].scores).toEqual([8, 0, 0]);
		expect(state.alternatives.current[1].scores).toEqual([0, 0, 0]);
	});

	it("leaves state unchanged when an update is invalid", async () => {
		await populate();
		const before = state.exportSnapshotState();

		expect(() =>
			getTool("update_plought").execute({
				scores: [{ alternative: "Detroit", criterion: "Cost", score: 10 }],
			}),
		).toThrowError(/Alternative was not found: Detroit/);
		expect(state.exportSnapshotState()).toEqual(before);
	});

	it("undoes agent writes but refuses to overwrite newer human edits", async () => {
		await populate();
		await getTool("update_plought").execute({
			scores: [{ alternative: "Ann Arbor", criterion: "Cost", score: 8 }],
		});
		await getTool("undo_plought").execute({});
		expect(state.alternatives.current[0].scores[0]).toBe(0);

		await getTool("update_plought").execute({
			scores: [{ alternative: "Ann Arbor", criterion: "Cost", score: 7 }],
		});
		state.decision.current.title = "Edited by the user";
		await getTool("undo_plought").execute({});
		expect(state.decision.current.title).toBe("Edited by the user");
		expect(state.alternatives.current[0].scores[0]).toBe(7);
	});

	it("replaces the complete raw state", async () => {
		await populate();
		const next = state.exportSnapshotState();
		next.decision.title = "Replaced decision";
		next.alternatives[0].scores[0] = 9;
		next.methodMeta.weightedSum = { used: true, included: true };

		await getTool("replace_plought").execute({ state: next });

		expect(state.exportSnapshotState()).toEqual(next);
	});

	it("starts over with an empty decision and can undo it", async () => {
		await populate();
		await getTool("update_plought").execute({
			scores: [{ alternative: "Ann Arbor", criterion: "Cost", score: 8 }],
		});
		const before = state.exportSnapshotState();

		await getTool("reset_plought").execute({});
		expect(state.exportSnapshotState()).toMatchObject({
			decision: { title: "", goal: "", notes: "" },
			criteria: [],
			alternatives: [],
			allocation: [],
			appMeta: {
				weigh: { used: false },
				score: { used: false },
				compare: { used: false },
				allocate: { used: false },
			},
		});

		await getTool("undo_plought").execute({});
		expect(state.exportSnapshotState()).toEqual(before);
	});

	it("navigates to a named Plought section", async () => {
		await getTool("navigate_plought").execute({ section: "summary" });
		expect(navigate).toHaveBeenCalledWith("/analysis");
	});
});
