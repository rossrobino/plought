<script lang="ts">
	import { type WithElementRef, cn } from "$lib/utils.js";
	import type { HTMLTdAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLTdAttributes> = $props();
</script>

<td
	bind:this={ref}
	data-slot="table-cell"
	class={cn(
		"bg-clip-padding p-2 align-middle whitespace-nowrap transition-colors data-[col-active=true]:bg-slate-500/4 data-[cell-active=true]:bg-slate-500/6 data-[cell-active=true]:shadow-[inset_0_0_0_1px_var(--color-border)] [&:has([role=checkbox])]:pe-0",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</td>
