<script lang="ts">
	import Info from "$lib/components/Info.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import {
		type MethodKey,
		alternatives,
		criteria,
		markMethodUsed,
	} from "$lib/state";
	import XMark from "$lib/svg/XMark.svelte";
	import type { Criteria } from "$lib/types";
	import PlusIcon from "@lucide/svelte/icons/plus";

	interface Props {
		weights?: boolean;
		method?: MethodKey | null;
		editNames?: boolean;
		manageList?: boolean;
		tableView?: boolean;
	}

	/** controls if weights column is displayed*/
	let {
		weights = true,
		method = "weightedSum",
		editNames = true,
		manageList = true,
		tableView = true,
	}: Props = $props();
	let keepTotal = $state(true);

	const markUsed = () => {
		if (method == null) {
			return;
		}
		markMethodUsed(method);
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
			return new Array(count).fill(0);
		}
		const positive = values.map((value) => Math.max(0, value));
		const sum = positive.reduce((a, b) => a + b, 0);
		if (sum <= 0) {
			return new Array(count).fill(target / count);
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
		if (keepTotal) {
			normalizeCurrentWeights();
		}
		markUsed();
	};

	const removeCriteria = (index: number) => {
		criteria.current.splice(index, 1);
		alternatives.current.forEach((alt) => {
			alt.scores.splice(index, 1);
		});
		if (keepTotal && criteria.current.length > 0) {
			normalizeCurrentWeights();
		}
		markUsed();
	};

	const setWeightPercent = (index: number, value: number) => {
		const nextValue = clampPercent(value);
		if (!keepTotal) {
			criteria.current[index].weight = nextValue / 100;
			markUsed();
			return;
		}

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

	const setKeepTotal = (next: boolean) => {
		keepTotal = next;
		if (next) {
			normalizeCurrentWeights();
		}
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
		<h2 class="mb-0">Criteria</h2>
		<Info label="About criteria">
			<div class="space-y-2">
				<p>
					Create criteria for each factor in the decision and assign a weight
					from 0 to 100.
				</p>
				<p>For example: Safety = 50, Speed = 25, Price = 25.</p>
				<p>
					A higher weight means that criterion contributes more to the final
					score.
				</p>
			</div>
		</Info>
	</div>
	<Tooltip.Provider>
		{#if tableView}
			<ScrollArea
				class="mt-3 w-full rounded-md border whitespace-nowrap"
				orientation="horizontal"
			>
				<Table.Root class="min-w-full">
					<Table.Header>
						<Table.Row
							class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent"
						>
							<Table.Head class="min-w-56">Name</Table.Head>
							{#if weights}
								<Table.Head class="min-w-56">Weight</Table.Head>
							{/if}
							{#if manageList}
								<Table.Head class="w-16"></Table.Head>
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
														<XMark class="size-4" />
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
											<XMark class="size-4" />
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
		{#if weights}
			<label
				for="keep-total"
				class="flex cursor-default items-center gap-2 text-sm font-medium select-none"
			>
				<span id="keep-total-label">Keep total at 100%</span>
				<Switch
					id="keep-total"
					checked={keepTotal}
					onCheckedChange={setKeepTotal}
					aria-labelledby="keep-total-label"
				/>
			</label>
		{/if}
		{#if manageList}
			<Button onclick={addCriteria} size="sm">
				<PlusIcon />
				Add
			</Button>
		{/if}
	</div>
</section>
