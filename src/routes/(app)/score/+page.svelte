<script lang="ts">
	import { generateScoreResearch } from "$lib/ai/research.remote";
	import type {
		AllocateResearchRequest,
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

	interface Cell {
		alternativeIndex: number;
		criterionIndex: number;
	}

	interface Item extends Cell {
		key: string;
		request: ScoreResearchRequest | null;
	}

	let items = $state<Item[]>([]);
	let research = $state<HTMLDivElement | null>(null);

	const activeKeys = $derived(items.map((item) => item.key));

	const getKey = ({ alternativeIndex, criterionIndex }: Cell) => {
		return `${alternativeIndex}:${criterionIndex}`;
	};

	const getAlternative = ({ alternativeIndex }: Cell) => {
		return alternatives.current[alternativeIndex] ?? null;
	};

	const getCriterion = ({ criterionIndex }: Cell) => {
		return criteria.current[criterionIndex] ?? null;
	};

	const getTarget = (cell: Cell) => {
		const alternative = getAlternative(cell);
		const criterion = getCriterion(cell);
		return alternative != null && criterion != null
			? `${alternative.name} · ${criterion.name}`
			: "Choose a score cell to research";
	};

	const getMessage = (cell: Cell) => {
		const alternative = getAlternative(cell);
		const criterion = getCriterion(cell);
		if (alternative == null || criterion == null) {
			return "Choose a score cell to research.";
		}
		if (isAlternativePlaceholder(alternative.name)) {
			return "Rename this alternative before researching it.";
		}
		if (isCriteriaPlaceholder(criterion.name)) {
			return "Rename this criterion before researching it.";
		}
		return "";
	};

	const scrollResearch = async () => {
		await tick();
		research?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const canResearchCell = (
		alternativeIndex: number,
		criterionIndex: number,
	) => {
		const alternative = alternatives.current[alternativeIndex];
		const criterion = criteria.current[criterionIndex];
		return (
			alternative != null &&
			criterion != null &&
			!isAlternativePlaceholder(alternative.name) &&
			!isCriteriaPlaceholder(criterion.name)
		);
	};

	const createRequest = (
		alternativeIndex: number,
		criterionIndex: number,
	): ScoreResearchRequest => {
		return {
			title: decision.current.title,
			goal: decision.current.goal,
			notes: decision.current.notes,
			alternative: alternatives.current[alternativeIndex]?.name ?? "",
			criterion: criteria.current[criterionIndex]?.name ?? "",
			existingAlternatives: alternatives.current.map((item) => item.name),
			existingCriteria: criteria.current.map((item) => item.name),
			requestId: crypto.randomUUID(),
		};
	};

	const selectCell = async (
		alternativeIndex: number,
		criterionIndex: number,
	) => {
		const cell = { alternativeIndex, criterionIndex };
		const next: Item = {
			...cell,
			key: getKey(cell),
			request: canResearchCell(alternativeIndex, criterionIndex)
				? createRequest(alternativeIndex, criterionIndex)
				: null,
		};

		items = [next, ...items.filter((item) => item.key !== next.key)];
		await scrollResearch();
	};

	const dismiss = (key: string) => {
		items = items.filter((item) => item.key !== key);
	};

	const load = (input: ScoreResearchRequest | AllocateResearchRequest) => {
		if (!("alternative" in input)) {
			throw new TypeError("Invalid score research request.");
		}

		return generateScoreResearch(input);
	};

	const apply = (
		cell: Cell,
		result: ScoreResearchResult | AllocateResearchResult,
	) => {
		if (
			!("suggestedScore" in result) ||
			alternatives.current[cell.alternativeIndex] == null
		) {
			return;
		}

		alternatives.current[cell.alternativeIndex].scores[cell.criterionIndex] =
			Number(Math.max(0, Math.min(10, result.suggestedScore)).toFixed(2));
		markAppUsed("score");
		markMethodUsed("weightedSum");
	};
</script>

<Alternatives
	showCriteria={true}
	editNames={false}
	manageList={false}
	{activeKeys}
	onChange={() => markAppUsed("score")}
	onResearch={selectCell}
/>

{#if items.length > 0}
	<div bind:this={research} class="grid gap-3">
		{#each items as item (item.key)}
			<ResearchPanel
				canGenerate={getMessage(item).length === 0}
				message={getMessage(item)}
				target={getTarget(item)}
				{load}
				mode="score"
				onApply={(result) => apply(item, result)}
				request={item.request}
				onClose={() => dismiss(item.key)}
			/>
		{/each}
	</div>
{/if}
