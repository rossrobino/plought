import type { AI } from "./index";
import type { InferOutput } from "valibot";

export type AlternativeSuggestionRequest = InferOutput<AI["alternativeSchema"]>;

export type CriteriaSuggestionRequest = InferOutput<AI["criteriaSchema"]>;

export type SuggestionResult = InferOutput<AI["suggestionResultSchema"]>;

export type SuggestionItem = SuggestionResult["items"][number];

export type ScoreResearchRequest = InferOutput<AI["scoreResearchSchema"]>;

export type ScoreResearchResult = InferOutput<AI["scoreResearchResultSchema"]>;

export type ResearchSource = ScoreResearchResult["sources"][number];

export type AllocateResearchRequest = InferOutput<AI["allocateResearchSchema"]>;

export type AllocateResearchResult = InferOutput<
	AI["allocateResearchResultSchema"]
>;

export type AllocatePoint = AllocateResearchResult["suggestedPoints"][number];
