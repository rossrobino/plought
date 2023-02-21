<script lang="ts">
	import { criteria, alternatives } from "$lib/stores";

	export const addAlternative = () => {
		// create an array of zeros based on the number of criteria
		const scores: number[] = new Array($criteria.length).fill(0);

		// create an array of pairwise scores based on the number of alternatives
		const pairwise: number[] = new Array($alternatives.length + 1).fill(0.5);

		// add an extra pairwise score for each alternative
		// corresponding with the new alternative
		$alternatives.forEach((alt) => {
			alt.pairwise.push(0.5);
		});

		// push the new alternative to the list
		$alternatives.push({
			name: `Alternative #${$alternatives.length + 1}`,
			scores,
			pairwise,
		});

		$alternatives = $alternatives;
	};
</script>

<button class="mt-4 w-full" on:click={addAlternative}>Add</button>
