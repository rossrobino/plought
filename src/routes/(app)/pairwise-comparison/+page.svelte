<script lang="ts">
	import Scores from "$lib/components/scores/Scores.svelte";
	import Reset from "$lib/components/Reset.svelte";
	import PairwiseComparison from "./PairwiseComparison.svelte";
	import Alternatives from "$lib/components/alternatives/Alternatives.svelte";
</script>

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
