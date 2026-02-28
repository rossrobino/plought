<script lang="ts">
	import Reset from "$lib/components/Reset.svelte";
	import Alternatives from "$lib/components/alternatives/Alternatives.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
	import PairwiseComparison from "./PairwiseComparison.svelte";
</script>

<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
