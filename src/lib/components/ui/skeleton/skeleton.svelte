<script lang="ts">
	import { type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

	let {
		ref = $bindable(null),
		class: className,
		"data-slot": dataSlot = "skeleton",
		...restProps
	}: Props = $props();
</script>

<div
	bind:this={ref}
	data-slot={dataSlot}
	class={["rounded-md bg-muted/60 motion-safe:animate-pulse", className]}
	{...restProps}
></div>
