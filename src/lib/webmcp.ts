import type { SnapshotState } from "$lib/state";
import { compareEvent } from "$lib/events";
import {
	exportSnapshotState,
	importSnapshotState,
	type MethodKey,
} from "$lib/state";
import {
	normalizeAllocation,
	normalizeAllocationRow,
} from "$lib/util/allocate";
import {
	getAgreementLevel,
	getConsensusRank,
	getConsensusScore10,
	getMethodRanks,
	getMethodScores,
} from "$lib/util/analysis";
import { toJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

interface Annotation {
	readOnlyHint?: boolean;
	destructiveHint?: boolean;
	idempotentHint?: boolean;
}

/** A browser-native tool exposed by a WebMCP-compatible page. */
export interface SiteTool {
	name: string;
	description: string;
	inputSchema: ReturnType<typeof toJsonSchema>;
	annotations?: Annotation;
	execute: (input: unknown) => unknown | Promise<unknown>;
}

/** The experimental WebMCP context supplied by a compatible browser. */
export interface ModelContext {
	registerTool: (tool: SiteTool) => void | Promise<void>;
	unregisterTool?: (name: string) => void | Promise<void>;
}

type Navigate = (href: string) => void | Promise<void>;

interface Change {
	before: SnapshotState;
	after: SnapshotState;
	label: string;
}

const methods: MethodKey[] = ["weightedSum", "pairwise", "topsis", "allocate"];

const routes = {
	start: "/setup",
	alternatives: "/setup/alternatives",
	criteria: "/setup/criteria",
	weigh: "/weigh",
	score: "/score",
	compare: "/compare",
	allocate: "/allocate",
	summary: "/analysis",
	weightedSum: "/analysis/weight",
	pairwise: "/analysis/compare",
	allocation: "/analysis/allocate",
	topsis: "/analysis/topsis",
	robustness: "/analysis/robustness",
};

type Section = keyof typeof routes;

const routeKeys: [Section, ...Section[]] = [
	"start",
	"alternatives",
	"criteria",
	"weigh",
	"score",
	"compare",
	"allocate",
	"summary",
	"weightedSum",
	"pairwise",
	"allocation",
	"topsis",
	"robustness",
];

const history: Change[] = [];
const maxHistory = 20;
const text = v.pipe(v.string(), v.maxLength(4_000));
const name = v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(200));
const score = v.pipe(v.number(), v.minValue(0), v.maxValue(10));
const point = v.pipe(v.number(), v.minValue(0), v.maxValue(100));
const fraction = v.pipe(v.number(), v.minValue(0), v.maxValue(1));
const method = v.picklist(methods);

const decisionSchema = v.strictObject({ title: text, goal: text, notes: text });

const criterionSchema = v.strictObject({ name, weight: fraction });

const alternativeSchema = v.strictObject({
	name,
	scores: v.array(score),
	pairwise: v.array(fraction),
});

const appMetaSchema = v.strictObject({ used: v.boolean() });
const methodMetaSchema = v.strictObject({
	used: v.boolean(),
	included: v.boolean(),
});

const stateSchema = v.strictObject({
	decision: decisionSchema,
	criteria: v.array(criterionSchema),
	alternatives: v.array(alternativeSchema),
	allocation: v.array(v.array(point)),
	appMeta: v.strictObject({
		weigh: appMetaSchema,
		score: appMetaSchema,
		compare: appMetaSchema,
		allocate: appMetaSchema,
	}),
	methodMeta: v.strictObject({
		weightedSum: methodMetaSchema,
		pairwise: methodMetaSchema,
		topsis: methodMetaSchema,
		allocate: methodMetaSchema,
	}),
	setupStepMeta: v.strictObject({
		start: appMetaSchema,
		alternatives: appMetaSchema,
		criteria: appMetaSchema,
	}),
});

const populateSchema = v.strictObject({
	title: name,
	goal: v.optional(text, ""),
	notes: v.optional(text, ""),
	alternatives: v.pipe(v.array(name), v.minLength(1), v.maxLength(50)),
	criteria: v.pipe(
		v.array(v.strictObject({ name, weightPercent: v.optional(point) })),
		v.minLength(1),
		v.maxLength(50),
	),
});

