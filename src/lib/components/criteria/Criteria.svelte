<script lang="ts">
	import Info from "$lib/components/Info.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { alternatives, criteria } from "$lib/state";
	import XMark from "$lib/svg/XMark.svelte";
	import type { Criteria } from "$lib/types";

	interface Props {
		weights?: boolean;
	}

	/** controls if weights column is displayed*/
	let { weights = true }: Props = $props();

	const addCriteria = () => {
		criteria.current.push({
			name: `Criteria #${criteria.current.length + 1}`,
			weight: 0,
		});
		alternatives.current.forEach((alt) => {
			alt.scores.push(0);
		});
	};

	const removeCriteria = (index: number) => {
		criteria.current.splice(index, 1);
		alternatives.current.forEach((alt) => {
			alt.scores.splice(index, 1);
		});
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
					Create criteria for each factor in the decision and assign a weight from
					0 to 1.
				</p>
				<p>
					For example: Safety = 0.5, Speed = 0.25, Price = 0.25.
				</p>
				<p>
					A higher weight means that criterion contributes more to the final score.
				</p>
			</div>
		</Info>
	</div>
	<Tooltip.Provider>
		<ScrollArea class="mt-4 w-full whitespace-nowrap rounded-md border" orientation="horizontal">
			<Table.Root class="min-w-full">
				<Table.Header>
					<Table.Row class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent">
						<Table.Head class="w-16"></Table.Head>
						<Table.Head class="min-w-56">Name</Table.Head>
						{#if weights}
							<Table.Head class="min-w-40">Weight</Table.Head>
						{/if}
						<Table.Head class="w-16"></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each criteria.current as item, i (i)}
						<Table.Row>
							<Table.Cell>
								<Label for={`name${i}`} class="text-muted-foreground">#{i + 1}</Label>
							</Table.Cell>
							<Table.Cell>
								<Field.Field>
									<Input
										type="text"
										name="name"
										id={`name${i}`}
										bind:value={item.name}
										required
										placeholder="Criteria"
									/>
								</Field.Field>
							</Table.Cell>
							{#if weights}
								<Table.Cell>
									<Field.Field>
										<Input
											type="number"
											name="weight"
											id={`weight${i}`}
											bind:value={item.weight}
											step="0.01"
											min="0"
											max="1"
											required
											inputmode="decimal"
											placeholder="0"
										/>
									</Field.Field>
								</Table.Cell>
							{/if}
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
						</Table.Row>
					{/each}
					{#if weights}
						<Table.Row class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent">
							<Table.Head>Total</Table.Head>
							<Table.Cell></Table.Cell>
							<Table.Cell>
								<span class:text-destructive={Math.round(total * 100) !== 100}>
									{(total * 100).toFixed()}
								</span>
								/ 100
							</Table.Cell>
							<Table.Cell></Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</ScrollArea>
	</Tooltip.Provider>
	<Button onclick={addCriteria} class="mt-4 w-full" size="sm">Add</Button>
</section>
