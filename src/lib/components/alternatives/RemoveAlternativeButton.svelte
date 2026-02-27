<script lang="ts">
	import { alternatives } from "$lib/state";
	import XMark from "$lib/svg/XMark.svelte";

	interface Props {
		index: number;
	}

	let { index }: Props = $props();

	const removeAlternative = (index: number) => {
		alternatives.current.splice(index, 1);
		alternatives.current.forEach((alt) => {
			alt.pairwise.splice(index, 1);
		});
	};
</script>

<button
	class="btn-s"
	onclick={() => removeAlternative(index)}
	disabled={alternatives.current.length < 2}
>
	<XMark />
</button>
