<script lang="ts">
	import Info from "$lib/components/info.svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Field from "$lib/components/ui/field";
	import { Input } from "$lib/components/ui/input";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import SectionHeader from "$lib/components/ui/section-header.svelte";
	import { Slider } from "$lib/components/ui/slider";
	import * as Table from "$lib/components/ui/table";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import {
		type MethodKey,
		alternatives,
		criteria,
		markMethodUsed,
		syncAllocation,
	} from "$lib/state";
	import type { Criteria } from "$lib/types";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import XIcon from "@lucide/svelte/icons/x";

	interface Props {
		weights?: boolean;
		method?: MethodKey | null;
		editNames?: boolean;
		manageList?: boolean;
		tableView?: boolean;
		onChange?: () => void;
	}

	/** controls if weights column is displayed*/
	let {
		weights = true,
		method = "weightedSum",
		editNames = true,
		manageList = true,
		tableView = true,
		onChange,
	}: Props = $props();
	const guidance = $derived(
		weights
			? "Set each criterion as a percentage of importance so weighted analyses reflect your priorities across all alternatives."
			: "List the factors you will use to evaluate alternatives.",
	);

	const markUsed = () => {
		if (method != null) {
			markMethodUsed(method);
		}
		onChange?.();
	};

	const clampPercent = (value: number) => {
		return Math.max(0, Math.min(100, Math.round(value)));
	};

	const clampWeight = (value: number) => {
		return Math.max(0, Math.min(100, value));
	};

	const toPercent = (value: number) => {
		if (!Number.isFinite(value)) {
			return 0;
		}
		return clampPercent(value * 100);
	};

	const toWeightPercent = (value: number) => {
		if (!Number.isFinite(value)) {
			return 0;
		}
		return clampWeight(value * 100);
	};

	const setWeightsFromPercent = (weights: number[]) => {
		weights.forEach((weight, i) => {
			if (criteria.current[i] == null) {
				return;
			}
			criteria.current[i].weight = clampWeight(weight) / 100;
		});
	};

	const normalizePercent = (values: number[], target = 100) => {
		const count = values.length;
		if (count === 0) {
			return [];
		}
		if (target <= 0) {
			return Array.from({ length: count }, () => 0);
		}
		const positive = values.map((value) => Math.max(0, value));
		const sum = positive.reduce((a, b) => a + b, 0);
		if (sum <= 0) {
			return Array.from({ length: count }, () => target / count);
		}
		return positive.map((value) => (value / sum) * target);
	};

	const normalizeCurrentWeights = () => {
		const current = criteria.current.map((item) =>
			toWeightPercent(item.weight),
		);
		const next = normalizePercent(current, 100);
		if (next.some((value, i) => Math.abs(value - current[i]) > 0.001)) {
			setWeightsFromPercent(next);
			markUsed();
		}
	};

	const addCriteria = () => {
		criteria.current.push({
			name: `Criterion #${criteria.current.length + 1}`,
			weight: 0,
		});
		alternatives.current.forEach((alt) => {
			alt.scores.push(0);
		});
		syncAllocation();
		normalizeCurrentWeights();
		markUsed();
	};

	const removeCriteria = (index: number) => {
		criteria.current.splice(index, 1);
		alternatives.current.forEach((alt) => {
			alt.scores.splice(index, 1);
		});
		syncAllocation();
		if (criteria.current.length > 0) {
			normalizeCurrentWeights();
		}
		markUsed();
	};

	const setWeightPercent = (index: number, value: number) => {
		const nextValue = clampPercent(value);
		const current = criteria.current.map((item) =>
			toWeightPercent(item.weight),
		);
		if (Math.abs(current[index] - nextValue) < 0.001) {
			return;
		}

		if (current.length === 1) {
			criteria.current[0].weight = 1;
			markUsed();
			return;
		}

		const otherIndices = current.map((_, i) => i).filter((i) => i !== index);
		const targetOthers = 100 - nextValue;
		const next = [...current];
		next[index] = nextValue;

		if (targetOthers <= 0) {
			otherIndices.forEach((i) => {
				next[i] = 0;
			});
		} else {
			const redistributed = normalizePercent(
				otherIndices.map((i) => current[i]),
				targetOthers,
			);
			otherIndices.forEach((item, i) => {
				next[item] = redistributed[i];
			});
		}

		setWeightsFromPercent(next);
		markUsed();
	};

	const getWeights = (criteria: Criteria[]) => {
		return criteria.map(({ weight }) => {
			return weight;
		});
	};

	const sumArray = (a: number[]) => {
		return a.reduce((a, b) => a + b, 0);
	};

	const total = $derived(sumArray(getWeights(criteria.current)));
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<div class="min-w-0 flex-1">
			<SectionHeader title="Criteria" desc={guidance} descClass="text-sm" />
		</div>
		<Info label="About criteria">
			{#if weights}
				<div class="space-y-2">
					<p>
						Use criteria to represent the factors that matter most to this
						decision.
					</p>
					<p>
						Set each weight as a percentage of importance. Higher weight means
						more influence on the final weighted result.
					</p>
					<p>Example criteria: Safety, Reliability, Cost, Speed.</p>
				</div>
			{:else}
				<div class="space-y-2">
					<p>
						Use criteria to represent the factors that matter most to this
						decision.
					</p>
					<p>Example criteria: Safety, Reliability, Cost, Speed.</p>
				</div>
			{/if}
		</Info>
	</div>
	<Tooltip.Provider>
		{#if tableView}
			<ScrollArea
				class="mt-3 w-full rounded-md border whitespace-nowrap"
				orientation="horizontal"
			>
				<Table.Root class="min-w-full">
					<caption class="sr-only">Criteria and their current weights.</caption>
					<Table.Header>
						<Table.Row
							class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent"
						>
							<Table.Head class="min-w-56">
								<span class="sr-only">Criterion name</span>
							</Table.Head>
							{#if weights}
								<Table.Head class="min-w-56">Weight</Table.Head>
							{/if}
							{#if manageList}
								<Table.Head class="w-16">
									<span class="sr-only">Actions</span>
								</Table.Head>
							{/if}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each criteria.current as item, i (i)}
							<Table.Row>
								<Table.Head scope="row" class="font-semibold">
									{#if editNames}
										<Field.Field>
											<Input
												type="text"
												name="name"
												id={`name${i}`}
												bind:value={item.name}
												oninput={markUsed}
												required
												placeholder="Criteria"
											/>
										</Field.Field>
									{:else}
										<span class="block truncate font-semibold">
											{item.name}
										</span>
									{/if}
								</Table.Head>
								{#if weights}
									<Table.Cell>
										<div class="flex min-w-56 items-center gap-3">
											<Slider
												id={`weight${i}`}
												min={0}
												max={100}
												step={1}
												label={`Weight for ${item.name}`}
												text={`${toPercent(item.weight)}%`}
												value={toPercent(item.weight)}
												onValueChange={(value) => setWeightPercent(i, value)}
											/>
											<span
												class="w-11 text-right text-sm text-muted-foreground"
											>
												{toPercent(item.weight)}%
											</span>
										</div>
									</Table.Cell>
								{/if}
								{#if manageList}
									<Table.Cell>
										<Tooltip.Root>
											<Tooltip.Trigger>
												{#snippet child({ props })}
													<Button
														{...props}
														variant="secondary"
														size="icon-sm"
														aria-disabled={criteria.current.length < 2}
														class={criteria.current.length < 2
															? "aria-disabled:pointer-events-auto"
															: undefined}
														onclick={() => {
															if (criteria.current.length >= 2) {
																removeCriteria(i);
															}
														}}
														aria-label={`Remove criteria ${i + 1}`}
													>
														<XIcon class="size-4" />
													</Button>
												{/snippet}
											</Tooltip.Trigger>
											{#if criteria.current.length < 2}
												<Tooltip.Content sideOffset={8}>
													At least two criteria are required.
												</Tooltip.Content>
											{/if}
										</Tooltip.Root>
									</Table.Cell>
								{/if}
							</Table.Row>
						{/each}
						{#if weights}
							<Table.Row
								class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent"
							>
								<Table.Head scope="row" class="font-semibold">Total</Table.Head>
								<Table.Cell>
									<span
										class:text-destructive={Math.round(total * 100) !== 100}
									>
										{(total * 100).toFixed()}
									</span>
									/ 100
								</Table.Cell>
								{#if manageList}
									<Table.Cell></Table.Cell>
								{/if}
							</Table.Row>
						{/if}
					</Table.Body>
				</Table.Root>
			</ScrollArea>
		{:else}
			<ul class="mt-3 grid gap-2">
				{#each criteria.current as item, i (i)}
					<li class="flex items-center gap-2">
						<div class="min-w-0 flex-1">
							{#if editNames}
								<Field.Field>
									<Input
										type="text"
										name="name"
										id={`name${i}`}
										bind:value={item.name}
										oninput={markUsed}
										required
										placeholder="Criteria"
									/>
								</Field.Field>
							{:else}
								<span class="block truncate font-semibold">{item.name}</span>
							{/if}
						</div>
						{#if manageList}
							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="secondary"
											size="icon-sm"
											aria-disabled={criteria.current.length < 2}
											class={criteria.current.length < 2
												? "aria-disabled:pointer-events-auto"
												: undefined}
											onclick={() => {
												if (criteria.current.length >= 2) {
													removeCriteria(i);
												}
											}}
											aria-label={`Remove criteria ${i + 1}`}
										>
											<XIcon class="size-4" />
										</Button>
									{/snippet}
								</Tooltip.Trigger>
								{#if criteria.current.length < 2}
									<Tooltip.Content sideOffset={8}>
										At least two criteria are required.
									</Tooltip.Content>
								{/if}
							</Tooltip.Root>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</Tooltip.Provider>
	<div class="mt-3 flex flex-wrap items-center justify-end gap-4">
		{#if manageList}
			<Button onclick={addCriteria} size="sm">
				<PlusIcon />
				Add
			</Button>
		{/if}
	</div>
</section>
