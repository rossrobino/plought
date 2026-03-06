import { decisionDefaults } from "$lib/state";
import type {
	AlternativeSuggestionRequest,
	CriteriaSuggestionRequest,
	SuggestionItem,
	SuggestionResult,
} from "./types";
import { error } from "@sveltejs/kit";
import { toJsonSchema } from "@valibot/to-json-schema";
import { OpenAI } from "openai";
import * as v from "valibot";

type Kind = "alternatives" | "criteria";
type Request = AlternativeSuggestionRequest | CriteriaSuggestionRequest;

interface CleanRequest {
	title: string;
	goal: string;
	context: string;
	existingAlternatives: string[];
	existingCriteria: string[];
}

export class AI {
	#client: OpenAI;

	#text = v.pipe(v.string(), v.maxLength(4_000));

	#name = v.pipe(v.string(), v.maxLength(200));

	#item = v.strictObject({ name: this.#name, reason: this.#text });

	#result = v.message(
		v.strictObject({ summary: this.#text, items: v.array(this.#item) }),
		"AI returned an invalid suggestion response.",
	);

	#resultJson = (() => {
		const { $schema: schema, ...json } = toJsonSchema(this.#result);
		void schema;
		return json;
	})();

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

	#alternativePattern = /^Alternative #\d+$/i;

	#criteriaPattern = /^Criterion #\d+$/i;

	#max = 15;

	#summary = "Suggestions based on the decision context you provided.";

	#reason = "Fits the context you provided for this decision.";

	constructor(apiKey: string) {
		this.#client = new OpenAI({ apiKey });
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
			"Avoid duplicates, overly broad labels, and combined criteria.",
			"Do not repeat existing criteria or use placeholders.",
			"Give one short reason per suggestion tied to the decision context.",
			"Use web search only when current real-world facts would materially improve the suggestions.",
			"",
			this.#formatDecision(clean),
			"",
			this.#formatSection("Existing criteria", clean.existingCriteria),
		].join("\n");
	}

	parseResult(value: unknown) {
		return v.parse(this.#result, value);
	}

	async createSuggestions(options: {
		existingNames: string[];
		input: string;
		instructions?: string;
		previous_response_id?: string;
	}) {
		const response = await this.#client.responses.create({
			model: "gpt-5-mini",
			tools: [{ type: "web_search" }],
			reasoning: { effort: "low" },
			text: {
				verbosity: "low",
				format: {
					type: "json_schema",
					name: "suggestion_result",
					schema: this.#resultJson,
					strict: true,
				},
			},
			store: true,
			instructions:
				options.instructions ??
				"Return only JSON matching the provided schema. Keep the summary concise and the reasons practical.",
			input: options.input,
			previous_response_id: options.previous_response_id,
		});

		if (!response.output_text) {
			error(502, "AI did not return any suggestion content.");
		}

		let value: unknown;
		try {
			value = JSON.parse(response.output_text);
		} catch {
			error(502, "AI returned an unreadable suggestion response.");
		}

		try {
			return this.normalizeResult(
				this.parseResult(value),
				options.existingNames,
			);
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

	#filter(values: string[], pattern: RegExp) {
		return this.#dedupe(values).filter((value) => !pattern.test(value));
	}

	#clean(input: Request, kind: Kind): CleanRequest {
		return {
			title: this.#stripDefault(input.title, decisionDefaults.title),
			goal: this.#stripDefault(input.goal, decisionDefaults.goal),
			context: this.#collapse(input.context),
			existingAlternatives: this.#filter(
				input.existingAlternatives,
				this.#alternativePattern,
			),
			existingCriteria:
				kind === "criteria"
					? this.#filter(
							"existingCriteria" in input ? input.existingCriteria : [],
							this.#criteriaPattern,
						)
					: [],
		};
	}

	#formatSection(label: string, values: string[]) {
		if (values.length === 0) {
			return `${label}: none`;
		}

		return `${label}:\n${values.map((value) => `- ${value}`).join("\n")}`;
	}

	#formatDecision(input: CleanRequest) {
		return [
			`Decision title: ${input.title || "not provided"}`,
			`Decision goal: ${input.goal || "not provided"}`,
			`Extra context: ${input.context || "none"}`,
			this.#formatSection("Existing alternatives", input.existingAlternatives),
		].join("\n\n");
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
			items.push({ name, reason: this.#collapse(item.reason) || this.#reason });

			if (items.length >= this.#max) {
				break;
			}
		}

		return { summary: this.#collapse(result.summary) || this.#summary, items };
	}
}
