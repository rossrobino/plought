<script lang="ts">
	import Info from "$lib/components/Info.svelte";
	import AddAlternativeButton from "$lib/components/alternatives/AddAlternativeButton.svelte";
	import RemoveAlternativeButton from "$lib/components/alternatives/RemoveAlternativeButton.svelte";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { alternatives, criteria } from "$lib/state";

	interface Props {
		/** controls if criteria are displayed */
		showCriteria?: boolean;
		/** controls if alternative names are editable */
		editNames?: boolean;
		/** controls if add/remove alternative actions are displayed */
		manageList?: boolean;
	}

	let {
		showCriteria = false,
		editNames = true,
		manageList = true,
	}: Props = $props();
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<h2 class="mb-0">Alternatives</h2>
		<Info label="About alternatives">
			<div class="space-y-2">
				<p>Create alternatives for each option you are comparing.</p>
				<p>Examples: Ford F-150, Aston Martin DB9, Volvo XC60.</p>
			</div>
		</Info>
	</div>
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
						<Table.Head class="min-w-56">Name</Table.Head>
						{#each criteria.current as item}
							<Table.Head class="min-w-32">{item.name}</Table.Head>
						{/each}
						{#if manageList}
							<Table.Head class="w-16"></Table.Head>
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
