<script lang="ts">
	import Head from "$lib/components/Head.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import {
		type MethodKey,
		isMethodIncluded,
		toggleMethodIncluded,
	} from "$lib/state";

	const methods: { key: MethodKey; label: string }[] = [
		{ key: "weightedSum", label: "Weighted Sum" },
		{ key: "pairwise", label: "Pairwise" },
		{ key: "rankOrder", label: "Rank" },
		{ key: "topsis", label: "TOPSIS" },
	];

	const hasIncluded = $derived(
		methods.some((item) => isMethodIncluded(item.key)),
	);
</script>

<Head title="Summary" />

<section>
	<h2 class="mb-0">Included Methods</h2>
	<p class="mt-1 text-muted-foreground">
		Toggle which methods appear in the summary table.
	</p>
	<div class="mt-3 flex flex-wrap gap-2">
		{#each methods as item (item.key)}
			{@const included = isMethodIncluded(item.key)}
			<Button
				size="sm"
				variant={included ? "secondary" : "outline"}
				aria-pressed={included}
				onclick={() => toggleMethodIncluded(item.key)}
			>
				{item.label}
			</Button>
		{/each}
	</div>
</section>

{#if hasIncluded}
	<Scores
		weightedSum={isMethodIncluded("weightedSum")}
		pairwise={isMethodIncluded("pairwise")}
		rankOrder={isMethodIncluded("rankOrder")}
		topsis={isMethodIncluded("topsis")}
	/>
{:else}
	<section>
		<h2 class="mb-0">No Methods Included</h2>
		<p class="mt-1 text-muted-foreground">
			Enable one or more methods above to view scores.
		</p>
	</section>
{/if}
