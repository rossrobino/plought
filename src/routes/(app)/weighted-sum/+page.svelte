<script lang="ts">
	import Alternatives from "$lib/components/alternatives/Alternatives.svelte";
	import Criteria from "$lib/components/criteria/Criteria.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
</script>

<div
	class="grid grid-cols-1 items-start gap-4 *:min-w-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
>
	<Criteria />
	<div class="hidden sm:block">
		<Scores sortBy="weightedSum" weightedSum={true} />
	</div>
</div>

<Alternatives showCriteria={true} editNames={false} manageList={false} />

<div class="sm:hidden">
	<Scores sortBy="weightedSum" weightedSum={true} />
</div>
