<script lang="ts">
	import { buttonVariants } from "$lib/components/ui/button";
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AlertDialogPrimitive.ActionProps = $props();
</script>

<AlertDialogPrimitive.Action
	bind:ref
	data-slot="alert-dialog-action"
	class={[buttonVariants(), className]}
	{...restProps}
/>
