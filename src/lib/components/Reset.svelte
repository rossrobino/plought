<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { reset } from "$lib/state";

	let open = $state(false);
</script>

<AlertDialog.Root bind:open>
	<Button class="mt-8 w-full" variant="secondary" onclick={() => (open = true)}>
		Reset
	</Button>

	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Reset values?</AlertDialog.Title>
			<AlertDialog.Description>
				This clears your saved criteria and alternatives and restores defaults.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={reset}>Reset</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
