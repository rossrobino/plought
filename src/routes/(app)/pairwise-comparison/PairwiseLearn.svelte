<script lang="ts">
	import AboutAlternatives from "$lib/components/alternatives/AboutAlternatives.svelte";
	import * as Table from "$lib/components/ui/table/index.js";
</script>

<AboutAlternatives />

<section>
	<h2>Compare</h2>
	<p>
		Compare each <b>alternative</b>
		against each of the other
		<b>alternatives.</b>
	</p>
	<p>
		For example, if <b>Aston Martin DB9</b>
		is preferred over
		<b>Volvo XC60,</b>
		select
		<b>Aston Martin DB9.</b>
		If two options are equal, select
		<b>Tie.</b>
	</p>
</section>
<section>
	<h2>Score</h2>
	<p>
		Each
		<b>alternative</b>
		is scored based on it's comparison to each of the other
		<b>alternatives.</b>
	</p>

	<Table.Root>
		<Table.Header>
			<Table.Row class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent">
				<Table.Head>Choice</Table.Head>
				<Table.Head>Score</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			<Table.Row>
				<Table.Cell>Preferred</Table.Cell>
				<Table.Cell>+1</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell>Tie</Table.Cell>
				<Table.Cell>+0.5</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell>Unfavored</Table.Cell>
				<Table.Cell>0</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
	<p>
		The scores for each <b>alternative</b>
		are summed across the row and scored respectively. The highest score indicates
		the most frequently preferred
		<b>alternative.</b>
	</p>
</section>
