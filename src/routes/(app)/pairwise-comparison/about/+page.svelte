<script lang="ts">
	import AboutAlternatives from "$lib/components/alternatives/AboutAlternatives.svelte";
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

	<table>
		<thead>
			<tr>
				<th>Choice</th>
				<th>Score</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Preferred</td>
				<td>+1</td>
			</tr>
			<tr>
				<td>Tie</td>
				<td>+0.5</td>
			</tr>
			<tr>
				<td>Unfavored</td>
				<td>0</td>
			</tr>
		</tbody>
	</table>
	<p>
		The scores for each <b>alternative</b>
		are summed across the row and scored respectively. The highest score indicates
		the most frequently preferred
		<b>alternative.</b>
	</p>
</section>
