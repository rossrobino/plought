<script lang="ts">
	import { generateScoreResearch } from "$lib/ai/research.remote";
	import type {
		AllocateResearchResult,
		ScoreResearchRequest,
		ScoreResearchResult,
	} from "$lib/ai/types";
	import ResearchPanel from "$lib/components/ai/research-panel.svelte";
	import Alternatives from "$lib/components/alternatives/alternatives.svelte";
	import {
		alternatives,
		criteria,
		decision,
		isAlternativePlaceholder,
		isCriteriaPlaceholder,
		markAppUsed,
		markMethodUsed,
	} from "$lib/state";
	import { tick } from "svelte";

	let activeCell = $state<{
		alternativeIndex: number;
		criterionIndex: number;
	} | null>(null);
	let research = $state<HTMLDivElement | null>(null);

	const currentAlternative = $derived(
		activeCell == null
			? null
			: (alternatives.current[activeCell.alternativeIndex] ?? null),
	);
	const currentCriterion = $derived(
		activeCell == null
			? null
			: (criteria.current[activeCell.criterionIndex] ?? null),
	);
	const target = $derived(
		currentAlternative != null && currentCriterion != null
			? `${currentAlternative.name} · ${currentCriterion.name}`
			: "Choose a score cell to research",
	);
	const targetKey = $derived(
		activeCell == null
			? "score:none"
			: `${activeCell.alternativeIndex}:${activeCell.criterionIndex}`,
	);
	const message = $derived.by(() => {
		if (
			activeCell == null ||
			currentAlternative == null ||
			currentCriterion == null
		) {
			return "Choose a score cell to research.";
		}
		if (isAlternativePlaceholder(currentAlternative.name)) {
			return "Rename this alternative before researching it.";
		}
		if (isCriteriaPlaceholder(currentCriterion.name)) {
			return "Rename this criterion before researching it.";
		}
		return "";
	});
	const canGenerate = $derived(message.length === 0);

	const scrollResearch = async () => {
		await tick();
		research?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const selectCell = async (
		alternativeIndex: number,
		criterionIndex: number,
	) => {
		activeCell = { alternativeIndex, criterionIndex };
		await scrollResearch();
	};

	const createRequest = (context: string): ScoreResearchRequest => {
		return {
			title: decision.current.title,
			goal: decision.current.goal,
			context,
			alternative: currentAlternative?.name ?? "",
			criterion: currentCriterion?.name ?? "",
			existingAlternatives: alternatives.current.map((item) => item.name),
			existingCriteria: criteria.current.map((item) => item.name),
			requestId: crypto.randomUUID(),
		};
	};

	const load = (input: ScoreResearchRequest) => {
		return generateScoreResearch(input);
	};

	const apply = (result: ScoreResearchResult | AllocateResearchResult) => {
		if (
			activeCell == null ||
			!("suggestedScore" in result) ||
			alternatives.current[activeCell.alternativeIndex] == null
		) {
			return;
		}

		alternatives.current[activeCell.alternativeIndex].scores[
			activeCell.criterionIndex
		] = Number(Math.max(0, Math.min(10, result.suggestedScore)).toFixed(2));
		markAppUsed("score");
		markMethodUsed("weightedSum");
	};
</script>

<Alternatives
	showCriteria={true}
	editNames={false}
	manageList={false}
	{activeCell}
	onChange={() => markAppUsed("score")}
	onResearch={selectCell}
/>

{#if activeCell != null}
	<div bind:this={research}>
		{#key targetKey}
			<ResearchPanel
				{canGenerate}
				{message}
				{target}
				{createRequest}
				desc="Get a suggested score, a short rationale, and source links for this cell."
				hint="Optional: constraints, timing, budget, or anything not already captured."
				{load}
				mode="score"
				onApply={apply}
			/>
		{/key}
	</div>
{/if}
