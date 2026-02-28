<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
	import type { Snippet } from "svelte";

	interface Props {
		align?: "start" | "center" | "end";
		children?: Snippet;
		label?: string;
	}

	let { label = "More info", align = "end", children }: Props = $props();
</script>

<Popover.Root>
	<Popover.Trigger>
		<Button
			variant="ghost"
			size="icon-sm"
			class="size-7 text-muted-foreground hover:text-foreground"
			aria-label={label}
		>
			<CircleHelpIcon class="size-4" />
		</Button>
	</Popover.Trigger>
	<Popover.Content {align} class="w-80 text-sm text-muted-foreground">
		{@render children?.()}
	</Popover.Content>
</Popover.Root>
