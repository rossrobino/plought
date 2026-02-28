<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import Head from "$lib/components/Head.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
	import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
</script>

<Head title="Scores" />

<div class="mb-4 flex justify-end">
	<Popover.Root>
		<Popover.Trigger>
			<Button variant="outline" size="icon-sm" aria-label="About scores">
				<CircleHelpIcon />
			</Button>
		</Popover.Trigger>
		<Popover.Content align="end" class="text-sm text-muted-foreground">
			This page summarizes your current inputs from all decision models. Update
			values on the app pages and return here to compare rankings side-by-side.
		</Popover.Content>
	</Popover.Root>
</div>

<Scores weightedSum={true} pairwise={true} />
