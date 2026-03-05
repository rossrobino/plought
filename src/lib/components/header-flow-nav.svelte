<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils.js";
	import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

	interface FlowLink {
		href: string;
		label: string;
	}

	interface Props {
		prev?: FlowLink | null;
		next?: FlowLink | null;
		className?: string;
	}

	let { prev = null, next = null, className = "" }: Props = $props();
</script>

<nav
	aria-label="Workflow navigation"
	class={cn("ms-auto flex items-center gap-1", className)}
>
	{#if prev != null}
		<Button
			size="sm"
			variant="outline"
			href={prev.href}
			class="h-8 w-8 px-0 md:h-9 md:w-31.5 md:justify-between md:px-3"
			aria-label={`Previous: ${prev.label}`}
		>
			<ChevronLeftIcon />
			<span class="hidden md:inline">{prev.label}</span>
		</Button>
	{/if}
	{#if next != null}
		<Button
			size="sm"
			variant="outline"
			href={next.href}
			class="h-8 w-8 px-0 md:h-9 md:w-31.5 md:justify-between md:px-3"
			aria-label={`Next: ${next.label}`}
		>
			<span class="hidden md:inline">{next.label}</span>
			<ChevronRightIcon />
		</Button>
	{/if}
</nav>
