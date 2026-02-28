<script lang="ts">
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { reset } from "$lib/state";

	let open = $state(false);
</script>

<AlertDialog.Root bind:open>
	<div class="mt-3 flex justify-end">
		<Button size="sm" variant="secondary" onclick={() => (open = true)}>
			<RotateCcwIcon />
			Reset
		</Button>
	</div>

	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Reset values?</AlertDialog.Title>
			<AlertDialog.Description>
				This clears your saved criteria and alternatives and restores defaults.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel class="h-8 px-3 text-sm">Cancel</AlertDialog.Cancel>
			<AlertDialog.Action class="h-8 px-3 text-sm" onclick={reset}>
				<RotateCcwIcon />
				Reset
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
