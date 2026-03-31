<script lang="ts">
	import { type WithElementRef } from "$lib/utils.js";
	import type { HTMLThAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLThAttributes> = $props();
</script>

<th
	bind:this={ref}
	data-slot="table-head"
	class={[
		"h-10 bg-clip-padding px-2 text-start align-middle font-medium whitespace-nowrap text-foreground transition-colors data-[cell-active=true]:bg-(--table-cell-active) data-[cell-active=true]:shadow-[inset_0_0_0_1px_var(--color-border)] data-[col-active=true]:bg-(--table-col-active) [&:has([role=checkbox])]:pe-0",
		className,
	]}
	{...restProps}
>
	{@render children?.()}
</th>
