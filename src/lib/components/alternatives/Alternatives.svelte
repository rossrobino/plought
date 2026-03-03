<script lang="ts">
	import Info from "$lib/components/Info.svelte";
	import AddAlternativeButton from "$lib/components/alternatives/AddAlternativeButton.svelte";
	import RemoveAlternativeButton from "$lib/components/alternatives/RemoveAlternativeButton.svelte";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import {
		type MethodKey,
		alternatives,
		criteria,
		markMethodUsed,
	} from "$lib/state";

	interface Props {
		/** controls if criteria are displayed */
		showCriteria?: boolean;
		/** controls if alternative names are editable */
		editNames?: boolean;
		/** controls if add/remove alternative actions are displayed */
		manageList?: boolean;
		/** method that should be marked as used for score edits */
		method?: MethodKey | null;
	}

	let {
		showCriteria = false,
		editNames = true,
		manageList = true,
		method = "weightedSum",
	}: Props = $props();
	const guidance = $derived(
		showCriteria
			? "Score each alternative from 0 to 10 for every criterion. Higher numbers mean a stronger fit for that criterion."
			: "Add the options you are deciding between.",
	);

	const markUsed = () => {
		if (method == null) {
			return;
		}
		markMethodUsed(method);
	};
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<h2 class="mb-0">Alternatives</h2>
		<Info label="About alternatives">
			<p>Examples: Ford F-150, Aston Martin DB9, Volvo XC60.</p>
		</Info>
	</div>
	<p class="mt-2 text-sm text-muted-foreground">{guidance}</p>
	{#if showCriteria}
		<ScrollArea
			class="mt-3 w-full rounded-md border whitespace-nowrap"
			orientation="horizontal"
		>
			<Table.Root class="min-w-full">
				<Table.Header>
					<Table.Row
						class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent"
					>
						<Table.Head class="min-w-56">
							<span class="sr-only">Alternative name</span>
						</Table.Head>
						{#each criteria.current as item}
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
					{#each alternatives.current as alt, i}
						<Table.Row>
							<Table.Head scope="row" class="font-semibold">
								{#if editNames}
									<Field.Field>
										<Input
											type="text"
											name={`alternative${i}`}
											id={`alternative${i}`}
											bind:value={alt.name}
											required
											placeholder="Alternative"
										/>
									</Field.Field>
								{:else}
									<span class="block truncate font-semibold">{alt.name}</span>
								{/if}
							</Table.Head>
							{#each alt.scores as _, j}
								<Table.Cell>
									<Field.Field>
										<Input
											type="number"
											name={`alternative${i}score${j}`}
											id={`alternative${i}score${j}`}
											bind:value={alt.scores[j]}
											oninput={markUsed}
											min="0"
											max="10"
											required
											inputmode="decimal"
											placeholder="0"
										/>
									</Field.Field>
								</Table.Cell>
							{/each}
							{#if manageList}
								<Table.Cell>
									<RemoveAlternativeButton index={i} />
								</Table.Cell>
							{/if}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</ScrollArea>
	{:else}
		<ul class="mt-3 grid gap-2">
			{#each alternatives.current as alt, i}
				<li class="flex items-center gap-2">
					<div class="min-w-0 flex-1">
						{#if editNames}
							<Field.Field>
								<Input
									type="text"
									name={`alternative${i}`}
									id={`alternative${i}`}
									bind:value={alt.name}
									required
									placeholder="Alternative"
								/>
							</Field.Field>
						{:else}
							<span class="block truncate font-semibold">{alt.name}</span>
						{/if}
					</div>
					{#if manageList}
						<RemoveAlternativeButton index={i} />
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if manageList}
		<AddAlternativeButton />
	{/if}
</section>
