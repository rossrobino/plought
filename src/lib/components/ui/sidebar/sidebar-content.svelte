<script lang="ts">
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { type WithElementRef, cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="sidebar-content"
	data-sidebar="content"
	class={cn(
		"flex min-h-0 flex-1 flex-col group-data-[collapsible=icon]:overflow-hidden",
		className,
	)}
	{...restProps}
>
	<ScrollArea class="h-full min-h-0 flex-1" orientation="vertical">
		<div class="flex flex-col gap-2">
			{@render children?.()}
		</div>
	</ScrollArea>
</div>
