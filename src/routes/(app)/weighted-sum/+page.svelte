<script lang="ts">
	import Criteria from "$lib/components/criteria/Criteria.svelte";
	import Reset from "$lib/components/Reset.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
	import Alternatives from "$lib/components/alternatives/Alternatives.svelte";
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
	<Criteria />
	<div class="hidden sm:block">
		<Scores sortBy="weightedSum" weightedSum={true} />
	</div>
</div>

<Alternatives showCriteria={true} />

<div class="sm:hidden">
	<Scores sortBy="weightedSum" weightedSum={true} />
</div>

<div class="mt-4">
	<Reset />
</div>