const updateSchema = v.strictObject({
	decision: v.optional(
		v.strictObject({
			title: v.optional(text),
			goal: v.optional(text),
			notes: v.optional(text),
		}),
	),
	alternatives: v.optional(v.pipe(v.array(name), v.maxLength(50))),
	criteria: v.optional(
		v.pipe(
			v.array(v.strictObject({ name, weightPercent: v.optional(point) })),
			v.maxLength(50),
		),
	),
	weights: v.optional(
		v.array(v.strictObject({ criterion: name, weightPercent: point })),
	),
	scores: v.optional(
		v.array(v.strictObject({ alternative: name, criterion: name, score })),
	),
	comparisons: v.optional(
		v.array(
			v.strictObject({
				first: name,
				second: name,
				preferred: v.picklist(["first", "second", "tie"]),
			}),
		),
	),
	allocations: v.optional(
		v.array(
			v.strictObject({
				criterion: name,
				points: v.array(v.strictObject({ alternative: name, points: point })),
			}),
		),
	),
	includedMethods: v.optional(v.array(method)),
});

const replaceSchema = v.strictObject({ state: stateSchema });
const navigateSchema = v.strictObject({ section: v.picklist(routeKeys) });
const emptySchema = v.strictObject({});

type Populate = v.InferOutput<typeof populateSchema>;
type Update = v.InferOutput<typeof updateSchema>;

const key = (value: string) => {
	return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
};

const assertUnique = (values: string[], label: string) => {
	const seen = new Set<string>();
	for (const value of values) {
		const current = key(value);
		if (seen.has(current)) {
			throw new RangeError(`${label} contains a duplicate: ${value}.`);
		}
		seen.add(current);
	}
};

const find = (
	values: Array<{ name: string }>,
	value: string,
	label: string,
) => {
	const i = values.findIndex((item) => key(item.name) === key(value));
	if (i === -1) {
		throw new RangeError(`${label} was not found: ${value}.`);
	}
	return i;
};

const normalizeWeights = (state: SnapshotState) => {
	if (state.criteria.length === 0) {
		return;
	}
	const total = state.criteria.reduce((sum, item) => {
		return sum + Math.max(0, Number.isFinite(item.weight) ? item.weight : 0);
	}, 0);
	if (total <= 0) {
		const weight = 1 / state.criteria.length;
		for (const item of state.criteria) {
			item.weight = weight;
		}
		return;
	}
	for (const item of state.criteria) {
		item.weight = Math.max(
			0,
			Number.isFinite(item.weight) ? item.weight / total : 0,
		);
	}
};

const rebase = (state: SnapshotState, input: Update) => {
	if (input.criteria == null && input.alternatives == null) {
		return;
	}

	const previousCriteria = state.criteria;
	const previousAlternatives = state.alternatives;
	const previousAllocation = state.allocation;
	const nextCriteria =
		input.criteria?.map((item) => {
			const i = previousCriteria.findIndex(
				(current) => key(current.name) === key(item.name),
			);
			return {
				name: item.name,
				weight:
					item.weightPercent == null
						? (previousCriteria[i]?.weight ?? 0)
						: item.weightPercent / 100,
			};
		}) ?? previousCriteria.map((item) => ({ ...item }));
	const nextNames =
		input.alternatives ?? previousAlternatives.map((item) => item.name);

	assertUnique(
		nextCriteria.map((item) => item.name),
		"Criteria",
	);
	assertUnique(nextNames, "Alternatives");

	state.criteria = nextCriteria;
	state.alternatives = nextNames.map((currentName, i) => {
		const oldAlternative = previousAlternatives.findIndex(
			(item) => key(item.name) === key(currentName),
		);
		return {
			name: currentName,
			scores: nextCriteria.map((criterion) => {
				const oldCriterion = previousCriteria.findIndex(
					(item) => key(item.name) === key(criterion.name),
				);
				return previousAlternatives[oldAlternative]?.scores[oldCriterion] ?? 0;
			}),
			pairwise: nextNames.map((otherName, j) => {
				if (i === j) {
					return 0.5;
				}
				const other = previousAlternatives.findIndex(
					(item) => key(item.name) === key(otherName),
				);
				return previousAlternatives[oldAlternative]?.pairwise[other] ?? 0.5;
			}),
		};
	});
	state.allocation = nextCriteria.map((criterion) => {
		const oldCriterion = previousCriteria.findIndex(
			(item) => key(item.name) === key(criterion.name),
		);
		return normalizeAllocationRow(
			nextNames.map((currentName) => {
				const oldAlternative = previousAlternatives.findIndex(
					(item) => key(item.name) === key(currentName),
				);
				return previousAllocation[oldCriterion]?.[oldAlternative] ?? 0;
			}),
			nextNames.length,
		);
	});
	normalizeWeights(state);
};

