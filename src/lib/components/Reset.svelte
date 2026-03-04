<script lang="ts">
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { reset } from "$lib/state";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";

	type ResetVariant =
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";

	interface Props {
		className?: string;
		onAction?: () => void;
		variant?: ResetVariant;
	}

	let { className = "", onAction, variant = "secondary" }: Props = $props();
	let open = $state(false);

	const handleReset = () => {
		reset();
		open = false;
	};

	const openDialog = () => {
		onAction?.();
		open = true;
	};
</script>

<AlertDialog.Root bind:open>
	<Button size="sm" {variant} class={className} onclick={openDialog}>
		<RotateCcwIcon />
		Reset
	</Button>

	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Reset values?</AlertDialog.Title>
			<AlertDialog.Description>
				This clears your saved decision title, goal, criteria, and alternatives
				and restores defaults.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel class="h-8 px-3 text-sm">Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				class="h-8 border-border/80 bg-destructive px-3 text-sm text-white hover:opacity-90 focus-visible:outline-destructive"
				onclick={handleReset}
			>
				<RotateCcwIcon />
				Reset
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
