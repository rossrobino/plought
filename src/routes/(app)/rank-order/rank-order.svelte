<script lang="ts">
	import Info from "$lib/components/info.svelte";
	import { Button } from "$lib/components/ui/button";
	import {
		alternatives,
		markAppUsed,
		markMethodUsed,
		normalizeRankOrder,
		rankOrder,
	} from "$lib/state";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import ChevronUpIcon from "@lucide/svelte/icons/chevron-up";
	import ChevronsDownIcon from "@lucide/svelte/icons/chevrons-down";
	import ChevronsUpIcon from "@lucide/svelte/icons/chevrons-up";
	import { flip } from "svelte/animate";

	const ranked = $derived.by(() => {
		const count = alternatives.current.length;
		const order = normalizeRankOrder(
			Array.isArray(rankOrder.current) ? rankOrder.current : [],
			count,
		);
		return order.map((id, i) => {
			return {
				id,
				i,
				name: alternatives.current[id]?.name ?? `Alternative #${id + 1}`,
			};
		});
	});

	const getOrder = () => {
		return normalizeRankOrder(
			Array.isArray(rankOrder.current) ? rankOrder.current : [],
			alternatives.current.length,
		);
	};

	const move = (items: number[], from: number, to: number) => {
		const next = [...items];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		return next;
	};

	const moveItem = (i: number, to: number) => {
		const order = getOrder();
		if (to < 0 || to >= order.length || i === to) {
			return;
		}
		markAppUsed("rank");
		markMethodUsed("rankOrder");
		rankOrder.current = move(order, i, to);
	};

	$effect(() => {
		const order = getOrder();
		if (
			order.length !== rankOrder.current.length ||
			order.some((id, i) => id !== rankOrder.current[i])
		) {
			rankOrder.current = order;
		}
	});
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<h2 class="mb-0">Rank</h2>
		<Info label="About rank">
			<div class="space-y-2">
				<p>Order alternatives from most to least preferred.</p>
				<p>
					The first item is your top choice and the last item is your lowest.
				</p>
			</div>
		</Info>
	</div>
	<p class="mt-1 text-sm text-muted-foreground">
		Use controls to move alternatives one step or send them to the top/bottom.
	</p>
	<p class="mt-1 text-sm text-muted-foreground">
		Order meaning: top = most preferred, bottom = least preferred.
	</p>

	<ol class="mt-3 flex flex-col gap-2">
		{#each ranked as item (item.id)}
			<li
				animate:flip={{ duration: 180 }}
				class="list-none rounded-lg border bg-card p-2 shadow-xs"
				aria-label={`Rank ${item.i + 1}: ${item.name}`}
			>
				<div class="flex items-center gap-2">
					<div class="min-w-0 flex-1">
						<p class="truncate font-medium">{item.name}</p>
					</div>
					<div class="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							disabled={item.i === 0}
							onclick={() => moveItem(item.i, 0)}
							aria-label={`Send ${item.name} to top`}
						>
							<ChevronsUpIcon class="size-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							disabled={item.i === 0}
							onclick={() => moveItem(item.i, item.i - 1)}
							aria-label={`Move ${item.name} up`}
						>
							<ChevronUpIcon class="size-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							disabled={item.i === ranked.length - 1}
							onclick={() => moveItem(item.i, item.i + 1)}
							aria-label={`Move ${item.name} down`}
						>
							<ChevronDownIcon class="size-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							disabled={item.i === ranked.length - 1}
							onclick={() => moveItem(item.i, ranked.length - 1)}
							aria-label={`Send ${item.name} to bottom`}
						>
							<ChevronsDownIcon class="size-4" />
						</Button>
					</div>
				</div>
			</li>
		{/each}
	</ol>
</section>
