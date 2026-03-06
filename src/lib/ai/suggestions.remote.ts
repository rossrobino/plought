import { query } from "$app/server";
import { client } from "$lib/ai";
import type {
	AlternativeSuggestionRequest,
	CriteriaSuggestionRequest,
} from "$lib/ai";
import { error } from "@sveltejs/kit";

export const generateAlternativeSuggestions = query(
	client.alternativeSchema,
	async (input) => {
		if (!client.hasInput(input, "alternatives")) {
			error(
				400,
				"Add a title, goal, extra context, or real alternatives before asking for suggestions.",
			);
		}

		return client.createSuggestions({
			input: client.buildAlternativePrompt(
				input as AlternativeSuggestionRequest,
			),
			existingNames: input.existingAlternatives,
		});
	},
);

export const generateCriteriaSuggestions = query(
	client.criteriaSchema,
	async (input) => {
		if (!client.hasInput(input, "criteria")) {
			error(
				400,
				"Add a title, goal, extra context, or real decision details before asking for suggestions.",
			);
		}

		return client.createSuggestions({
			input: client.buildCriteriaPrompt(input as CriteriaSuggestionRequest),
			existingNames: [...input.existingCriteria, ...input.existingAlternatives],
		});
	},
);
