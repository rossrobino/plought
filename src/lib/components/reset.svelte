<script lang="ts">
	import { goto } from "$app/navigation";
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import { Button } from "$lib/components/ui/button";
	import { reset } from "$lib/state";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import type { ClassValue } from "svelte/elements";

	type ResetVariant =
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";

	interface Props {
		className?: ClassValue;
		variant?: ResetVariant;
	}

	let { className = "", variant = "secondary" }: Props = $props();
	let open = $state(false);

	const handleReset = async () => {
		reset();
		open = false;
		await goto("/setup");
	};

	const openDialog = () => {
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
				class="h-8 border-destructive/70 bg-destructive px-3 text-sm text-white hover:bg-destructive/90 hover:text-white focus-visible:outline-destructive"
				onclick={handleReset}
			>
				<RotateCcwIcon />
				Reset
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