const update = (state: SnapshotState, input: Update) => {
	if (input.decision != null) {
		state.decision = { ...state.decision, ...input.decision };
		state.setupStepMeta.start.used = true;
	}

	rebase(state, input);
	if (input.alternatives != null) {
		state.setupStepMeta.alternatives.used = true;
	}
	if (input.criteria != null) {
		state.setupStepMeta.criteria.used = true;
		if (input.criteria.some((item) => item.weightPercent != null)) {
			state.appMeta.weigh.used = true;
		}
	}

	if (input.weights != null) {
		assertUnique(
			input.weights.map((item) => item.criterion),
			"Weights",
		);
		for (const item of input.weights) {
			state.criteria[find(state.criteria, item.criterion, "Criterion")].weight =
				item.weightPercent / 100;
		}
		normalizeWeights(state);
		state.appMeta.weigh.used = true;
	}

	if (input.scores != null) {
		assertUnique(
			input.scores.map(
				(item) => `${key(item.alternative)}\u0000${key(item.criterion)}`,
			),
			"Scores",
		);
		for (const item of input.scores) {
			const alternative = find(
				state.alternatives,
				item.alternative,
				"Alternative",
			);
			const criterion = find(state.criteria, item.criterion, "Criterion");
			state.alternatives[alternative].scores[criterion] = item.score;
		}
		state.appMeta.score.used = true;
		state.methodMeta.weightedSum = { used: true, included: true };
	}

	if (input.comparisons != null) {
		for (const item of input.comparisons) {
			const first = find(state.alternatives, item.first, "Alternative");
			const second = find(state.alternatives, item.second, "Alternative");
			if (first === second) {
				throw new RangeError("A pairwise comparison needs two alternatives.");
			}
			const value =
				item.preferred === "tie" ? 0.5 : item.preferred === "first" ? 1 : 0;
			state.alternatives[first].pairwise[second] = value;
			state.alternatives[second].pairwise[first] =
				value === 1 ? 0 : value === 0 ? 1 : 0.5;
		}
		state.appMeta.compare.used = true;
		state.methodMeta.pairwise = { used: true, included: true };
	}

	if (input.allocations != null) {
		assertUnique(
			input.allocations.map((item) => item.criterion),
			"Allocations",
		);
		for (const item of input.allocations) {
			const criterion = find(state.criteria, item.criterion, "Criterion");
			assertUnique(
				item.points.map((current) => current.alternative),
				`Allocation for ${item.criterion}`,
			);
			if (item.points.length !== state.alternatives.length) {
				throw new RangeError(
					`Allocation for ${item.criterion} must include every alternative.`,
				);
			}
			const points = Array.from({ length: state.alternatives.length }, () => 0);
			for (const current of item.points) {
				points[find(state.alternatives, current.alternative, "Alternative")] =
					current.points;
			}
			state.allocation[criterion] = normalizeAllocationRow(
				points,
				state.alternatives.length,
			);
		}
		state.appMeta.allocate.used = true;
		state.methodMeta.allocate = { used: true, included: true };
	}

	if (input.includedMethods != null) {
		assertUnique(input.includedMethods, "Included methods");
		for (const current of methods) {
			const included = input.includedMethods.includes(current);
			state.methodMeta[current].included = included;
			if (included) {
				state.methodMeta[current].used = true;
			}
		}
	}

	return state;
};

const blank = (): SnapshotState => {
	return {
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
		methodMeta: {
			weightedSum: { used: false, included: false },
			pairwise: { used: false, included: false },
			topsis: { used: false, included: false },
			allocate: { used: false, included: false },
		},
		setupStepMeta: {
			start: { used: false },
			alternatives: { used: false },
			criteria: { used: false },
		},
	};
};

const populate = (input: Populate) => {
	assertUnique(input.alternatives, "Alternatives");
	assertUnique(
		input.criteria.map((item) => item.name),
		"Criteria",
	);
	const hasWeights = input.criteria.some((item) => item.weightPercent != null);
	if (hasWeights && input.criteria.some((item) => item.weightPercent == null)) {
		throw new RangeError(
			"Provide a weight for every criterion, or omit every weight.",
		);
	}
	const state = blank();
	state.decision = { title: input.title, goal: input.goal, notes: input.notes };
	state.criteria = input.criteria.map((item) => ({
		name: item.name,
		weight: item.weightPercent == null ? 0 : item.weightPercent / 100,
	}));
	state.alternatives = input.alternatives.map((current) => ({
		name: current,
		scores: Array.from({ length: state.criteria.length }, () => 0),
		pairwise: Array.from({ length: input.alternatives.length }, () => 0.5),
	}));
	state.allocation = normalizeAllocation(
		undefined,
		state.criteria.length,
		state.alternatives.length,
	);
	state.appMeta.weigh.used = hasWeights;
	state.setupStepMeta = {
		start: { used: true },
		alternatives: { used: true },
		criteria: { used: true },
	};
	normalizeWeights(state);
	return state;
};

