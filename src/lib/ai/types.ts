export interface SuggestionItem {
	name: string;
	reason: string;
}

export interface SuggestionResult {
	summary: string;
	items: SuggestionItem[];
}

export interface AlternativeSuggestionRequest {
	title: string;
	goal: string;
	context: string;
	existingAlternatives: string[];
	requestId: string;
}

export interface CriteriaSuggestionRequest
	extends AlternativeSuggestionRequest {
	existingCriteria: string[];
}
