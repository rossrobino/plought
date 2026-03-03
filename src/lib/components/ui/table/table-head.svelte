<script lang="ts">
	import { type WithElementRef, cn } from "$lib/utils.js";
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
	class={cn(
		"h-10 bg-clip-padding px-2 text-start align-middle font-medium whitespace-nowrap text-foreground transition-colors data-[col-active=true]:bg-slate-500/4 data-[cell-active=true]:bg-slate-500/6 data-[cell-active=true]:shadow-[inset_0_0_0_1px_var(--color-border)] [&:has([role=checkbox])]:pe-0",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</th>
