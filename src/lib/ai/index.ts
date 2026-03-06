import { OPENAI_API_KEY } from "$env/static/private";
import { AI } from "./core";

export type {
	AlternativeSuggestionRequest,
	CriteriaSuggestionRequest,
	SuggestionItem,
	SuggestionResult,
} from "./types";
export { AI };

export const client = new AI(OPENAI_API_KEY);
