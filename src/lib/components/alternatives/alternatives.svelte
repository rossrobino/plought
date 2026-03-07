<script lang="ts">
	import AddAlternativeButton from "$lib/components/alternatives/add-alternative-button.svelte";
	import RemoveAlternativeButton from "$lib/components/alternatives/remove-alternative-button.svelte";
	import Info from "$lib/components/info.svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Field from "$lib/components/ui/field";
	import { Input } from "$lib/components/ui/input";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import SectionHeader from "$lib/components/ui/section-header.svelte";
	import * as Table from "$lib/components/ui/table";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import {
		type MethodKey,
		alternatives,
		criteria,
		markMethodUsed,
	} from "$lib/state";
	import SearchIcon from "@lucide/svelte/icons/search";

	interface Props {
		/** controls if criteria are displayed */
		showCriteria?: boolean;
		/** controls if alternative names are editable */
		editNames?: boolean;
		/** controls if add/remove alternative actions are displayed */
		manageList?: boolean;
		/** method that should be marked as used for score edits */
		method?: MethodKey | null;
		/** optional callback for any alternative data changes */
		onChange?: () => void;
		/** currently selected score cell for research */
		activeCell?: { alternativeIndex: number; criterionIndex: number } | null;
		/** optional callback to research a specific score cell */
		onResearch?: (alternativeIndex: number, criterionIndex: number) => void;
	}

	let {
		showCriteria = false,
		editNames = true,
		manageList = true,
		method = "weightedSum",
		onChange,
		activeCell = null,
		onResearch,
	}: Props = $props();
	const guidance = $derived(
		showCriteria
			? "Score each alternative from 0 to 10 for every criterion. Higher numbers mean a stronger fit for that criterion."
			: "",
	);

	const markUsed = () => {
		if (method == null) {
			return;
		}
		markMethodUsed(method);
	};

	const notify = () => {
		onChange?.();
	};

	const updateScore = () => {
		markUsed();
		notify();
	};

	const isActiveCell = (alternativeIndex: number, criterionIndex: number) => {
		return (
			activeCell?.alternativeIndex === alternativeIndex &&
			activeCell?.criterionIndex === criterionIndex
		);
	};
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<div class="min-w-0 flex-1">
			<SectionHeader title="Alternatives" desc={guidance} descClass="text-sm" />
		</div>
		<Info label="About alternatives">
			<p>Examples: Ford F-150, Aston Martin DB9, Volvo XC60.</p>
		</Info>
	</div>
	{#if showCriteria}
		<Tooltip.Provider>
			<ScrollArea
				class="mt-3 w-full rounded-md border whitespace-nowrap"
				orientation="horizontal"
			>
				<Table.Root class="min-w-full">
					<caption class="sr-only">Alternative scores by criterion.</caption>
					<Table.Header>
						<Table.Row
							class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent"
						>
							<Table.Head class="min-w-56">
								<span class="sr-only">Alternative name</span>
							</Table.Head>
							{#each criteria.current as item (item)}
								<Table.Head class="min-w-32">{item.name}</Table.Head>
							{/each}
							{#if manageList}
								<Table.Head class="w-16">
									<span class="sr-only">Actions</span>
								</Table.Head>
							{/if}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each alternatives.current as alt, i (alt)}
							<Table.Row>
								<Table.Head scope="row" class="font-semibold">
									{#if editNames}
										<Field.Field>
											<Input
												type="text"
												name={`alternative${i}`}
												id={`alternative${i}`}
												bind:value={alt.name}
												oninput={notify}
												required
												placeholder="Alternative"
											/>
										</Field.Field>
									{:else}
										<span class="block truncate font-semibold">{alt.name}</span>
									{/if}
								</Table.Head>
								{#each alt.scores as _, j (`score-${j}`)}
									<Table.Cell class={isActiveCell(i, j) ? "bg-accent/15" : ""}>
										<div class="flex items-center gap-2">
											<Field.Field class="min-w-0 flex-1">
												<Input
													type="number"
													name={`alternative${i}score${j}`}
													id={`alternative${i}score${j}`}
													bind:value={alt.scores[j]}
													oninput={updateScore}
													min="0"
													max="10"
													required
													inputmode="decimal"
													placeholder="0"
												/>
											</Field.Field>
											{#if onResearch != null}
												<Tooltip.Root>
													<Tooltip.Trigger>
														{#snippet child({ props })}
															<Button
																{...props}
																size="icon-sm"
																variant={isActiveCell(i, j)
																	? "secondary"
																	: "outline"}
																aria-label={`Research ${alt.name} for ${criteria.current[j]?.name ?? "this criterion"}`}
																onclick={() => onResearch(i, j)}
															>
																<SearchIcon class="size-3.5" />
															</Button>
														{/snippet}
													</Tooltip.Trigger>
													<Tooltip.Content sideOffset={8}>
														Research {alt.name} for {criteria.current[j]
															?.name ?? "this criterion"}
													</Tooltip.Content>
												</Tooltip.Root>
											{/if}
										</div>
									</Table.Cell>
								{/each}
								{#if manageList}
									<Table.Cell>
										<RemoveAlternativeButton index={i} onChange={notify} />
									</Table.Cell>
								{/if}
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</ScrollArea>
		</Tooltip.Provider>
	{:else}
		<ul class="mt-3 grid gap-2">
			{#each alternatives.current as alt, i (alt)}
				<li class="flex items-center gap-2">
					<div class="min-w-0 flex-1">
						{#if editNames}
							<Field.Field>
								<Input
									type="text"
									name={`alternative${i}`}
									id={`alternative${i}`}
									bind:value={alt.name}
									oninput={notify}
									required
									placeholder="Alternative"
								/>
							</Field.Field>
						{:else}
							<span class="block truncate font-semibold">{alt.name}</span>
						{/if}
					</div>
					{#if manageList}
						<RemoveAlternativeButton index={i} onChange={notify} />
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if manageList}
		<AddAlternativeButton onChange={notify} />
	{/if}
</section>
