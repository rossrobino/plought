<script lang="ts">
	import { type WithElementRef } from "$lib/utils.js";
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
	class={[
		"bg-clip-padding p-2 align-middle whitespace-nowrap transition-colors data-[cell-active=true]:bg-[var(--table-cell-active)] data-[cell-active=true]:shadow-[inset_0_0_0_1px_var(--color-border)] data-[col-active=true]:bg-[var(--table-col-active)] [&:has([role=checkbox])]:pe-0",
		className,
	]}
	{...restProps}
>
	{@render children?.()}
</td>
