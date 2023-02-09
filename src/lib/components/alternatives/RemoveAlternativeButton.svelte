<script lang="ts">
	import { removeAlternative } from "$lib/util/alternative";
	import XMark from "$lib/svg/XMark.svelte";

	export let index: number;
</script>

<button class="btn-s" on:click={() => removeAlternative(index)}>
	<XMark />
</button>
