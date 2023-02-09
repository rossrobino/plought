<script lang="ts">
	import { criteria, alternatives } from "$lib/stores";

	const reset = () => {
		$criteria = [
			{
				name: "Criteria #1",
				weight: 0.5,
			},
			{
				name: "Criteria #2",
				weight: 0.5,
			},
		];
		$alternatives = [
			{
				name: "Alternative #1",
				scores: [5, 5],
				pairwise: [0.5, 0.5],
			},
			{
				name: "Alternative #2",
				scores: [5, 5],
				pairwise: [0.5, 0.5],
			},
		];
	};
</script>

<button class="btn-t w-full" on:click={reset}>Reset</button>
