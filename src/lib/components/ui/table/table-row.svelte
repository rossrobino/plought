<script lang="ts">
	import { type WithElementRef, cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableRowElement>> = $props();
</script>

<tr
	bind:this={ref}
	data-slot="table-row"
	class={cn(
		"border-b transition-colors data-[state=selected]:bg-[var(--table-row-selected)] hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-[var(--table-row-hover)]",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</tr>
