<script lang="ts">
	import { buttonVariants } from "#lib/components/ui/button/index.ts";
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AlertDialogPrimitive.CancelProps = $props();
</script>

<AlertDialogPrimitive.Cancel
	bind:ref
	data-slot="alert-dialog-cancel"
	class={[buttonVariants({ variant: "outline" }), className]}
	{...restProps}
/>
