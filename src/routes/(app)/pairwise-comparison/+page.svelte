<script lang="ts">
	import Reset from "$lib/components/Reset.svelte";
	import Alternatives from "$lib/components/alternatives/Alternatives.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import PairwiseComparison from "./PairwiseComparison.svelte";
	import PairwiseLearn from "./PairwiseLearn.svelte";

	let tab = $state("app");
</script>

<Tabs.Root bind:value={tab} class="mb-4">
	<Tabs.List class="h-auto w-fit justify-start rounded-xl border bg-muted/70 p-1 shadow-sm">
		<Tabs.Trigger
			value="app"
			class="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
		>
			App
		</Tabs.Trigger>
		<Tabs.Trigger
			value="learn"
			class="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
		>
			Learn
		</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="app">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Alternatives />
			<div class="hidden sm:block">
				<Scores sortBy="pairwise" pairwise={true} />
			</div>
		</div>

		<PairwiseComparison />

		<div class="block sm:hidden">
			<Scores sortBy="pairwise" pairwise={true} />
		</div>

		<Reset />
	</Tabs.Content>

	<Tabs.Content value="learn">
		<PairwiseLearn />
	</Tabs.Content>
</Tabs.Root>
