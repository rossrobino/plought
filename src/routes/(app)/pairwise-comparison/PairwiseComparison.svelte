<script lang="ts">
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { alternatives } from "$lib/state";

	const updateInverse = (i: number, j: number) => {
		const newScore = alternatives.current[i].pairwise[j];
		alternatives.current[j].pairwise[i] =
			newScore > 0.5 ? 0 : newScore === 0.5 ? 0.5 : 1;
	};

	const updateScore = (i: number, j: number, value: string) => {
		alternatives.current[i].pairwise[j] = Number(value);
		updateInverse(i, j);
	};

	const getSelection = (i: number, j: number) => {
		return `${alternatives.current[i].pairwise[j]}`;
	};

	const getLabel = (i: number, j: number) => {
		if (alternatives.current[i].pairwise[j] === 1) {
			return alternatives.current[i].name;
		}
		if (alternatives.current[i].pairwise[j] === 0) {
			return alternatives.current[j].name;
		}
		return "Tie";
	};
</script>

<section>
	<h2>Comparisons</h2>
	<ScrollArea class="mt-4 w-full whitespace-nowrap rounded-md border" orientation="horizontal">
		<Table.Root class="min-w-full">
			<Table.Header>
				<Table.Row class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent">
					<Table.Head class="w-28"></Table.Head>
					{#each alternatives.current as { name }}
						<Table.Head class="min-w-40">{name}</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each alternatives.current as alt, i}
					<Table.Row>
						<Table.Head>{alt.name}</Table.Head>
						{#each alt.pairwise as _, j}
							<Table.Cell>
								{#if alternatives.current[i] !== alternatives.current[j]}
									{#if i < j}
										<Select.Root
											type="single"
											value={getSelection(i, j)}
											onValueChange={(value) => updateScore(i, j, value)}
										>
											<Select.Trigger class="h-8 w-full min-w-40 justify-between">
												{getLabel(i, j)}
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="1">
													{alternatives.current[i].name}
												</Select.Item>
												<Select.Item value="0.5">Tie</Select.Item>
												<Select.Item value="0">
													{alternatives.current[j].name}
												</Select.Item>
											</Select.Content>
										</Select.Root>
									{:else}
										{getLabel(i, j)}
									{/if}
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</ScrollArea>
</section>
