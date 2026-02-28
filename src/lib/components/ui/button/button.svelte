<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap no-underline transition-all select-none outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 active:scale-[0.98] active:brightness-95 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		variants: {
			variant: {
				default:
					"border border-primary/45 bg-primary/45 text-foreground shadow-sm hover:bg-primary/55",
				destructive:
					"focus-visible:outline-destructive border border-border/80 bg-destructive text-white shadow-sm hover:opacity-90",
				outline:
					"border border-border/80 bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
				secondary:
					"border border-border/80 bg-secondary text-secondary-foreground shadow-sm hover:opacity-90",
				ghost: "border border-transparent shadow-none hover:bg-accent hover:text-accent-foreground",
				link: "border border-transparent p-0 text-primary shadow-none underline-offset-4 hover:underline active:scale-100 active:brightness-100",
			},
			size: {
				default: "h-14 px-6 has-[>svg]:px-5",
				sm: "h-10 gap-1.5 px-4 has-[>svg]:px-3",
				lg: "h-16 px-7 has-[>svg]:px-6",
				icon: "size-10",
				"icon-sm": "size-8",
				"icon-lg": "size-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
