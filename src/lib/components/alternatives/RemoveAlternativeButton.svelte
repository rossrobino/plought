<script lang="ts">
	import { alternatives } from "$lib/stores";
	import XMark from "$lib/svg/XMark.svelte";

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