const analysis = (state: SnapshotState) => {
	const included = methods.filter(
		(current) => state.methodMeta[current].included,
	);
	const scores = getMethodScores(
		state.alternatives,
		state.criteria,
		state.allocation,
	);
	const ranks = getMethodRanks(scores.normalized10);
	const consensusScores = getConsensusScore10(scores.normalized10, included);
	const consensus = getConsensusRank(ranks, included, consensusScores);
	const warnings: string[] = [];
	if (state.alternatives.length < 2) {
		warnings.push("Add at least two alternatives before comparing results.");
	}
	if (state.criteria.length === 0) {
		warnings.push("Add at least one criterion before analyzing the decision.");
	}
	if (included.length === 0) {
		warnings.push("Include at least one method to create a summary ranking.");
	}

	return {
		ready:
			state.alternatives.length >= 2 &&
			state.criteria.length > 0 &&
			included.length > 0,
		includedMethods: included,
		methods: {
			weightedSum: state.alternatives.map((item, i) => ({
				alternative: item.name,
				score: scores.normalized10.weightedSum[i] ?? 0,
				rank: ranks.weightedSum[i] ?? 0,
			})),
			pairwise: state.alternatives.map((item, i) => ({
				alternative: item.name,
				score: scores.normalized10.pairwise[i] ?? 0,
				rank: ranks.pairwise[i] ?? 0,
			})),
			topsis: state.alternatives.map((item, i) => ({
				alternative: item.name,
				score: scores.normalized10.topsis[i] ?? 0,
				rank: ranks.topsis[i] ?? 0,
			})),
			allocate: state.alternatives.map((item, i) => ({
				alternative: item.name,
				score: scores.normalized10.allocate[i] ?? 0,
				rank: ranks.allocate[i] ?? 0,
			})),
		},
		consensus: {
			winner:
				consensus.winnerIndex == null
					? null
					: (state.alternatives[consensus.winnerIndex]?.name ?? null),
			runnerUp:
				consensus.runnerUpIndex == null
					? null
					: (state.alternatives[consensus.runnerUpIndex]?.name ?? null),
			runnerUpGap: consensus.runnerUpGap,
			agreement: getAgreementLevel(consensus, ranks, included),
			order: consensus.order.map(
				(i) => state.alternatives[i]?.name ?? `Alternative ${i + 1}`,
			),
			scores: state.alternatives.map((item, i) => ({
				alternative: item.name,
				score: consensusScores[i] ?? 0,
				meanRank: consensus.meanRank[i] ?? 0,
			})),
		},
		warnings,
	};
};

const read = () => {
	const state = exportSnapshotState();
	return {
		state,
		analysis: analysis(state),
		view:
			typeof window === "undefined"
				? null
				: (window.location?.pathname ?? null),
		undo: {
			available: history.length > 0,
			lastChange: history.at(-1)?.label ?? null,
		},
	};
};

const write = (label: string, state: SnapshotState) => {
	const before = exportSnapshotState();
	if (JSON.stringify(before) === JSON.stringify(state)) {
		return { changed: false, ...read() };
	}
	importSnapshotState(state);
	const after = exportSnapshotState();
	history.push({ before, after, label });
	if (history.length > maxHistory) {
		history.shift();
	}
	return { changed: true, ...read() };
};

const undo = () => {
	const change = history.at(-1);
	if (change == null) {
		return { undone: false, reason: "There is no agent change to undo." };
	}
	if (JSON.stringify(exportSnapshotState()) !== JSON.stringify(change.after)) {
		return {
			undone: false,
			reason:
				"Plought changed after the agent action, so undo was not applied to avoid overwriting newer edits.",
		};
	}
	importSnapshotState(change.before);
	history.pop();
	return { undone: true, label: change.label, ...read() };
};

