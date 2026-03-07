import { OPENAI_API_KEY } from "$env/static/private";
import { renderMarkdown } from "$lib/ai/markdown.server";
import {
	decisionDefaults,
	isAlternativePlaceholder,
	isCriteriaPlaceholder,
} from "$lib/state";
import type {
	AllocatePoint,
	AllocateResearchRequest,
	AlternativeSuggestionRequest,
	CriteriaSuggestionRequest,
	ResearchSource,
	ScoreResearchRequest,
	SuggestionItem,
	SuggestionResult,
} from "./types";
import { error } from "@sveltejs/kit";
import { toJsonSchema } from "@valibot/to-json-schema";
import { OpenAI } from "openai";
import * as v from "valibot";

type Kind = "alternatives" | "criteria";
type Request = AlternativeSuggestionRequest | CriteriaSuggestionRequest;
type Api = Pick<OpenAI, "responses">;

interface Clean {
	title: string;
	goal: string;
	context: string;
	existingAlternatives: string[];
	existingCriteria: string[];
}

interface CleanScore extends Clean {
	alternative: string;
	criterion: string;
}

interface CleanAllocate extends Clean {
	criterion: string;
}

export class AI {
	#client: Api;

	#text = v.pipe(v.string(), v.maxLength(4_000));

	#name = v.pipe(v.string(), v.maxLength(200));

	#reason = v.pipe(v.string(), v.maxLength(600));

