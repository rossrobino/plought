<script lang="ts">
	import Scores from "$lib/components/scores/Scores.svelte";
	import PairwiseComparison from "./PairwiseComparison.svelte";
</script>

<PairwiseComparison />

<Scores sortBy="pairwise" pairwise={true} />