/** Build the WebMCP tools that can inspect and operate the current decision. */
export const createPloughtTools = (navigate: Navigate): SiteTool[] => {
	return [
		{
			name: "read_plought",
			description:
				"Read the complete current Plought decision, UI state, method results, consensus, warnings, current view, and undo status. Use before editing an existing decision.",
			inputSchema: toJsonSchema(emptySchema, { errorMode: "ignore" }),
			annotations: { readOnlyHint: true, idempotentHint: true },
			execute(input) {
				v.parse(emptySchema, input);
				return read();
			},
		},
		{
			name: "populate_plought",
			description:
				"Replace Plought with a new decision draft from a title, goal, notes, alternatives, and criteria. This clears prior judgments. Criteria weights are percentages; provide all weights or omit all for equal weights. Changes apply immediately and can be undone.",
			inputSchema: toJsonSchema(populateSchema, { errorMode: "ignore" }),
			annotations: { destructiveHint: true, idempotentHint: true },
			execute(input) {
				return write(
					"Populated a new decision",
					populate(v.parse(populateSchema, input)),
				);
			},
		},
		{
			name: "update_plought",
			description:
				"Update any part of the current Plought decision immediately. Structural alternative or criterion lists replace those lists while preserving matching judgments by name. Scores are 0-10, weights and allocation points are 0-100, and allocations must include every alternative. Omitted fields are preserved. The complete operation is atomic and can be undone.",
			inputSchema: toJsonSchema(updateSchema, { errorMode: "ignore" }),
			annotations: { destructiveHint: false, idempotentHint: true },
			execute(input) {
				const parsed = v.parse(updateSchema, input);
				const result = write(
					"Updated the current decision",
					update(exportSnapshotState(), parsed),
				);
				if (parsed.comparisons != null && typeof window !== "undefined") {
					const state = exportSnapshotState();
					window.dispatchEvent(
						new CustomEvent(compareEvent, {
							detail: parsed.comparisons.map((item) => {
								const first = find(
									state.alternatives,
									item.first,
									"Alternative",
								);
								const second = find(
									state.alternatives,
									item.second,
									"Alternative",
								);
								return first < second
									? `${first}:${second}`
									: `${second}:${first}`;
							}),
						}),
					);
				}
				return result;
			},
		},
		{
			name: "replace_plought",
			description:
				"Replace the complete raw Plought state, including decision data, matrices, method settings, and progress metadata. Read Plought first, preserve array index relationships, and use update_plought when a targeted edit is sufficient. Changes apply immediately and can be undone.",
			inputSchema: toJsonSchema(replaceSchema, { errorMode: "ignore" }),
			annotations: { destructiveHint: true, idempotentHint: true },
			execute(input) {
				return write(
					"Replaced the complete decision state",
					v.parse(replaceSchema, input).state,
				);
			},
		},
		{
			name: "reset_plought",
			description:
				"Start over by deleting the complete current Plought decision, judgments, method settings, and progress metadata. This applies immediately and can be undone during the current page session.",
			inputSchema: toJsonSchema(emptySchema, { errorMode: "ignore" }),
			annotations: { destructiveHint: true, idempotentHint: true },
			execute(input) {
				v.parse(emptySchema, input);
				return write("Started over with an empty decision", blank());
			},
		},
		{
			name: "undo_plought",
			description:
				"Undo the most recent WebMCP write when Plought has not been changed since that action. Refuses to overwrite newer human or agent edits.",
			inputSchema: toJsonSchema(emptySchema, { errorMode: "ignore" }),
			annotations: { destructiveHint: false, idempotentHint: false },
			execute(input) {
				v.parse(emptySchema, input);
				return undo();
			},
		},
		{
			name: "navigate_plought",
			description:
				"Open a Plought setup, judgment, or analysis section so the user can inspect the relevant inputs or results.",
			inputSchema: toJsonSchema(navigateSchema, { errorMode: "ignore" }),
			annotations: { destructiveHint: false, idempotentHint: true },
			async execute(input) {
				const { section } = v.parse(navigateSchema, input);
				await navigate(routes[section]);
				return { section, path: routes[section] };
			},
		},
	];
};

/** Register Plought's tools and return a cleanup callback for page teardown. */
export const registerPloughtTools = (
	context: ModelContext,
	navigate: Navigate,
) => {
	const tools = createPloughtTools(navigate);
	for (const tool of tools) {
		void context.registerTool(tool);
	}
	return () => {
		if (context.unregisterTool == null) {
			return;
		}
		for (const tool of tools) {
			void context.unregisterTool(tool.name);
		}
	};
};