	#source = v.strictObject({
		title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(300)),
		url: v.pipe(v.string(), v.nonEmpty(), v.maxLength(4_000)),
	});

	#confidence = v.picklist(["low", "medium", "high"]);

	#suggestion = v.strictObject({ name: this.#name, reason: this.#text });

	readonly suggestionResultSchema = v.message(
		v.strictObject({ summary: this.#text, items: v.array(this.#suggestion) }),
		"AI returned an invalid suggestion response.",
	);

	#score = v.message(
		v.strictObject({
			summary: this.#text,
			suggestedScore: v.pipe(v.number(), v.minValue(0), v.maxValue(10)),
			reason: this.#reason,
			considerations: v.array(this.#text),
			confidence: this.#confidence,
		}),
		"AI returned an invalid score research response.",
	);

	#point = v.strictObject({
		alternative: this.#name,
		points: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
		reason: this.#reason,
	});

	#allocate = v.message(
		v.strictObject({
			summary: this.#text,
			suggestedPoints: v.array(this.#point),
			confidence: this.#confidence,
		}),
		"AI returned an invalid allocation research response.",
	);

	#suggestionsJson = this.#json(this.suggestionResultSchema);

	#scoreJson = (() => {
		const json = this.#json(this.#score);
		const score =
			json.properties != null &&
			typeof json.properties === "object" &&
			"suggestedScore" in json.properties
				? json.properties.suggestedScore
				: null;
		if (score != null && typeof score === "object") {
			Object.assign(score, { type: "integer", multipleOf: 1 });
		}
		return json;
	})();

	#allocateJson = this.#json(this.#allocate);

	readonly alternativeSchema = v.strictObject({
		title: this.#text,
		goal: this.#text,
		context: this.#text,
		existingAlternatives: v.array(this.#name),
		requestId: v.pipe(v.string(), v.nonEmpty(), v.maxLength(200)),
	});

	readonly criteriaSchema = v.strictObject({
		title: this.#text,
		goal: this.#text,
		context: this.#text,
		existingAlternatives: v.array(this.#name),
		existingCriteria: v.optional(v.array(this.#name), []),
		requestId: v.pipe(v.string(), v.nonEmpty(), v.maxLength(200)),
	});

	readonly scoreResearchSchema = v.strictObject({
		title: this.#text,
		goal: this.#text,
		context: this.#text,
		alternative: this.#name,
		criterion: this.#name,
		existingAlternatives: v.array(this.#name),
		existingCriteria: v.array(this.#name),
		requestId: v.pipe(v.string(), v.nonEmpty(), v.maxLength(200)),
	});

	readonly allocateResearchSchema = v.strictObject({
		title: this.#text,
		goal: this.#text,
		context: this.#text,
		criterion: this.#name,
		existingAlternatives: v.array(this.#name),
		existingCriteria: v.array(this.#name),
		requestId: v.pipe(v.string(), v.nonEmpty(), v.maxLength(200)),
	});

	readonly scoreResearchResultSchema = v.message(
		v.strictObject({
			summary: this.#text,
			suggestedScore: v.pipe(v.number(), v.minValue(0), v.maxValue(10)),
			reason: this.#reason,
			considerations: v.array(this.#text),
			confidence: this.#confidence,
			sources: v.array(this.#source),
		}),
		"AI returned an invalid score research response.",
	);

	readonly allocateResearchResultSchema = v.message(
		v.strictObject({
			summary: this.#text,
			suggestedPoints: v.array(this.#point),
			confidence: this.#confidence,
			sources: v.array(this.#source),
		}),
		"AI returned an invalid allocation research response.",
	);

	#max = 15;

	#suggestionSummary =
		"Suggestions based on the decision context you provided.";

	#suggestionReason = "Fits the context you provided for this decision.";

	#scoreSummary =
		"Recommended score based on the decision context you provided.";

	#allocateSummary =
		"Recommended allocation based on the decision context you provided.";

	#scoreReason = "Best current estimate based on the context you provided.";

	#pointReason =
		"No specific recommendation was returned for this alternative.";

	constructor(apiKey: string, client = new OpenAI({ apiKey })) {
		this.#client = client;
	}

	hasInput(input: Request, kind: Kind) {
		const clean = this.#clean(input, kind);
		return (
			clean.title.length > 0 ||
			clean.goal.length > 0 ||
			clean.context.length > 0 ||
			clean.existingAlternatives.length > 0 ||
			clean.existingCriteria.length > 0
		);
	}

	canScore(input: ScoreResearchRequest) {
		const clean = this.#cleanScore(input);
		return clean.alternative.length > 0 && clean.criterion.length > 0;
	}

	canAllocate(input: AllocateResearchRequest) {
		const clean = this.#cleanAllocate(input);
		return clean.criterion.length > 0 && clean.existingAlternatives.length > 1;
	}

	buildAlternativePrompt(input: AlternativeSuggestionRequest) {
		const clean = this.#clean(input, "alternatives");
		return [
			"You are helping someone build a decision list.",
			"Generate realistic alternatives they could compare next.",
			"Aim for 4 to 6 suggestions when possible.",
			"Keep each name short, specific, and distinct.",
			"Do not repeat existing alternatives or use placeholders.",
			"Give one short reason per suggestion tied to the decision context.",
			"Use web search only when current real-world facts would materially improve the suggestions.",
			"",
			this.#formatDecision(clean),
		].join("\n");
	}

	buildCriteriaPrompt(input: CriteriaSuggestionRequest) {
		const clean = this.#clean(input, "criteria");
		return [
			"You are helping someone define evaluation criteria for a decision.",
			"Generate practical criteria they can use to compare alternatives.",
			"Aim for 4 to 6 suggestions when possible.",
			"Keep each criterion title concise, usually 1 to 4 words.",
			"Prefer short noun phrases instead of full sentences.",
			"Keep each criterion specific and measurable where possible.",
			"Make each suggestion as independent as possible from the others.",
			"Avoid near-duplicates, narrower versions, or alternate phrasings of the same factor.",
			"Avoid overly broad labels, and combined criteria.",
			"Do not repeat existing criteria or use placeholders.",
			"Give one short reason per suggestion tied to the decision context.",
			"Use web search only when current real-world facts would materially improve the suggestions.",
			"",
			this.#formatDecision(clean),
			"",
			this.#formatSection("Existing criteria", clean.existingCriteria),
		].join("\n");
	}

	buildScoreResearchPrompt(input: ScoreResearchRequest) {
		const clean = this.#cleanScore(input);
		return [
			"You are helping someone score one alternative against one criterion in a decision matrix.",
			"Recommend a score from 0 to 10 where higher means a stronger fit for the criterion.",
			"Use whole numbers only.",
			"Do not use decimal scores like 2.0 or 7.5.",
			"Keep the summary concise and the reason practical.",
			"Add 2 to 4 short considerations only when they would materially help the decision.",
			"Return an empty considerations array when there are no extra considerations to add.",
			"Use web search when current real-world facts would materially improve the recommendation.",
			"Do not mention placeholders or missing data unless it changes the recommendation.",
			"",
			this.#formatDecision(clean),
			"",
			`Target alternative: ${clean.alternative}`,
			`Target criterion: ${clean.criterion}`,
			"",
			this.#formatSection("Existing criteria", clean.existingCriteria),
		].join("\n");
	}

	buildAllocateResearchPrompt(input: AllocateResearchRequest) {
		const clean = this.#cleanAllocate(input);
		return [
			"You are helping someone allocate 100 points across alternatives for one criterion.",
			"Recommend how the points should be distributed across the alternatives.",
			"Return one entry for every alternative in the decision.",
			"The suggested points do not need to total exactly 100 because the app will normalize them.",
			"Keep the summary concise and each reason short and specific.",
			"Use web search when current real-world facts would materially improve the recommendation.",
			"Do not invent alternatives or use placeholders.",
			"",
			this.#formatDecision(clean),
			"",
			`Target criterion: ${clean.criterion}`,
			"",
			this.#formatSection("Existing criteria", clean.existingCriteria),
		].join("\n");
	}

	parseResult(value: unknown) {
		return v.parse(this.suggestionResultSchema, value);
	}

	async createSuggestions(options: {
		existingNames: string[];
		input: string;
		instructions?: string;
	}) {
		const { value } = await this.#create({
			input: options.input,
			instructions:
				options.instructions ??
				"Return only JSON matching the provided schema. Keep the summary concise and the reasons practical.",
			json: this.#suggestionsJson,
			message: "suggestion",
			name: "suggestion_result",
			parse: (current) => this.parseResult(current),
		});

		return this.normalizeResult(value, options.existingNames);
	}

	async createScoreResearch(input: ScoreResearchRequest) {
		const { response, value } = await this.#create({
			input: this.buildScoreResearchPrompt(input),
			instructions:
				"Return only JSON matching the provided schema. Keep the summary concise, the reason practical, and the considerations short.",
			json: this.#scoreJson,
			message: "score research",
			name: "score_research_result",
			parse: (current) => v.parse(this.#score, current),
		});

		return v.parse(this.scoreResearchResultSchema, {
			summary: this.#markdown(value.summary, this.#scoreSummary),
			suggestedScore: Math.max(
				0,
				Math.min(10, Math.round(value.suggestedScore)),
			),
			reason: this.#markdown(value.reason, this.#scoreReason),
			considerations: this.#normalizeConsiderations(value.considerations).map(
				(current) => this.#markdown(current),
			),
			confidence: value.confidence,
			sources: this.#extractSources(response),
		});
	}

	async createAllocateResearch(input: AllocateResearchRequest) {
		const clean = this.#cleanAllocate(input);
		const { response, value } = await this.#create({
			input: this.buildAllocateResearchPrompt(input),
			instructions:
				"Return only JSON matching the provided schema. Keep the summary concise and each reason short and practical.",
			json: this.#allocateJson,
			message: "allocation research",
			name: "allocate_research_result",
			parse: (current) => v.parse(this.#allocate, current),
		});

		return v.parse(this.allocateResearchResultSchema, {
			summary: this.#markdown(value.summary, this.#allocateSummary),
			suggestedPoints: this.#normalizePoints(
				value.suggestedPoints,
				clean.existingAlternatives,
			),
			confidence: value.confidence,
			sources: this.#extractSources(response),
		});
	}

	normalizeResult(result: SuggestionResult, existingNames: string[]) {
		const seen = new Set(
			this.#dedupe(existingNames).map((value) => this.#key(value)),
		);
		const items: SuggestionItem[] = [];

		for (const item of result.items) {
			const name = this.#collapse(item.name);
			const key = this.#key(name);
			if (!name || seen.has(key)) {
				continue;
			}

			seen.add(key);
			items.push({
				name,
				reason: this.#markdown(item.reason, this.#suggestionReason),
			});

			if (items.length >= this.#max) {
				break;
			}
		}

		return {
			summary: this.#markdown(result.summary, this.#suggestionSummary),
			items,
		};
	}

	#json(schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>) {
		const { $schema: current, ...json } = toJsonSchema(schema);
		void current;
		return json as Record<string, unknown>;
	}

	async #create<T>(options: {
		input: string;
		instructions: string;
		json: Record<string, unknown>;
		message: string;
		name: string;
		parse: (value: unknown) => T;
	}) {
		const response = await this.#client.responses.create({
			model: "gpt-5-mini",
			tools: [{ type: "web_search" }],
			include: ["web_search_call.action.sources"],
			reasoning: { effort: "low" },
			text: {
				verbosity: "low",
				format: {
					type: "json_schema",
					name: options.name,
					schema: options.json,
					strict: true,
				},
			},
			store: true,
			instructions: options.instructions,
			input: options.input,
		});

		if (!response.output_text) {
			error(502, `AI did not return any ${options.message} content.`);
		}

		let value: unknown;
		try {
			value = JSON.parse(response.output_text);
		} catch {
			error(502, `AI returned an unreadable ${options.message} response.`);
		}

		try {
			return { response, value: options.parse(value) };
		} catch (cause) {
			if (v.isValiError(cause)) {
				error(502, cause.message);
			}

			throw cause;
		}
	}

	#collapse(value: string) {
		return value.trim().replace(/\s+/g, " ");
	}

	#markdown(value: string, fallback = "") {
		return renderMarkdown(this.#collapse(value) || fallback);
	}

	#round(value: number) {
		if (!Number.isFinite(value)) {
			return 0;
		}
		return Number(value.toFixed(2));
	}

	#key(value: string) {
		return this.#collapse(value).toLocaleLowerCase();
	}

	#dedupe(values: string[]) {
		const seen = new Set<string>();
		const next = [];

		for (const value of values) {
			const current = this.#collapse(value);
			const key = current.toLocaleLowerCase();
			if (!current || seen.has(key)) {
				continue;
			}
			seen.add(key);
			next.push(current);
		}

		return next;
	}

	#stripDefault(value: string, fallback: string) {
		const current = this.#collapse(value);
		return current === fallback ? "" : current;
	}

	#cleanDecision(title: string, goal: string, context: string) {
		return {
			title: this.#stripDefault(title, decisionDefaults.title),
			goal: this.#stripDefault(goal, decisionDefaults.goal),
			context: this.#collapse(context),
		};
	}

	#clean(input: Request, kind: Kind): Clean {
		const clean = this.#cleanDecision(input.title, input.goal, input.context);
		return {
			...clean,
			existingAlternatives: this.#filter(
				input.existingAlternatives,
				isAlternativePlaceholder,
			),
			existingCriteria:
				kind === "criteria"
					? this.#filter(
							"existingCriteria" in input ? input.existingCriteria : [],
							isCriteriaPlaceholder,
						)
					: [],
		};
	}

	#cleanScore(input: ScoreResearchRequest): CleanScore {
		const clean = this.#cleanDecision(input.title, input.goal, input.context);
		const alternative = this.#collapse(input.alternative);
		const criterion = this.#collapse(input.criterion);
		return {
			...clean,
			alternative: isAlternativePlaceholder(alternative) ? "" : alternative,
			criterion: isCriteriaPlaceholder(criterion) ? "" : criterion,
			existingAlternatives: this.#filter(
				input.existingAlternatives,
				isAlternativePlaceholder,
			),
			existingCriteria: this.#filter(
				input.existingCriteria,
				isCriteriaPlaceholder,
			),
		};
	}

	#cleanAllocate(input: AllocateResearchRequest): CleanAllocate {
		const clean = this.#cleanDecision(input.title, input.goal, input.context);
		const criterion = this.#collapse(input.criterion);
		return {
			...clean,
			criterion: isCriteriaPlaceholder(criterion) ? "" : criterion,
			existingAlternatives: this.#filter(
				input.existingAlternatives,
				isAlternativePlaceholder,
			),
			existingCriteria: this.#filter(
				input.existingCriteria,
				isCriteriaPlaceholder,
			),
		};
	}

	#filter(values: string[], test: (value: string) => boolean) {
		return this.#dedupe(values).filter((value) => !test(value));
	}

	#formatSection(label: string, values: string[]) {
		if (values.length === 0) {
			return `${label}: none`;
		}

		return `${label}:\n${values.map((value) => `- ${value}`).join("\n")}`;
	}

	#formatDecision(input: Clean) {
		return [
			`Decision title: ${input.title || "not provided"}`,
			`Decision goal: ${input.goal || "not provided"}`,
			`Extra context: ${input.context || "none"}`,
			this.#formatSection("Existing alternatives", input.existingAlternatives),
		].join("\n\n");
	}

	#normalizeConsiderations(values: string[]) {
		return this.#dedupe(values).slice(0, 4);
	}

	#normalizePoints(values: AllocatePoint[], alternatives: string[]) {
		const names = this.#dedupe(alternatives);
		const map = new Map<string, AllocatePoint>();

		for (const value of values) {
			const alternative = this.#collapse(value.alternative);
			const key = this.#key(alternative);
			if (!alternative || map.has(key)) {
				continue;
			}

			const match = names.find((item) => this.#key(item) === key);
			if (match == null) {
				continue;
			}

			map.set(key, {
				alternative: match,
				points: this.#round(Math.max(0, value.points)),
				reason: this.#markdown(value.reason, this.#pointReason),
			});
		}

		return names.map((alternative) => {
			return (
				map.get(this.#key(alternative)) ?? {
					alternative,
					points: 0,
					reason: this.#markdown("", this.#pointReason),
				}
			);
		});
	}

	#extractSources(response: { output?: unknown[] | null | undefined }) {
		const seen = new Set<string>();
		const sources: ResearchSource[] = [];

		const add = (url: string | null | undefined, title = "") => {
			if (!url) {
				return;
			}

			let href: string;
			try {
				href = new URL(url).toString();
			} catch {
				return;
			}

			if (seen.has(href)) {
				return;
			}

			seen.add(href);
			sources.push({
				title: this.#collapse(title) || this.#sourceTitle(href),
				url: href,
			});
		};

		for (const output of response.output ?? []) {
			if (output == null || typeof output !== "object" || !("type" in output)) {
				continue;
			}

			if (output.type === "message" && "content" in output) {
				for (const part of Array.isArray(output.content)
					? output.content
					: []) {
					if (
						part == null ||
						typeof part !== "object" ||
						!("type" in part) ||
						part.type !== "output_text" ||
						!("annotations" in part)
					) {
						continue;
					}

					for (const note of Array.isArray(part.annotations)
						? part.annotations
						: []) {
						if (
							note == null ||
							typeof note !== "object" ||
							!("type" in note) ||
							note.type !== "url_citation"
						) {
							continue;
						}

						add(
							"url" in note && typeof note.url === "string" ? note.url : null,
							"title" in note && typeof note.title === "string"
								? note.title
								: "",
						);
					}
				}
			}

			if (output.type !== "web_search_call" || !("action" in output)) {
				continue;
			}

			const action =
				output.action != null && typeof output.action === "object"
					? output.action
					: null;
			if (action == null || !("type" in action)) {
				continue;
			}

			if (action.type === "search" && "sources" in action) {
				for (const source of Array.isArray(action.sources)
					? action.sources
					: []) {
					if (
						source != null &&
						typeof source === "object" &&
						"type" in source &&
						source.type === "url" &&
						"url" in source &&
						typeof source.url === "string"
					) {
						add(source.url);
					}
				}
			}

			if (
				(action.type === "open_page" || action.type === "find_in_page") &&
				"url" in action &&
				typeof action.url === "string"
			) {
				add(action.url);
			}
		}

		return sources;
	}

	#sourceTitle(url: string) {
		try {
			return new URL(url).hostname.replace(/^www\./, "");
		} catch {
			return url;
		}
	}
}

export const client = new AI(OPENAI_API_KEY);
