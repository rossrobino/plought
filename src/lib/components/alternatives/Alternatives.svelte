<script lang="ts">
	import AddAlternativeButton from "$lib/components/alternatives/AddAlternativeButton.svelte";
	import Info from "$lib/components/Info.svelte";
	import RemoveAlternativeButton from "$lib/components/alternatives/RemoveAlternativeButton.svelte";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { alternatives, criteria } from "$lib/state";

	interface Props {
		/** controls if criteria are displayed */
		showCriteria?: boolean;
	}

	let { showCriteria = false }: Props = $props();
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<h2 class="mb-0">Alternatives</h2>
		<Info label="About alternatives">
			<div class="space-y-2">
				<p>Create alternatives for each option you are comparing.</p>
				<p>
					Examples: Ford F-150, Aston Martin DB9, Volvo XC60.
				</p>
			</div>
		</Info>
	</div>
	<ScrollArea class="mt-4 w-full whitespace-nowrap rounded-md border" orientation="horizontal">
		<Table.Root class="min-w-full">
			<Table.Header>
				<Table.Row class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent">
					<Table.Head class="w-16"></Table.Head>
					<Table.Head class="min-w-56">Name</Table.Head>
					{#if showCriteria}
						{#each criteria.current as item}
							<Table.Head class="min-w-32">{item.name}</Table.Head>
						{/each}
					{/if}
					<Table.Head class="w-16"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each alternatives.current as alt, i}
					<Table.Row>
						<Table.Cell>
							<Label for={`alternative${i}`} class="text-muted-foreground">#{i + 1}</Label>
						</Table.Cell>
						<Table.Cell>
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
						</Table.Cell>
						{#if showCriteria}
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
						{/if}
						<Table.Cell>
							<RemoveAlternativeButton index={i} />
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</ScrollArea>
	<AddAlternativeButton />
</section>
