<script lang="ts">
	import Head from "$lib/components/Head.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
</script>

<Head title="Scores" />

<Scores weightedSum={true} pairwise={true} />
