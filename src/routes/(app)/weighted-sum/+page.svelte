<script lang="ts">
	import Criteria from "$lib/components/Criteria.svelte";
	import WeightedSum from "./WeightedSum.svelte";
	import Reset from "$lib/components/Reset.svelte";
	import WeightedSumScore from "./WeightedSumScore.svelte";
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
	<Criteria />
	<div class="hidden sm:block">
		<WeightedSumScore />
	</div>
</div>

<WeightedSum />

<div class="sm:hidden">
	<WeightedSumScore />
</div>

<div class="mt-4">
	<Reset />
</div>
