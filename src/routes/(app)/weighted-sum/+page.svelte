<script lang="ts">
	import Alternatives from "$lib/components/alternatives/Alternatives.svelte";
	import Criteria from "$lib/components/criteria/Criteria.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
</script>

<div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 [&>*]:min-w-0">
	<Criteria />
	<div class="hidden sm:block">
		<Scores sortBy="weightedSum" weightedSum={true} />
	</div>
</div>

<Alternatives showCriteria={true} editNames={false} manageList={false} />

<div class="sm:hidden">
	<Scores sortBy="weightedSum" weightedSum={true} />
</div>
