<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { alternatives, criteria } from "$lib/state";

	export const addAlternative = () => {
		// create an array of zeros based on the number of criteria
		const scores: number[] = new Array(criteria.current.length).fill(0);

		// create an array of pairwise scores based on the number of alternatives
		const pairwise: number[] = new Array(alternatives.current.length + 1).fill(
			0.5,
		);

		// add an extra pairwise score for each alternative
		// corresponding with the new alternative
		alternatives.current.forEach((alt) => {
			alt.pairwise.push(0.5);
		});

		// push the new alternative to the list
		alternatives.current.push({
			name: `Alternative #${alternatives.current.length + 1}`,
			scores,
			pairwise,
		});
	};
</script>

<Button class="mt-4 w-full" onclick={addAlternative}>Add</Button>
