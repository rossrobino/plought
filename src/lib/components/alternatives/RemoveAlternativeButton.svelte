<script lang="ts">
	import XMark from "$lib/svg/XMark.svelte";
	import { alternatives } from "$lib/stores";

	interface Props {
		index: number;
	}

	let { index }: Props = $props();

	const removeAlternative = (index: number) => {
		$alternatives.splice(index, 1);
		$alternatives.forEach((alt) => {
			alt.pairwise.splice(index, 1);
		});
		$alternatives = $alternatives;
	};
</script>

<button
	class="btn-s"
	onclick={() => removeAlternative(index)}
	disabled={$alternatives.length < 2}
>
	<XMark />
</button>
