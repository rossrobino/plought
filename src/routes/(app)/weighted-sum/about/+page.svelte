<script lang="ts">
	import AboutAlternatives from "$lib/components/alternatives/AboutAlternatives.svelte";
	import { Icon } from "@liquidiqq/iconkit";
</script>

<section>
	<h2>
		<span class="icon"><Icon name="scale" /></span>
		Add Criteria
	</h2>
	<p>
		Create <b>criteria</b>
		for each factor impacting a decision. Give each
		<b>criteria</b>
		a
		<b>weight</b>
		based on how much it impacts the decision.
	</p>
	<p>
		For example, when trying to decide which car to buy the <b>criteria</b>
		might be:
	</p>
	<ul>
		<li>Safety = 0.5</li>
		<li>Speed = 0.25</li>
		<li>Price = 0.25</li>
	</ul>
	<p>
		For each of these a <b>weight</b>
		is assigned based on how much the criteria impacts the decision. In this case
		<b>Safety</b>
		would make up 50% of the decision.
	</p>
</section>

<AboutAlternatives />
<section>
	<h2>
		<span class="icon"><Icon name="chart-bar-square" /></span>
		Score
	</h2>
	<p>
		Give each <b>alternative</b>
		a score (0 - 10) for each
		<b>criteria</b>
		being considered. A higher score indicates a more preferable choice.
	</p>
	<p>
		It's important to score each
		<b>criteria</b>
		independently of the others, use the weights to influence which
		<b>criteria</b>
		is the most important.
	</p>
	<p>
		Each <b>alternative</b>
		is scored by multiplying the score for each
		<b>criteria</b>
		by it's respective weight and then adding all of the scores for the
		<b>alternative</b>
		together.
	</p>
</section>
