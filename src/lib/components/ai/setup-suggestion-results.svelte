<script lang="ts">
	import type { SuggestionResult } from "$lib/ai/types";
	import { Button } from "$lib/components/ui/button";
	import Eyebrow from "$lib/components/ui/eyebrow.svelte";
	import CheckIcon from "@lucide/svelte/icons/check";
	import PlusIcon from "@lucide/svelte/icons/plus";

	type Kind = "alternatives" | "criteria";
	type Props = {
		existing: string[];
		kind: Kind;
		onAdd: (name: string) => void;
		onAddAll: (names: string[]) => void;
		result: SuggestionResult;
	};

	let { existing, kind, onAdd, onAddAll, result }: Props = $props();

	const toNameKey = (value: string) => {
		return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
	};

	const existingSet = $derived(
		new Set(existing.map((value) => toNameKey(value))),
	);
	const remaining = $derived(
		result.items.filter((item) => !existingSet.has(toNameKey(item.name))),
	);
	const noun = $derived(kind === "alternatives" ? "alternatives" : "criteria");
</script>

<div
	aria-live="polite"
	class="mt-3 rounded-lg border bg-background p-3 shadow-xs"
>
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<Eyebrow class="mb-2">Summary</Eyebrow>
			<p
				class="text-sm text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 hover:[&_a]:text-foreground"
			>
				{@html result.summary}
			</p>
		</div>
		<Button
			size="sm"
			variant="outline"
			disabled={remaining.length === 0}
			onclick={() => onAddAll(remaining.map((item) => item.name))}
		>
			Add all
		</Button>
	</div>

	{#if result.items.length === 0}
		<p class="mt-3 text-sm text-muted-foreground">
			No new {noun} came back. Try adding a little more context.
		</p>
	{:else}
		<ul class="mt-3 grid gap-2">
			{#each result.items as item (item.name)}
				{@const added = existingSet.has(toNameKey(item.name))}
				<li class="rounded-lg border bg-muted/10 p-3 shadow-xs">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div class="min-w-0 flex-1">
							<p class="font-medium">{item.name}</p>
							<p
								class="mt-1 text-sm text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 hover:[&_a]:text-foreground"
							>
								{@html item.reason}
							</p>
						</div>
						<Button
							size="icon-sm"
							variant={added ? "secondary" : "outline"}
							aria-label={added ? `${item.name} added` : `Add ${item.name}`}
							title={added ? `${item.name} added` : `Add ${item.name}`}
							disabled={added}
							onclick={() => onAdd(item.name)}
						>
							{#if added}
								<CheckIcon class="size-3.5" />
							{:else}
								<PlusIcon class="size-3.5" />
							{/if}
						</Button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
