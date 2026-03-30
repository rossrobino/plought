<script lang="ts">
	import { type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-dialog-footer"
	class={["flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className]}
	{...restProps}
>
	{@render children?.()}
</div>
